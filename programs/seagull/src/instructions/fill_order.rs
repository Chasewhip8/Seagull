use anchor_lang::prelude::*;
use anchor_spl::token::{Token};

use crate::pda::{User, Market, OrderQueue};
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(size: u64, side: Side, expected_return: u64, a_end: u64, b_end: u64)]
pub struct FillOrder<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    market: Box<Account<'info, Market>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    #[account(mut)]
    user: Box<Account<'info, User>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> FillOrder<'info> {
    pub fn validate(&self) -> Result<()> {
        assert_eq!(self.user.authority.key(), self.authority.key()); // Ensure the user account belongs to the user!
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());
        // TODO Fill order validation
        Ok(())
    }

    pub fn handle(&mut self) -> Result<()> {
        // TODO Fill order logic
        Ok(())
    }
}