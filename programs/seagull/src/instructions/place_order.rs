use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};
use crate::constants::{A_MAX_T, A_MIN_T, B_MAX_T, B_MIN_T, NULL_FILLER};

use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueCritbit, User};
use crate::error::SeagullError;
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(user_id: u64, size: u64, side: Side, lowest_price: u64, a_end: u64, b_end: u64)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    user: Box<Account<'info, User>>,

    #[account(mut)]
    user_side_account: Box<Account<'info, TokenAccount>>, // Mint is enforced to be the correct side in validation below!
    side_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    market: Box<Account<'info, Market>>,

    #[account(
        mut,
        token::mint = side_mint
    )]
    side_holding_account: Box<Account<'info, TokenAccount>>, // Account inside of the market struct to hold assets that are locked

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> PlaceOrder<'info> {
    pub fn validate(&self, size: u64, side: Side, lowest_price: u64, a_end: u64, b_end: u64) -> Result<()> {
        // Validation of the user account is done through seeds requiring the authority key to derive
        // their filler.
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Validation of the market inside the user account being the same as the one we are placing
        // an order on.
        assert_eq!(self.market.key(), self.user.market.key());

        // Validation of the instruction side and the passed in accounts, ensuring the mints match.
        let (side_mint, _) = self.market.get_market_info_for_side(side);
        assert_eq!(self.side_mint.key(), side_mint);

        // Validation of the user side account and the corresponding side mint passed in.
        assert_eq!(self.user_side_account.mint.key(), self.side_mint.key());

        assert_ne!(size, 0); // Orders cannot be 0.
        assert_ne!(lowest_price, 0); // Make sure they get something back

        assert!(b_end >= a_end, "Backstop end needs to be greater than or equal to auction end");

        // Assert that the auction times fall within the acceptable range to reduce spam attacks.
        let current_slot = self.clock.slot;

        let offset_a_end = a_end.checked_sub(current_slot).unwrap();
        assert!(A_MIN_T <= offset_a_end && offset_a_end <= A_MAX_T);

        let offset_b_end = b_end.checked_sub(current_slot).unwrap();
        assert!(B_MIN_T <= offset_b_end && offset_b_end <= B_MAX_T);

        Ok(())
    }

    pub fn transfer_to_market_cpi(&self, amount: u64, side: Side) -> ProgramResult {
        invoke(
            &transfer_checked(
                self.token_program.key,
                &self.user_side_account.key(),
                &self.side_mint.key(),
                &self.side_holding_account.key(),
                self.authority.key,
                &[],
                amount,
                self.side_mint.decimals,
            )?,
            &[
                self.user_side_account.to_account_info(),
                self.side_mint.to_account_info(),
                self.side_holding_account.to_account_info(),
                self.authority.to_account_info()
            ]
        )
    }

    pub fn handle(&mut self, size: u64, side: Side, lowest_price: u64, a_end: u64, b_end: u64) -> Result<()> {
        // Transfer the funds to the holding account, if this fails we dont need to go further, if anything else fails we will
        // revert anyways so do it now.
        self.transfer_to_market_cpi(size, side)?;

        // Update the corresponding user accounts locked token balance.
        match side {
            Side::BUY => self.user.quote_locked += size,
            Side::SELL => self.user.base_locked += size
        };

        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueCritbit = Critbit::load_mut_bytes(buf).unwrap();
        let order_key = OrderInfo::get_key(lowest_price, side, self.user.user_id);

        if let Some(existing_order) = order_queue.get_mut(&order_key) {
            // Since we have not implemented partial fills at this stage we will error on adjusting already filled orders.
            if existing_order.filler_id != NULL_FILLER {
                return Err(error!(SeagullError::OrderExistsAndFilled));
            }

            existing_order.size += size;
        } else {
            // An existing order matching the price does not exist! Lets insert one.
            let order = OrderInfo::from(size, a_end, b_end);
            let insert_node = order_queue.insert(order_key, order);
            if insert_node.is_none() {
                return Err(error!(SeagullError::OrderQueueFull));
            }
        }

        Ok(())
    }
}