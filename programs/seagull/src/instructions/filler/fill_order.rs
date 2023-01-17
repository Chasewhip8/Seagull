use anchor_lang::prelude::*;
use anchor_spl::token::{Token};

use crate::pda::{Filler, Market, OrderQueue};
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

impl<'info> FillOrder<'info> {
    pub fn validate(&self) -> Result<()> {
        assert_eq!(self.filler.authority.key(), self.authority.key());
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());
        Ok(())
    }

    pub fn handle(&mut self) -> Result<()> {
        Ok(())
    }
}