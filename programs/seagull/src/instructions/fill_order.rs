use anchor_lang::prelude::*;
use anchor_spl::token::{Token};
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};

use crate::pda::{User, Market, OrderQueue, OrderQueueCritbit, OrderInfo, FillerInfo};
use crate::error::SeagullError;
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64)]
pub struct FillOrder<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    market: Box<Account<'info, Market>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    #[account(mut)]
    filler: Box<Account<'info, User>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> FillOrder<'info> {
    pub fn validate(&self, filler_size: u64, filler_price: u64, filler_max_a_end: u64) -> Result<()> {
        assert_eq!(self.filler.authority.key(), self.authority.key()); // Ensure the user account belongs to the user!
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        assert_ne!(filler_size, 0);
        assert_ne!(filler_price, 0);
        assert!(filler_max_a_end >= self.clock.slot); // Ensure the fill is not expired.

        Ok(())
    }

    pub fn handle(&mut self, filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64) -> Result<()> {
        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueCritbit = Critbit::load_mut_bytes(buf).unwrap();

        if order_queue.len() == 0 {
            return Err(error!(SeagullError::OrderQueueEmpty));
        }
        
        if FillOrder::fill_order(
            order_queue, 
            filler_side, 
            FillerInfo { 
                id: self.filler.user_id,
                price: filler_price,
                max_size: filler_size,
                expire_slot: filler_expire_slot
            }
        ) { 
            msg!("Filled!");
        }

        Ok(())
    }

    fn fill_order(mut order_queue: &OrderQueueCritbit, filler_side: Side, mut filler_info: FillerInfo) -> bool {
        let mut rematch = false;
        let mut matched_initial = false;
        let mut is_first = true;

        loop {
            for (key, order_info) in order_queue.iter_mut() {
                let side = OrderInfo::get_side_from_key(*key);

                let asking_price = OrderInfo::get_price_from_key(*key);
                if order_info.a_end > filler_info.expire_slot
                    || asking_price > filler_info.price // We cannot provide a good enough price to fill this order
                    || side == filler_side // We cannot fill our own side.
                    || (order_info.has_filler() && order_info.filler_info.price >= filler_info.price) { // We cant beat the current price.
                    continue;
                }

                // This order can be matched with our filler.
                if is_first {
                    matched_initial = true;
                }
                
                if order_info.has_filler() {
                    // There was an existing filler! But we beat their price, we will try and kindly rematch theirs as well.
                    let old_filler = order_info.filler_info.clone();
                    order_info.filler_info = filler_info;
                    filler_info = old_filler;

                    // Set rematch to true so we can go through the entire order_queue again. TODO check if this is needed, if the items are sorted maybe not?
                    rematch = true;
                    break
                } else {
                    order_info.filler_info = filler_info;
                }
            }

            is_first = false;

            if rematch {
                rematch = false;
            } else {
                return matched_initial; // Success! We matched our order and maybe a few we misplaced!
            }
        }
    }
}