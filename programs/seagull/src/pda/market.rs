use std::mem;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Slot;
use bytemuck::{Pod, Zeroable};

use sokoban::Critbit;

use crate::constants::{CRITBIT_NUM_NODES, MAX_ORDERS};

#[account]
#[derive(Default, Debug)]
pub struct Market {
    pub quote_mint: Pubkey,
    pub quote_holding_account: Pubkey,

    pub base_mint: Pubkey,
    pub base_holding_account: Pubkey,

    pub order_queue: Pubkey // Pubkey of CritBit order queue
}

impl Market {
    pub const LEN: usize = 8  // Anchor Account Discriminator
        + 32 // quote_mint: Pubkey
        + 32 // quote_holding_account: Pubkey
        + 32 // base_mint: Pubkey
        + 32 // base_holding_account: Pubkey
        + 32 // order_queue: Pubkey
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

#[account(zero_copy)]
#[repr(transparent)]
pub struct OrderQueue {
    pub queue: [u8; 91184]
}
const _: [u8; mem::size_of::<OrderQueue>()] = [0; OrderQueue::LEN - 8];

pub type OrderQueueCritbit = Critbit<OrderInfo, CRITBIT_NUM_NODES, MAX_ORDERS>;

#[derive(Default, Copy, Clone)]
#[repr(packed)]
pub struct OrderInfo {
    pub size: u64,
    pub side: Side,
    pub expected_return: u64,

    pub a_end: Slot,
    pub b_end: Slot,

    pub filler: Option<Pubkey>,
}
unsafe impl Zeroable for OrderInfo {}
unsafe impl Pod for OrderInfo {}

impl OrderInfo {
    pub const LEN: usize =
        8 // size: u64
            + 1 // side: Side
            + 8 // expected_return: u64
            + 8 // pub a_end: Slot
            + 8 // pub b_end: Slot
            + 32 + 1 // filler: Option<Pubkey>
    ;

    pub fn from(size: u64, side: Side, expected_return: u64, a_end: Slot, b_end: Slot) -> OrderInfo {
        OrderInfo {
            size, side, expected_return, a_end, b_end,
            filler: None
        }
    }

    pub fn get_key(&self) -> u128 {
        todo!()
    }
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

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, Copy)]
#[repr(u8)]
pub enum Side {
    BUY,
    SELL
}

impl Default for Side {
    fn default() -> Self {
        Side::BUY
    }
}
