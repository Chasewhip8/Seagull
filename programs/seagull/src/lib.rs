use anchor_lang::prelude::*;

use instructions::*;

use pda::market::Side;

mod error;
mod pda;
mod instructions;
mod constants;
mod math;
mod events;

declare_id!("5m6icMgJpaZoWywACLyRtTrdZ52FUoR6x6iuciKky9J2");

#[program]
pub mod seagull {
    use super::*;

    #[access_control(ctx.accounts.validate())]
    pub fn init_market(
        ctx: Context<InitMarket>
    ) -> Result<()> {
        ctx.accounts.handle(*ctx.bumps.get("market").unwrap())
    }

    #[access_control(ctx.accounts.validate(user_id))]
    pub fn init_user(
        ctx: Context<InitUser>,
        user_id: u64
    ) -> Result<()> {
        ctx.accounts.handle(user_id)
    }

    #[access_control(ctx.accounts.validate(size, side, lowest_price, a_end))]
    pub fn place_order(
        ctx: Context<PlaceOrder>,
        size: u64,
        side: Side,
        lowest_price: u64,
        a_end: u64
    ) -> Result<()> {
        ctx.accounts.handle(size, side, lowest_price, a_end)
    }

    #[access_control(ctx.accounts.validate(filler_side, filler_size, filler_price, filler_expire_slot))]
    pub fn fill_order(
        ctx: Context<FillOrder>,
        filler_side: Side,
        filler_size: u64,
        filler_price: u64,
        filler_expire_slot: u64
    ) -> Result<()> {
        ctx.accounts.handle(filler_side, filler_size, filler_price, filler_expire_slot)
    }

    #[access_control(ctx.accounts.validate(order_id))]
    pub fn settle_order(
        ctx: Context<SettleOrder>,
        order_id: u128
    ) -> Result<()> {
        ctx.accounts.handle(order_id)
    }

    #[access_control(ctx.accounts.validate(order_id))]
    pub fn cancel_order(
        ctx: Context<CancelOrder>,
        order_id: u128
    ) -> Result<()> {
        ctx.accounts.handle(order_id)
    }

    #[access_control(ctx.accounts.validate())]
    pub fn claim_unsettled(
        ctx: Context<ClaimUnsettled>
    ) -> Result<()> {
        ctx.accounts.handle()
    }
}