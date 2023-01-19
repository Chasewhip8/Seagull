use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::pda::{Market, User};

#[derive(Accounts)]
#[instruction(order_id: u128)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    market: Box<Account<'info, Market>>,

    #[account(address = market.base_mint)]
    base_mint: Box<Account<'info, Mint>>,

    #[account(address = market.quote_mint)]
    quote_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    order_user: Box<Account<'info, User>>,

    #[account(mut)]
    order_filler: Box<Account<'info, User>>,

    // system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> PlaceOrder<'info> {
    pub fn validate(&self) -> Result<()> {
        todo!()
    }

    pub fn handle(&mut self) -> Result<()> {
        todo!()
    }
}