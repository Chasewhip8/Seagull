use anchor_lang::prelude::*;
use anchor_spl::token::{Token};
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};
use crate::constants::{A_MAX_T, A_MIN_T, B_MAX_T, B_MIN_T};

use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueCritbit, User};
use crate::error::SeagullError;
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(user_id: u64, size: u64, side: Side, lowest_price: u64, a_end: u64, b_end: u64)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    user: Box<Account<'info, User>>,

    #[account(mut)]
    market: Box<Account<'info, Market>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> PlaceOrder<'info> {
    pub fn validate(&self, size: u64, lowest_price: u64, a_end: u64, b_end: u64) -> Result<()> {
        // Validation of the user account is done through seeds requiring the authority key to derive
        // their filler.
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Validation of the market inside the user account being the same as the one we are placing
        // an order on.
        assert_eq!(self.market.key(), self.user.market.key());

        assert_ne!(size, 0); // Orders cannot be 0.
        assert_ne!(lowest_price, 0); // Make sure they get something back

        assert!(b_end >= a_end, "Backstop end needs to be greater than or equal to auction end");

        // Assert that the auction times fall within the acceptable range to reduce spam attacks.
        let current_slot = self.clock.slot;

        let offset_a_end = a_end.checked_sub(current_slot).unwrap();
        assert!(A_MIN_T <= offset_a_end && offset_a_end <= A_MAX_T);

        let offset_b_end = b_end.checked_sub(current_slot).unwrap();
        assert!(B_MIN_T <= offset_b_end && offset_b_end <= B_MAX_T);

        Ok(())
    }

    pub fn handle(&mut self, size: u64, side: Side, lowest_price: u64, a_end: u64, b_end: u64) -> Result<()> {
        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueCritbit = Critbit::load_mut_bytes(buf).unwrap();

        let order = OrderInfo::from(size, side, a_end, b_end);
        let order_key = OrderInfo::get_key(lowest_price, self.user.user_id);

        let insert_node = order_queue.insert(order_key, order);
        if insert_node.is_none() {
            return Err(error!(SeagullError::OrderQueueFull));
        }

        Ok(())
    }
}