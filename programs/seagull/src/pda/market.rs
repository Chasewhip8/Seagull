use std::mem;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Slot;
use bytemuck::{Pod, Zeroable};

use sokoban::Critbit;

use crate::constants::{CRITBIT_NUM_NODES, ID_RESERVED_SIDE_BIT, MAX_ORDERS, NULL_FILLER};
use crate::pda::Side::{Buy, Sell};

#[account]
#[derive(Default, Debug)]
pub struct Market {
    pub quote_mint: Pubkey,
    pub quote_holding_account: Pubkey,

    pub base_mint: Pubkey,
    pub base_holding_account: Pubkey,

    pub order_queue: Pubkey, // Pubkey of CritBit order queue
    pub min_tick_size: u64, // FP32 of quote.

    pub bump: u8
}

impl Market {
    pub const LEN: usize = 176;
    const _LEN_CHECK: [u8; Market::LEN] = [0; mem::size_of::<Market>()];

    pub fn get_market_info_for_side(&self, side: Side) -> (Pubkey, Pubkey) {
        match side {
            Buy => (self.quote_mint, self.quote_holding_account),
            Sell => (self.base_mint, self.base_holding_account)
        }
    }

    pub fn price_tick_aligned(&self, price: u64) -> bool {
        price % self.min_tick_size == 0
    }
}

#[macro_export]
macro_rules! gen_market_signer_seeds {
    ($market:expr) => {
        &[
             b"Market".as_ref(),
             $market.quote_mint.key().as_ref(),
             $market.base_mint.key().as_ref(),
             &[$market.bump],
        ]
    };
}

#[account(zero_copy)]
#[repr(transparent)]
pub struct OrderQueue {
    pub queue: [u8; 10128]
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

impl FillerInfo {
    pub fn is_valid(&self) -> bool {
        self.id != NULL_FILLER
    }
}

impl OrderInfo {
    pub fn from(size: u64, a_end: Slot) -> OrderInfo {
        OrderInfo {
            size, a_end, filler_info: FillerInfo::default()
        }
    }

    pub fn has_filler(&self) -> bool {
        self.filler_info.is_valid()
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
    Buy,
    Sell
}

impl Side {
    fn get_side_bit(self) -> u64 {
        match self {
            Buy => ID_RESERVED_SIDE_BIT,
            Sell => 0
        }
    }

    pub fn get_opposite(&self) -> Side {
        match self {
            Buy => Sell,
            Sell => Buy
        }
    }

    fn from_side_bit(bit: bool) -> Side {
        if bit { Buy } else { Sell }
    }
}
