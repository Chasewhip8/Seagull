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
    pub const LEN: usize = 160;
    const _LEN_CHECK: [u8; Market::LEN] = [0; mem::size_of::<Market>()];

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
    pub queue: [u8; 9520]
}

impl OrderQueue {
    pub const LEN: usize = mem::size_of::<OrderQueueCritbit>();

    // Workaround for Anchor Bug preventing us from putting the LEN inside of the array causing idl type parse errors.
    const _LEN_CHECK: [u8; OrderQueue::LEN] = [0; mem::size_of::<OrderQueue>()];
}

pub type OrderQueueCritbit = Critbit<OrderInfo, CRITBIT_NUM_NODES, MAX_ORDERS>;

#[derive(Default, Copy, Clone)]
#[repr(packed)]
pub struct OrderInfo {
    //pub user: u64, First 64 bits of t

    pub size: u64,
    pub side: Side,
    pub a_end: Slot,
    pub b_end: Slot,

    pub filler_id: u64,
}
unsafe impl Zeroable for OrderInfo {}
unsafe impl Pod for OrderInfo {}

impl OrderInfo {
    pub fn from(size: u64, side: Side, a_end: Slot, b_end: Slot) -> OrderInfo {
        OrderInfo {
            size, side, a_end, b_end,
            filler_id: 0
        }
    }

    pub fn get_key(price: u64, user_id: u64) -> u128 {
        ((price as u128) << 64) | (user_id as u128) // Upper bits: price, Lower bits: user_id
    }

    pub fn get_price_from_key(key: u128) -> u64 {
        (key >> 64) as u64
    }

    pub fn get_user_id_from_key(key: u128) -> u64 {
        key as u64
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
