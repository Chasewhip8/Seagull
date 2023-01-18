// Market Auction Time Restrictions
// TODO: Make them sane
pub const A_MAX_T: u64 = u64::MAX;  // Maximum Auction Duration Slots
pub const A_MIN_T: u64 = 1; // Minimum Auction Duration Slots, >= 1 as anything else wouldn't start the auction.
pub const B_MAX_T: u64 = u64::MAX; // Maximum Backstop Duration Slots
pub const B_MIN_T: u64 = 0; // Minimum Backstop Duration Slots

pub const MAX_ORDERS: usize = 64;
pub const CRITBIT_NUM_NODES: usize = MAX_ORDERS * 2;

pub const NULL_FILLER: u64 = 0;

pub const ID_RESERVED_SIDE_BIT: u64 = 1 << 63;