use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Slot;
use crate::constants::PADDING;
use crate::pda::Market;
use crate::pda::Side::BUY;

#[account]
#[derive(Default, Debug)]
pub struct Order {
    pub size: u64,
    pub side: Side,
    pub expected_return: u64,
    pub holding_account: Pubkey,

    pub a_end: Slot,
    pub b_end: Slot,

    pub fill_request: Option<Pubkey>,
    pub completed: bool
}

impl Market {
    pub const LEN: usize = PADDING
        + 8  // size: u64
        + 1  // side: Side
        + 8  // expected_return: u64
        + 32 // holding_account: Pubkey
        + 8  // a_end: Slot
        + 8  // b_end: Slot
        + 32 + 4 // Option<Pubkey> TODO verify option takes extra 4 bytes
        + 1  // completed: bool
    ;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum Side {
    BUY,
    SELL
}

impl Default for Side {
    fn default() -> Self {
        BUY
    }
}