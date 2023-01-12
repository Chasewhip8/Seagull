use anchor_lang::prelude::*;
use crate::constants::PADDING;

#[account]
#[derive(Default, Debug)]
pub struct Filler {
    // Owner not needed I think as we just make sure to only use the signer as the seed

    pub base_account: Pubkey,
    pub base_locked: u64,

    pub quote_account: Pubkey,
    pub quote_locked: u64
}

impl Filler {
    pub const LEN: usize = PADDING
        + 32 // base_account: Pubkey
        + 8  // base_locked: u64
        + 32 // quote_account: Pubkey
        + 8  // quote_locked: u64
    ;

    pub fn seeds<'a>(owner: &'a Pubkey, market: &'a Pubkey) -> Vec<&'a[u8]> {
        vec![owner.as_ref(), market.as_ref()]
    }

    pub fn find_program_address(quote_mint: &Pubkey, base_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        let seeds = Self::seeds(quote_mint, base_mint);
        Pubkey::find_program_address(
            seeds.as_slice(),
            program_id,
        )
    }
}

#[account]
#[derive(Default, Debug)]
pub struct FillRequest {
    pub order: Pubkey,
    pub filler: Pubkey,
    pub price: f64
}

impl FillRequest {
    pub const LEN: usize = PADDING
        + 32 // order: Pubkey,
        + 32 // filler: Pubkey,
        + 8  // price: f64
    ;
}