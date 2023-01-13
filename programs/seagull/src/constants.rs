// Market Auction Time Restrictions
// TODO: Make them sane
pub const A_MAX_T: u32 = u32::MAX;  // Maximum Auction Duration Slots
pub const A_MIN_T: u32 = 1; // Minimum Auction Duration Slots, >= 1 as anything else wouldn't start the auction.
pub const B_MAX_T: u32 = u32::MAX; // Maximum Backstop Duration Slots
pub const B_MIN_T: u32 = 0; // Minimum Backstop Duration Slots