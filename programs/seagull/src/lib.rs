use anchor_lang::prelude::*;

use instructions::*;

use pda::market::Side;

mod error;
mod pda;
mod instructions;
mod constants;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod seagull {
    use super::*;

    #[access_control(ctx.accounts.validate())]
    pub fn init_market(
        ctx: Context<InitMarket>
    ) -> Result<()> {
        ctx.accounts.handle()
    }

    #[access_control(ctx.accounts.validate(user_id))]
    pub fn init_filler(
        ctx: Context<InitUser>,
        user_id: u64
    ) -> Result<()> {
        ctx.accounts.handle(user_id)
    }

    #[access_control(ctx.accounts.validate(size, side, lowest_price, a_end, b_end))]
    pub fn place_order(
        ctx: Context<PlaceOrder>,
        size: u64,
        side: Side,
        lowest_price: u64,
        a_end: u64,
        b_end: u64
    ) -> Result<()> {
        ctx.accounts.handle(size, side, lowest_price, a_end, b_end)
    }
}