// Market Auction Time Restrictions
pub const AUCTION_MAX_T: u64 = 5000;  // Maximum Auction Duration Slots
pub const AUCTION_MIN_T: u64 = 5; // Minimum Auction Duration Slots, >= 1 as anything else wouldn't start the auction.

// After this amount of slots after the orders auction end slot, it will be allowed to be removed
// in order to provide space for new orders.
pub const BACKSTOP_LENGTH: u64 = 25;

pub const MAX_ORDERS: usize = 115;
//pub const CRITBIT_NUM_NODES: usize = MAX_ORDERS * 2;

pub const NULL_FILLER: u64 = 0;

pub const ID_RESERVED_SIDE_BIT: u128 = 1 << 127;
pub const ID_RESERVED_SIDE_BIT_U64: u64 = 1 << 63;