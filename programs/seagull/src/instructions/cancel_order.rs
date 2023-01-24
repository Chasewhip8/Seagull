use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;

use sokoban::{NodeAllocatorMap, ZeroCopy};

use crate::constants::BACKSTOP_LENGTH;
use crate::error::SeagullError;
use crate::gen_market_signer_seeds;
use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueType, Side, User};
use crate::pda::Side::{Buy, Sell};

#[derive(Accounts)]
#[instruction(order_id: u128)]
pub struct CancelOrder<'info> {
    authority: Signer<'info>,

    user: Box<Account<'info, User>>,
    refund_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        token::mint = refund_mint,
        token::authority = user.authority
    )]
    refund_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = refund_mint,
        token::authority = market
    )]
    market_holding_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    market: Box<Account<'info, Market>>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> CancelOrder<'info> {
    pub fn validate(&self, order_id: u128) -> Result<()> {
        assert_eq!(self.user.user_id, OrderInfo::get_user_id_from_key(order_id));
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        Ok(())
    }

    pub fn validate_order<'a>(&self, order_side: Side, order: Option<&'a OrderInfo>) -> Result<&'a OrderInfo> {
        if order.is_none() {
            return Err(error!(SeagullError::OrderNotFound));
        }
        let order = order.unwrap();

        match order_side {
            Buy => {
                assert_eq!(self.refund_mint.key(), self.market.quote_mint);
            }
            Sell => {
                assert_eq!(self.refund_mint.key(), self.market.base_mint);
            }
        }

        Ok(order)
    }

    pub fn handle(&mut self, order_id: u128) -> Result<()> {
        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueType = OrderQueueType::load_mut_bytes(buf).unwrap();
        let order_side = OrderInfo::get_side_from_key(order_id);

        let order = self.validate_order(order_side, order_queue.get(&order_id))?;
        if order.has_filler() {
            return Err(error!(SeagullError::OrderNotCancelable));
        }

        // Only assert the owner is cancelling when the auction is running and we are before the backstop end.
        if order.a_end + BACKSTOP_LENGTH > self.clock.slot {
            assert_eq!(self.user.authority.key(), self.authority.key());
        }

        self.transfer_from_market_cpi(order.size)?; // Refund the user!
        self.user.remove_from_side(order.size, order_side);

        order_queue.remove(&order_id); // Remove it from the queue to prevent duplicate redeems

        Ok(())
    }

    fn transfer_from_market_cpi(&self, amount: u64) -> ProgramResult {
        invoke_signed(
            &transfer_checked(
                self.token_program.key,
                &self.market_holding_account.key(),
                &self.refund_mint.key(),
                &self.refund_account.key(),
                &self.market.key(),
                &[],
                amount,
                self.refund_mint.decimals,
            )?,
            &[
                self.market_holding_account.to_account_info(),
                self.refund_mint.to_account_info(),
                self.refund_account.to_account_info(),
                self.market.to_account_info()
            ],
            &[&gen_market_signer_seeds!(self.market)[..]]
        )
    }
}