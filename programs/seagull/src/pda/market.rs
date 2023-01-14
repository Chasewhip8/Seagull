use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};

use sokoban::{Critbit};

use crate::constants::{CRITBIT_NUM_NODES, MAX_ORDERS};
use crate::pda::Side;

#[account]
#[derive(Default, Debug)]
pub struct Market {
    pub quote_mint: Pubkey,
    pub base_mint: Pubkey,

    pub order_queue: Pubkey // Pubkey of CritBit order queue
}

#[account(zero_copy)]
#[repr(packed)] // TODO maybe remove this might not be needed? maybe #[repr(transparent)]
pub struct OrderQueue {
    pub queue: Critbit<OrderInfo, CRITBIT_NUM_NODES, MAX_ORDERS>
}

#[derive(Default, Copy, Clone)]
#[repr(packed)]
pub struct OrderInfo {
    pub price: u64,
    pub size: u64,
    pub side: Side,
    pub order: Pubkey // This type might not serialize or whatever fallback to [u64; 4]??
}
unsafe impl Zeroable for OrderInfo {}
unsafe impl Pod for OrderInfo {}

impl OrderInfo {
    pub const LEN: usize =
        8 + // size: u64
            1; // side: Side
}

impl OrderQueue {
    pub const LEN: usize = 8  // Anchor Account Discriminator
        + 8 + 4 + 4  // CitBit Header
        + Self::get_allocator_len(32, CRITBIT_NUM_NODES)
        + Self::get_allocator_len(OrderInfo::LEN, MAX_ORDERS)
    ;

    const fn get_allocator_len(t_size: usize, size: usize) -> usize {
        8 + 4 + 4 + (16 + t_size) * size
    }
}

impl Market {
    pub const LEN: usize = 8  // Anchor Account Discriminator
        + 32 // quote_mint: Pubkey
        + 32 // base_mint: Pubkey
    ;

    pub fn seeds<'a>(quote_mint: &'a Pubkey, base_mint: &'a Pubkey) -> Vec<&'a[u8]> {
        vec![quote_mint.as_ref(), base_mint.as_ref()]
    }

    pub fn find_program_address(quote_mint: &Pubkey, base_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        let seeds = Self::seeds(quote_mint, base_mint);
        Pubkey::find_program_address(
            seeds.as_slice(),
            program_id,
        )
    }
}