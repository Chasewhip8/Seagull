use std::mem;
use anchor_lang::prelude::*;
use crate::pda::Side;

#[account]
#[derive(Default, Debug)]
pub struct User {
    pub authority: Pubkey,
    pub user_id: u64,

    pub market: Pubkey,
    pub base_locked: u64,
    pub quote_locked: u64
}

impl User {
    pub const LEN: usize = 88;
    const _LEN_CHECK: [u8; User::LEN] = [0; mem::size_of::<User>()];

    pub fn add_to_side(&mut self, side: Side, amount: u64) {
        match side {
            Side::BUY => self.quote_locked.checked_add(amount),
            Side::SELL => self.base_locked.checked_add(amount)
        };
    }

    // // TODO fix seeds
    // pub fn seeds<'a>(owner: &'a Pubkey, market: &'a Pubkey) -> Vec<&'a[u8]> {
    //     vec![owner.as_ref(), market.as_ref()]
    // }
    //
    // pub fn find_program_address(quote_mint: &Pubkey, base_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    //     let seeds = Self::seeds(quote_mint, base_mint);
    //     Pubkey::find_program_address(
    //         seeds.as_slice(),
    //         program_id,
    //     )
    // }
}