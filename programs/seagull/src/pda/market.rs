use anchor_lang::prelude::*;
use crate::constants::PADDING;

#[account]
#[derive(Default, Debug)]
pub struct Market {
    pub quote_mint: Pubkey,
    pub base_mint: Pubkey,

    // TODO decide weather there should be any one owner and weather these values below should even exist or be hard coded to prevent spam. AKA figure out how serum handles it and copy.
    pub a_max_t: u32,
    pub a_min_t: u32,
    pub b_max_t: u32,
    pub b_min_t: u32,
}

impl Market {
    pub const LEN: usize = PADDING
        + 32 // quote_mint: Pubkey
        + 32 // base_mint: Pubkey
        + 4  // a_max_t: u32
        + 4  // a_min_t: u32
        + 4  // b_max_t: u32
        + 4  // b_min_t: u32
    ;

    // TODO I think we should just pass in an empty keypair instead of deriving it
    // pub fn seeds<'a>(quote_mint: &'a Pubkey, base_mint: &'a Pubkey) -> Vec<&'a[u8]> {
    //     vec![quote_mint.as_ref(), base_mint.as_ref()]
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