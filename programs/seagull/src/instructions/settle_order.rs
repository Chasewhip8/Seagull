use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};

use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueCritbit, Side, User};
use crate::error::SeagullError;
use crate::gen_market_signer_seeds;
use crate::math::fp32_mul_floor;

#[derive(Accounts)]
#[instruction(order_id: u128)]
pub struct SettleOrder<'info> {
    market: Box<Account<'info, Market>>,
    base_mint: Box<Account<'info, Mint>>,
    quote_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        token::mint = base_mint,
        token::authority = market
    )]
    base_holding_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = quote_mint,
        token::authority = market
    )]
    quote_holding_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    order_user: Box<Account<'info, User>>,

    // TODO maybe force ATA on these and maybe init them if needed down below instead of requiring
    //  possible attack hre would be for the filler to send it to a random address where the user might not see the funds
    #[account(
        mut,
        token::authority = order_user.authority
    )]
    order_user_account: Box<Account<'info, TokenAccount>>,

    order_filler: Box<Account<'info, User>>,

    #[account(
        mut,
        token::authority = order_filler.authority
    )]
    order_filler_account: Box<Account<'info, TokenAccount>>,

    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> SettleOrder<'info> {
    pub fn validate(&self, order_id: u128) -> Result<()> {
        assert_eq!(self.base_mint.key(), self.market.base_mint.key());
        assert_eq!(self.quote_mint.key(), self.market.quote_mint.key());

        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Additional mint validation and order validation happens below as to not re-fetch orders.
        assert_eq!(self.order_user.user_id, OrderInfo::get_user_id_from_key(order_id));

        Ok(())
    }

    pub fn validate_order<'a>(&self, order_side: Side, order: Option<&'a mut OrderInfo>) -> Result<&'a mut OrderInfo> {
        if order.is_none() {
            return Err(error!(SeagullError::OrderNotFound));
        }
        let order = order.unwrap();

        // User id validated above!
        let filler_id = order.filler_info.id;
        assert_eq!(self.order_filler.user_id, filler_id);

        match order_side {
            Side::BUY => {
                // If the order was a buy order, filler gets quote, buyer gets base
                assert_eq!(self.order_user_account.mint, self.market.base_mint);
                assert_eq!(self.order_filler_account.mint, self.market.quote_mint);
            }
            _ => {
                // If the order was a sell order, filler gets base, buyer gets quote
                assert_eq!(self.order_user_account.mint, self.market.quote_mint);
                assert_eq!(self.order_filler_account.mint, self.market.base_mint);
            }
        }

        Ok(order)
    }

    pub fn handle(&mut self, order_id: u128) -> Result<()> {
        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueCritbit = Critbit::load_mut_bytes(buf).unwrap();
        let order_side = OrderInfo::get_side_from_key(order_id);
        let order = self.validate_order(order_side, order_queue.get_mut(&order_id))?;

        let size = order.size;
        let amount = fp32_mul_floor(size, OrderInfo::get_price_from_key(order_id)).unwrap();
        let (filler_receive_amount, user_receive_amount) = match order_side {
            Side::BUY => (amount, size), // If buy, size * price = quote to pay, base to take
            _ => (size, amount)          // IF sell, size * price = base to pay, quote to take
        };

        // Transfer assets to corresponding accounts!
        self.transfer_from_market_cpi(false, user_receive_amount, order_side)?;
        self.transfer_from_market_cpi(true, filler_receive_amount, order_side)?;

        order_queue.remove(&order_id); // Remove the order to prevent duplicate settles and clear the queue

        Ok(())
    }

    fn transfer_from_market_cpi(&self, is_filler: bool, amount: u64, order_side: Side) -> ProgramResult {
        let (
            mint,
            source_account,
            destination_account
        ) = match order_side {
            Side::BUY => (
                &self.base_mint,
                &self.base_holding_account,
                if is_filler { &self.order_filler_account } else { &self.order_user_account }
            ),
            _ => (
                &self.quote_mint,
                &self.quote_holding_account,
                if is_filler { &self.order_filler_account } else { &self.order_user_account }
            )
        };

        invoke_signed(
            &transfer_checked(
                self.token_program.key,
                &source_account.key(),
                &mint.key(),
                &destination_account.key(),
                &self.market.key(),
                &[],
                amount,
                mint.decimals,
            )?,
            &[
                source_account.to_account_info(),
                mint.to_account_info(),
                destination_account.to_account_info(),
                self.market.to_account_info()
            ],
            &[&gen_market_signer_seeds!(self.market)[..]]
        )
    }
}