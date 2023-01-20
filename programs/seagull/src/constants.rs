// Market Auction Time Restrictions
pub const AUCTION_MAX_T: u64 = 50;  // Maximum Auction Duration Slots
pub const AUCTION_MIN_T: u64 = 5; // Minimum Auction Duration Slots, >= 1 as anything else wouldn't start the auction.
pub const BACKSTOP_LENGTH: u64 = 25; // Backstop Length after auction ends in slots

pub const MAX_ORDERS: usize = 64;
pub const CRITBIT_NUM_NODES: usize = MAX_ORDERS * 2;

pub const NULL_FILLER: u64 = 0;

pub const ID_RESERVED_SIDE_BIT: u64 = 1 << 63;