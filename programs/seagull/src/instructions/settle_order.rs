use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use sokoban::{Critbit, NodeAllocatorMap, ZeroCopy};

use crate::pda::{Market, OrderInfo, OrderQueue, OrderQueueCritbit, Side, User};
use crate::error::SeagullError;

#[derive(Accounts)]
#[instruction(order_id: u128)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    market: Box<Account<'info, Market>>,
    base_mint: Box<Account<'info, Mint>>,
    quote_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    order_queue: AccountLoader<'info, OrderQueue>,

    #[account(mut)]
    order_user: Box<Account<'info, User>>,

    // TODO maybe force ATA on these and maybe init them if needed down below instead of requiring
    //  possible attack hre would be for the filler to send it to a random address where the user might not see the funds
    #[account(
        mut,
        token::authority = order_user.authority
    )]
    order_user_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    order_filler: Box<Account<'info, User>>,

    #[account(
        mut,
        token::authority = order_filler.authority
    )]
    order_filler_account: Box<Account<'info, TokenAccount>>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    clock: Sysvar<'info, Clock>
}

impl<'info> PlaceOrder<'info> {
    pub fn validate(&self, order_id: u128) -> Result<()> {
        assert_eq!(self.base_mint.key(), self.market.base_mint.key());
        assert_eq!(self.quote_mint.key(), self.market.quote_mint.key());

        assert_eq!(self.order_queue.key(), self.market.order_queue.key());

        // Additional mint validation and order validation happens below as to not re-fetch orders.
        assert_eq!(self.order_user.user_id, OrderInfo::get_user_id_from_key(order_id));

        Ok(())
    }

    pub fn validate_order<'a>(&self, order_id: u128, order: Option<&'a mut OrderInfo>) -> Result<&'a mut OrderInfo> {
        if order.is_none() {
            return Err(error!(SeagullError::OrderNotFound));
        }
        let order = order.unwrap();

        let filler_id = order.filler_info.id;
        assert_eq!(self.order_filler.user_id, filler_id);

        let order_side = OrderInfo::get_side_from_key(order_id);
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
        let order = self.validate_order(order_id, order_queue.get_mut(&order_id))?;

        // Remove the order to prevent duplicate settles and clear the queue
        order_queue.remove(&order_id);



        Ok(())
    }
}



