use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::pda::{User, Market};

#[derive(Accounts)]
#[instruction(user_id: u64)]
pub struct InitUser<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    market: Box<Account<'info, Market>>,

    quote_mint: Box<Account<'info, Mint>>,

    #[account(token::mint = quote_mint)]
    quote_account: Box<Account<'info, TokenAccount>>,

    base_mint: Box<Account<'info, Mint>>,

    #[account(token::mint = base_mint)]
    base_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        space = User::LEN + 8,
        seeds = [
            b"Filler".as_ref(),
            market.key().as_ref(),
            user_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    user: Box<Account<'info, User>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>
}

impl<'info> InitUser<'info> {
    pub fn validate(&self) -> Result<()> {
        assert_eq!(self.market.base_mint.key(), self.base_mint.key());
        assert_eq!(self.market.quote_mint.key(), self.quote_mint.key());

        Ok(())
    }

    pub fn handle(&mut self) -> Result<()> {
        let user = &mut self.user;
        user.authority = self.authority.key();
        user.market = self.market.key();
        user.quote_account = self.quote_mint.key();
        user.quote_locked = 0;
        user.base_account = self.base_account.key();
        user.base_locked = 0;
        Ok(())
    }
}