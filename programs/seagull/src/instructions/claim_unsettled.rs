use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;

use sokoban::{ZeroCopy};

use crate::gen_market_signer_seeds;
use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueType, Side, User};
use crate::pda::Side::{Buy, Sell};

#[derive(Accounts)]
pub struct ClaimUnsettled<'info> {
    authority: Signer<'info>,

    user: Box<Account<'info, User>>,

    #[account(
        mut,
        token::mint = quote_mint,
        token::authority = user.authority
    )]
    user_quote_account: Box<Account<'info, TokenAccount>>,

    #[account(address = market.quote_mint)]
    quote_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        token::mint = base_mint,
        token::authority = user.authority
    )]
    user_base_account: Box<Account<'info, TokenAccount>>,

    #[account(address = market.base_mint)]
    base_mint: Box<Account<'info, Mint>>,

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

    order_queue: AccountLoader<'info, OrderQueue>,

    market: Box<Account<'info, Market>>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> ClaimUnsettled<'info> {
    pub fn validate(&self) -> Result<()> {
        assert_eq!(self.authority.key(), self.user.authority.key());
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        Ok(())
    }

    pub fn handle(&mut self) -> Result<()> {
        let buf = &self.order_queue.load_mut()?.queue;
        let order_queue: &OrderQueueType = OrderQueueType::load_bytes(buf).unwrap();

        let mut outstanding_quote = 0;
        let mut outstanding_base = 0;
        for (key, order) in order_queue {
            let order_id = *key;
            let user_id = OrderInfo::get_user_id_from_key(order_id);
            if user_id == self.user.user_id { // Make sure we own the order
                match OrderInfo::get_side_from_key(order_id) {
                    Buy => {
                        outstanding_quote += order.size;
                    }
                    Sell => {
                        outstanding_base += order.size;
                    }
                }
            }
        }

        let owed_quote = self.user.open_quote.checked_sub(outstanding_quote).unwrap();
        let owed_base = self.user.open_base.checked_sub(outstanding_base).unwrap();

        if owed_quote > 0 {
            self.transfer_from_market_cpi(owed_quote, Buy)?; // Refund the user!
            msg!("Refunded {} quote asset!", owed_quote)
        }
        if owed_base > 0 {
            self.transfer_from_market_cpi(owed_quote, Sell)?; // Refund the user!
            msg!("Refunded {} base asset!", owed_base)
        }

        Ok(())
    }

    fn transfer_from_market_cpi(&self, amount: u64, order_side: Side) -> ProgramResult {
        let (
            mint,
            source_account,
            destination_account
        ) = match order_side {
            Sell => (
                &self.base_mint,
                &self.base_holding_account,
                &self.user_base_account
            ),
            Buy => (
                &self.quote_mint,
                &self.quote_holding_account,
                &self.user_quote_account
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