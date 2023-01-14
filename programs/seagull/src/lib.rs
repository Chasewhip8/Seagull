use anchor_lang::prelude::*;

use instructions::*;

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
}