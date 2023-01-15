use anchor_lang::prelude::*;

use instructions::*;
use anchor_lang::solana_program::clock::Slot;

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

    #[access_control(ctx.accounts.validate())]
    pub fn init_filler(
        ctx: Context<InitFiller>
    ) -> Result<()> {
        ctx.accounts.handle()
    }

    #[access_control(ctx.accounts.validate(size, expected_return, a_end, b_end))]
    pub fn place_order(
        ctx: Context<PlaceOrder>,
        size: u64,
        side: Side,
        expected_return: u64,
        a_end: Slot,
        b_end: Slot
    ) -> Result<()> {
        ctx.accounts.handle(size, side, expected_return, a_end, b_end)
    }
}