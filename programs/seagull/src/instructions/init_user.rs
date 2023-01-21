use anchor_lang::prelude::*;
use crate::constants::{ID_RESERVED_SIDE_BIT, NULL_FILLER};

use crate::pda::{Market, User};

#[derive(Accounts)]
#[instruction(user_id: u64)]
pub struct InitUser<'info> {
    #[account(mut)]
    authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = User::LEN + 8,
        seeds = [
            b"User".as_ref(),
            market.key().as_ref(),
            user_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    user: Box<Account<'info, User>>,
    market: Box<Account<'info, Market>>,

    system_program: Program<'info, System>
}

impl<'info> InitUser<'info> {
    pub fn validate(&self, user_id: u64) -> Result<()> {
        // Implied Validation: The order_id is unused as anchor would throw an error initializing and already
        //                     initialized account.

        assert_eq!(user_id & ID_RESERVED_SIDE_BIT, 0, "Reserved upper byte needs to be 0'd."); // Reserve this byte for side encoding in orders.
        assert_ne!(user_id, NULL_FILLER); // cannot be null filler, all 0'd

        Ok(())
    }

    pub fn handle(&mut self, user_id: u64) -> Result<()> {
        let user = &mut self.user;
        user.authority = self.authority.key();
        user.user_id = user_id;
        Ok(())
    }
}