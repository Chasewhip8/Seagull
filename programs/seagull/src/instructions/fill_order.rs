use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::program::invoke;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token::spl_token::instruction::transfer_checked;
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};

use crate::pda::{User, Market, OrderQueue, OrderQueueCritbit, OrderInfo, FillerInfo};
use crate::pda::market::Side;

#[derive(Accounts)]
#[instruction(filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64)]
pub struct FillOrder<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(mut)]
    filler_side_account: Box<Account<'info, TokenAccount>>, // Mint is enforced to be the correct side in validation below!
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

    #[account(mut)]
    filler: Box<Account<'info, User>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    clock: Sysvar<'info, Clock>
}

impl<'info> FillOrder<'info> {
    pub fn validate(&self, filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64) -> Result<()> {
        assert_eq!(self.filler.authority.key(), self.authority.key()); // Ensure the user account belongs to the user!
        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Validation of the instruction side and the passed in accounts, ensuring the mints match.
        let (side_mint, _) = self.market.get_market_info_for_side(filler_side);
        assert_eq!(self.side_mint.key(), side_mint);

        // Validation of the user side account and the corresponding side mint passed in.
        assert_eq!(self.filler_side_account.mint.key(), self.side_mint.key());

        assert_ne!(filler_size, 0);
        assert_ne!(filler_price, 0);
        assert!(filler_expire_slot >= self.clock.slot); // Ensure the fill is not expired.

        Ok(())
    }

    pub fn handle(&mut self, filler_side: Side, filler_size: u64, filler_price: u64, filler_expire_slot: u64) -> Result<()> {
        let buf = &mut self.order_queue.load_mut()?.queue;
        let order_queue: &mut OrderQueueCritbit = Critbit::load_mut_bytes(buf).unwrap();

        if order_queue.len() == 0 {
            msg!("Match: Order queue empty!");
            return Ok(());
        }

        if FillOrder::match_order(
            order_queue,
            filler_side,
            FillerInfo {
                id: self.filler.user_id,
                price: filler_price,
                max_size: filler_size,
                expire_slot: filler_expire_slot
            }
        ) {
            self.transfer_to_market_cpi(filler_size)?;

            // Update the corresponding user accounts locked token balance.
            self.filler.add_to_side(filler_side, filler_size);

            msg!("Match: Matched Order!");
        }

        Ok(())
    }

    fn match_order(order_queue: &mut OrderQueueCritbit, filler_side: Side, mut filler_info: FillerInfo) -> bool {
        let mut rematch = false;
        let mut matched_initial = false;
        let mut is_first = true;

        loop {
            for (key, order_info) in order_queue.iter_mut() {
                if OrderInfo::get_side_from_key(*key) == filler_side // We cannot fill our own side.
                    || order_info.a_end > filler_info.expire_slot
                    || OrderInfo::get_price_from_key(*key) > filler_info.price // We cannot provide a good enough price to fill this order
                    || (order_info.has_filler() && order_info.filler_info.price >= filler_info.price) { // We cant beat the current price.
                    continue;
                }

                // This order can be matched with our filler.
                if is_first {
                    matched_initial = true;
                }

                if order_info.has_filler() {
                    // There was an existing filler! But we beat their price, we will try and kindly rematch theirs as well.
                    let old_filler = order_info.filler_info.clone();
                    order_info.filler_info = filler_info;
                    filler_info = old_filler;

                    // Set rematch to true so we can go through the entire order_queue again. TODO check if this is needed, if the items are sorted maybe not?
                    rematch = true;
                    break
                } else {
                    order_info.filler_info = filler_info;
                }
            }

            is_first = false;

            if rematch {
                rematch = false;
            } else {
                return matched_initial; // Success! We matched our order and maybe a few we misplaced!
            }
        }
    }

    fn transfer_to_market_cpi(&self, amount: u64) -> ProgramResult {
        invoke(
            &transfer_checked(
                self.token_program.key,
                &self.filler_side_account.key(),
                &self.side_mint.key(),
                &self.side_holding_account.key(),
                self.authority.key,
                &[],
                amount,
                self.side_mint.decimals,
            )?,
            &[
                self.filler_side_account.to_account_info(),
                self.side_mint.to_account_info(),
                self.side_holding_account.to_account_info(),
                self.authority.to_account_info()
            ]
        )
    }
}