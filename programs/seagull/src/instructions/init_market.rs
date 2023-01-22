use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use sokoban::{Critbit, FromSlice};
use crate::math::fp32_calc_min_tick_sizes;

use crate::pda::{Market, OrderQueue, OrderQueueCritbit};

#[derive(Accounts)]
pub struct InitMarket<'info> {
    // Funds the creation of this market account!
    #[account(mut)]
    payer: Signer<'info>,

    quote_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        token::mint = quote_mint,
        token::authority = market
    )]
    quote_holding_account: Box<Account<'info, TokenAccount>>,

    base_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        token::mint = base_mint,
        token::authority = market
    )]
    base_holding_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        space = OrderQueue::LEN + 8,
        seeds = [
            b"OrderQueue".as_ref(),
            quote_mint.key().as_ref(),
            base_mint.key().as_ref()
        ],
        bump
    )]
    order_queue: AccountLoader<'info, OrderQueue>,

    #[account(
        init,
        payer = payer,
        space = Market::LEN + 8,
        seeds = [
            b"Market".as_ref(),
            quote_mint.key().as_ref(),
            base_mint.key().as_ref()
        ],
        bump
    )]
    market: Box<Account<'info, Market>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>
}

impl<'info> InitMarket<'info> {
    pub fn validate(&self) -> Result<()> {
        assert_ne!(self.quote_mint.key(), self.base_mint.key(), "Market assets need to be different!");

        Ok(())
    }

    pub fn handle(&mut self, bump: u8) -> Result<()> {
        let buf = &mut self.order_queue.load_init()?.queue;
        let _order_queue: &mut OrderQueueCritbit = Critbit::new_from_slice(buf);

        let market = &mut self.market;
        market.quote_mint = self.quote_mint.key();
        market.quote_holding_account = self.quote_holding_account.key();
        market.base_mint = self.base_mint.key();
        market.base_holding_account = self.base_holding_account.key();
        market.order_queue = self.order_queue.key();
        market.min_tick_size = fp32_calc_min_tick_sizes(self.quote_mint.decimals);
        market.bump = bump;
        Ok(())
    }
}