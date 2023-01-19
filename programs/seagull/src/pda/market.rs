use std::mem;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Slot;
use bytemuck::{Pod, Zeroable};

use sokoban::Critbit;

use crate::constants::{CRITBIT_NUM_NODES, ID_RESERVED_SIDE_BIT, MAX_ORDERS, NULL_FILLER};
use crate::pda::Side::{BUY, SELL};

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

    pub fn get_market_info_for_side(&self, side: Side) -> (Pubkey, Pubkey) {
        match side {
            Side::BUY => (self.quote_mint, self.quote_holding_account),
            Side::SELL => (self.base_mint, self.base_holding_account)
        }
    }

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
    pub queue: [u8; 10288]
}

impl OrderQueue {
    pub const LEN: usize = mem::size_of::<OrderQueueCritbit>();

    // Workaround for Anchor Bug preventing us from putting the LEN inside of the array causing idl type parse errors.
    const _LEN_CHECK: [u8; OrderQueue::LEN] = [0; mem::size_of::<OrderQueue>()];
}

pub type OrderQueueCritbit = Critbit<OrderInfo, CRITBIT_NUM_NODES, MAX_ORDERS>;

#[derive(Copy, Clone, Default)]
#[repr(packed)]
pub struct OrderInfo {
    pub size: u64,
    pub a_end: Slot,

    pub filler_info: FillerInfo
}
unsafe impl Zeroable for OrderInfo {}
unsafe impl Pod for OrderInfo {}

#[derive(Copy, Clone, Default)]
#[repr(packed)]
pub struct FillerInfo {
    pub id: u64,
    pub price: u64,
    pub max_size: u64,
    pub expire_slot: Slot
}
unsafe impl Zeroable for FillerInfo {}
unsafe impl Pod for FillerInfo {}

impl OrderInfo {
    pub fn from(size: u64, a_end: Slot) -> OrderInfo {
        OrderInfo {
            size, a_end, filler_info: FillerInfo::default()
        }
    }

    pub fn has_filler(&self) -> bool {
        self.filler_info.id != NULL_FILLER
    }

    pub fn get_key(price: u64, side: Side, user_id: u64) -> u128 {
        ((price as u128) << 64) | ((user_id | side.get_side_bit()) as u128) // Upper bits: price, Lower bits: user_id, 64th bit is side.
    }

    pub fn get_price_from_key(key: u128) -> u64 {
        (key >> 64) as u64
    }

    pub fn get_user_id_from_key(key: u128) -> u64 {
        key as u64
    }

    pub fn get_side_from_key(key: u128) -> Side {
        let bit = ((key as u64) & ID_RESERVED_SIDE_BIT) != 0;
        Side::from_side_bit(bit)
    }
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
#[repr(u8)]
pub enum Side {
    BUY,
    SELL
}

impl Side {
    fn get_side_bit(self) -> u64 {
        match self {
            BUY => ID_RESERVED_SIDE_BIT,
            _ => 0
        }
    }

    fn from_side_bit(bit: bool) -> Side {
        return if bit { BUY } else { SELL }
    }
}
