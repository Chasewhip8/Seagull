use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::pda::{Filler, Market};

#[derive(Accounts)]
pub struct InitFiller<'info> {
    // Funds the creation of this market account!
    #[account(mut)]
    authority: Signer<'info>,

    market: Box<Account<'info, Market>>,
    quote_mint: Box<Account<'info, Mint>>,
    base_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        token::mint = quote_mint,
        token::authority = market
    )]
    quote_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        token::mint = quote_mint,
        token::authority = market
    )]
    base_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        space = Filler::LEN,
        seeds = [
            b"Filler".as_ref(),
            authority.key().as_ref(),
            market.key().as_ref()
        ],
        bump
    )]
    filler: Box<Account<'info, Filler>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>
}

impl<'info> InitFiller<'info> {
    pub fn validate(&self) -> Result<()> {
        assert_eq!(self.market.base_mint.key(), self.base_mint.key());
        assert_eq!(self.market.quote_mint.key(), self.quote_mint.key());

        Ok(())
    }

    pub fn handle(&mut self) -> Result<()> {
        let filler = &mut self.filler;
        filler.authority = self.authority.key();
        filler.market = self.market.key();
        filler.quote_account = self.quote_mint.key();
        filler.quote_locked = 0;
        filler.base_account = self.base_account.key();
        filler.base_locked = 0;
        Ok(())
    }
}