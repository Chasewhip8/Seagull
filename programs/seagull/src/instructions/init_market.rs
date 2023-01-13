use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::pda::Market;

#[derive(Accounts)]
pub struct InitMarket<'info> {
    // Funds the creation of this market account!
    #[account(mut)]
    payer: Signer<'info>,

    // The mints of the market
    quote_mint: Box<Account<'info, Mint>>,
    base_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        space = Market::LEN,
        seeds = [
            &quote_mint.key().as_ref(),
            &base_mint.key().as_ref()
        ],
        bump
    )]
    market: Box<Account<'info, Market>>,

    #[account(
        init,
        payer = payer,
        space = 2,
        seeds = [
            b"OrderQueue".as_ref(),
            &quote_mint.key().as_ref(),
            &base_mint.key().as_ref()
        ],
        bump
    )]
    order_queue: Box<Account<'info, Mint>>, // TODO change to critbit account type and set space

    system_program: Program<'info, System>
}

impl<'info> InitMarket<'info> {
    pub fn validate(&self) -> Result<()> {
        Ok(())
    }

    pub fn handle(&mut self) -> Result<()> {
        let market = &mut self.market;
        market.quote_mint = self.quote_mint.key();
        market.base_mint = self.base_mint.key();
        market.order_queue = self.order_queue.key();
        Ok(())
    }
}