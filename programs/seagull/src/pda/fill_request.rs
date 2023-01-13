use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct FillRequest {
    pub order: Pubkey,
    pub filler: Pubkey,
    pub price: f64
}

impl FillRequest {
    pub const LEN: usize =
        32   // order: Pubkey,
            + 32 // filler: Pubkey,
            + 8  // price: f64
    ;
}