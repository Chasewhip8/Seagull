mod pda;
mod instructions;
mod constants;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod seagull {
    use super::*;

    #[access_control(ctx.accounts.validate())]
    pub fn new_transaction(
        ctx: Context<InitMarket>
    ) -> Result<()> {
        ctx.accounts.handle()
    }
}