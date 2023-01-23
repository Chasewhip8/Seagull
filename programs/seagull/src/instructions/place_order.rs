use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};
use crate::constants::{AUCTION_MAX_T, AUCTION_MIN_T, BACKSTOP_LENGTH, MAX_ORDERS};

use crate::events::{OrderPlaceEvent, OrderCancelEvent};
use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueCritbit, User};
use crate::error::SeagullError;
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(size: u64, side: Side, lowest_price: u64, a_end: u64)]
pub struct PlaceOrder<'info> {
    authority: Signer<'info>,

    #[account(mut)]
    user: Box<Account<'info, User>>,

    #[account(
        mut,
        token::authority = authority,
        token::mint = side_mint
    )]
    user_side_account: Box<Account<'info, TokenAccount>>, // Mint is enforced to be the correct side in validation below!
    side_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        token::mint = side_mint
    )]
    side_holding_account: Box<Account<'info, TokenAccount>>, // Account inside of the market struct to hold assets that are locked

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,
    market: Box<Account<'info, Market>>,

    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> PlaceOrder<'info> {
    pub fn validate(&self, size: u64, side: Side, lowest_price: u64, a_end: u64) -> Result<()> {
        assert_eq!(self.user.authority.key(), self.authority.key());

        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Validation of the instruction side and the passed in accounts, ensuring the mints match.
        let (side_mint, _) = self.market.get_market_info_for_side(side);
        assert_eq!(self.side_mint.key(), side_mint);

        // Validation of the user side account and the corresponding side mint passed in.
        assert_eq!(self.user_side_account.mint.key(), self.side_mint.key());

        assert_ne!(size, 0); // Orders cannot be 0.
        assert!(lowest_price >= self.market.min_tick_size); // Make sure they get something back
        assert!(self.market.price_tick_aligned(lowest_price));

        // Assert that the auction times fall within the acceptable range to reduce spam attacks.
        let current_slot = self.clock.slot;

        let offset_a_end = a_end.checked_sub(current_slot).unwrap();
        assert!((AUCTION_MIN_T..=AUCTION_MAX_T).contains(&offset_a_end));

        Ok(())
    }

    pub fn handle(&mut self, size: u64, side: Side, lowest_price: u64, a_end: u64) -> Result<()> {
        // Transfer the funds to the holding account, if this fails we dont need to go further, if anything else fails we will
        // revert anyways so do it now.
        self.transfer_to_market_cpi(size)?;

        self.user.add_to_side(size, side);

        let order_queue_account = &mut self.order_queue.load_mut()?;
        let order_key = OrderInfo::get_key(side, self.user.user_id, order_queue_account.sequential_index);

        order_queue_account.sequential_index = order_queue_account.sequential_index.checked_add(1).unwrap();

        let buf = &mut order_queue_account.queue;
        let order_queue: &mut OrderQueueCritbit = Critbit::load_mut_bytes(buf).unwrap();

        if order_queue.len() == MAX_ORDERS {
            let mut order_key: Option<u128> = None;
            for (key, order) in order_queue.iter() {
                if order.a_end + BACKSTOP_LENGTH <= self.clock.slot {
                    order_key = Some(*key);
                    break;
                }
            }

            if let Some(order_key) = order_key {
                order_queue.remove(&order_key);

                emit!(OrderCancelEvent {
                    market: self.market.key(),
                    order_id: order_key
                })
            } else {
                return Err(error!(SeagullError::OrderQueueFull));
            }
        }

        // An existing order matching the price does not exist! Lets insert one.
        let order = OrderInfo::from(size, lowest_price, a_end);
        let insert_node = order_queue.insert(order_key, order);
        if insert_node.is_none() {
            return Err(error!(SeagullError::OrderQueueFull));
        }

        emit!(OrderPlaceEvent {
            market: self.market.key(),
            order_id: order_key,
            size: size,
            a_end: a_end
        });

        Ok(())
    }

    fn transfer_to_market_cpi(&self, amount: u64) -> ProgramResult {
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
}