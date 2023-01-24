use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;

use sokoban::{NodeAllocatorMap, ZeroCopy};

use crate::error::SeagullError;
use crate::events::{OrderMatchedEvent, OrderRematchFailEvent};
use crate::pda::{FillerInfo, Market, OrderInfo, OrderQueue, OrderQueueType, User};
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64)]
pub struct FillOrder<'info> {
    authority: Signer<'info>,
    
    #[account(mut)]
    filler: Box<Account<'info, User>>,

    #[account(mut)]
    filler_side_account: Box<Account<'info, TokenAccount>>, // Mint is enforced to be the correct side in validation below!
    side_mint: Box<Account<'info, Mint>>,

    market: Box<Account<'info, Market>>,

    #[account(
        mut,
        token::mint = side_mint
    )]
    side_holding_account: Box<Account<'info, TokenAccount>>, // Account inside of the market struct to hold assets that are locked

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> FillOrder<'info> {
    pub fn validate(&self, filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64) -> Result<()> {
        assert_eq!(self.filler.authority.key(), self.authority.key()); // Ensure the user account belongs to the user!
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Validation of the instruction side and the passed in accounts, ensuring the mints match.
        let (side_mint, _) = self.market.get_market_info_for_side(filler_side);
        assert_eq!(self.side_mint.key(), side_mint);

        // Validation of the user side account and the corresponding side mint passed in.
        assert_eq!(self.filler_side_account.mint.key(), self.side_mint.key());

        assert_ne!(filler_size, 0);
        assert!(filler_price >= self.market.min_tick_size); // Make sure they get something back
        assert!(self.market.price_tick_aligned(filler_price));
        assert!(filler_expire_slot >= self.clock.slot); // Ensure the fill is not expired.

        Ok(())
    }

    pub fn handle(&mut self, filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64) -> Result<()> {
        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueType = OrderQueueType::load_mut_bytes(buf).unwrap();

        if order_queue.len() == 0 {
            return Err(error!(SeagullError::OrderQueueEmpty));
        }

        // Match the order and redistribute others or error.
        // We do NOT error if we fail to redistribute other orders, just fail if we cannot match our own.
        self.match_order(
            order_queue,
            filler_side,
            FillerInfo {
                id: self.filler.user_id,
                price: filler_price,
                max_size: filler_size,
                expire_slot: filler_expire_slot
            }
        )?;

        self.transfer_to_market_cpi(filler_size)?;

        Ok(())
    }

    fn match_order(&self, order_queue: &mut OrderQueueType, filler_side: Side, mut filler_info: FillerInfo) -> Result<()> {
        let mut is_first_order = true;
        let mut last_matched_order_id = 0;

        loop {
            let mut matched = false;

            for (key, order_info) in order_queue.iter_mut() {
                let key = *key;

                if OrderInfo::get_side_from_key(key) == filler_side // We cannot fill our own side.
                    || order_info.a_end > filler_info.expire_slot
                    || order_info.price > filler_info.price // We cannot provide a good enough price to fill this order
                    || (order_info.has_filler() && order_info.filler_info.price >= filler_info.price) { // We cant beat the current price.
                    continue;
                }

                last_matched_order_id = key;
                std::mem::swap(&mut order_info.filler_info, &mut filler_info);
                matched = true;

                // Emit an even to log when we fill
                emit!(OrderMatchedEvent {
                    market: self.market.key(),
                    order_id: key,
                    new_filler_id: order_info.filler_info.id,
                    replaced_filer_id: filler_info.id
                });
            }

            // This condition will only ever be false when the first, our initial, order fails to match.
            if !matched {
                if is_first_order{
                    return Err(error!(SeagullError::OrderNotMatched));
                }

                emit!(OrderRematchFailEvent {
                    market: self.market.key(),
                    original_order_id: last_matched_order_id,
                    filler_id: filler_info.id
                });
                return Ok(());
            }

            // We swapped order infos above so this is true when we finish redistributing orders.
            if !filler_info.is_valid() {
                return Ok(());
            }

            is_first_order = false; // Not the first order anymore on the next iteration if we got here.
        }
    }

    fn transfer_to_market_cpi(&self, amount: u64) -> ProgramResult {
        invoke(
            &transfer_checked(
                self.token_program.key,
                &self.filler_side_account.key(),
                &self.side_mint.key(),
                &self.side_holding_account.key(),
                self.authority.key,
                &[],
                amount,
                self.side_mint.decimals,
            )?,
            &[
                self.filler_side_account.to_account_info(),
                self.side_mint.to_account_info(),
                self.side_holding_account.to_account_info(),
                self.authority.to_account_info()
            ]
        )
    }
}