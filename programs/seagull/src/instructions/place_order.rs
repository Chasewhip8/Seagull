use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Slot;
use anchor_spl::token::{Token};
use sokoban::NodeAllocatorMap;
use crate::constants::{A_MAX_T, A_MIN_T, B_MAX_T, B_MIN_T};

use crate::pda::{Filler, Market, OrderInfo, OrderQueue};
use crate::error::SeagullError;
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(size: u64, side: Side, expected_return: u64, a_end: Slot, b_end: Slot)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    market: Box<Account<'info, Market>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    #[account(
        mut,
        seeds = [
            b"Filler".as_ref(),
            authority.key().as_ref(),
            market.key().as_ref()
        ],
        bump
    )]
    filler: Box<Account<'info, Filler>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> PlaceOrder<'info> {
    pub fn validate(&self, size: u64, expected_return: u64, a_end: Slot, b_end: Slot) -> Result<()> {
        // Validation of the filler account is done through seeds requiring the authority key to derive
        // their filler.
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        assert_ne!(size, 0); // Orders cannot be 0.
        assert_ne!(expected_return, 0); // Make sure they get something back

        assert!(b_end >= a_end, "Backstop end needs to be greater than or equal to auction end");

        // Assert that the auction times fall within the acceptable range to reduce spam attacks.
        let current_slot = self.clock.slot;

        let offset_a_end = a_end.checked_sub(current_slot).unwrap();
        assert!(A_MIN_T <= offset_a_end && offset_a_end <= A_MAX_T);

        let offset_b_end = b_end.checked_sub(current_slot).unwrap();
        assert!(B_MIN_T <= offset_b_end && offset_b_end <= B_MAX_T);

        Ok(())
    }

    pub fn handle(&mut self, size: u64, side: Side, expected_return: u64, a_end: Slot, b_end: Slot) -> Result<()> {
        let order = OrderInfo::from(size, side, expected_return, a_end, b_end);

        let order_queue = &mut self.order_queue.load_mut()?.queue;
        let insert_node = order_queue.insert(order.get_key(), order);
        if insert_node.is_none() {
            return Err(error!(SeagullError::OrderQueueFull));
        }

        Ok(())
    }
}