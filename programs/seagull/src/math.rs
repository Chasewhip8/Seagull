use std::convert::TryInto;

// Thank you Bonfida for some nice FP32 math utils.
// https://github.com/Bonfida/bonfida-utils/blob/main/utils/src/fp_math.rs

/// result is a fp32 of the minimum tick size
#[inline(always)]
pub fn fp32_calc_min_tick_sizes(base_decimals: u8) -> u64 {
    1 << (32 - base_decimals)
}

/// a is fp0, b is fp32 and result is a*b fp0
pub fn fp32_mul_floor(a: u64, b_fp32: u64) -> Option<u64> {
    (a as u128)
        .checked_mul(b_fp32 as u128)
        .and_then(|x| (x >> 32).try_into().ok())
}

#[test]
fn test() {
    // fp32_calc_min_tick_sizes
    assert_eq!(fp32_calc_min_tick_sizes(0), 1 << 32);
    assert_eq!(fp32_calc_min_tick_sizes(1), 1 << 31);

    // fp32_mul
    assert_eq!(
        fp32_mul_floor(5676543, 6787654 << 32).unwrap(),
        38530409800122
    );
    assert_eq!(fp32_mul_floor(12454, 45654 << 32).unwrap(), 568574916);
    assert_eq!(fp32_mul_floor(5, 1 << 31).unwrap(), 2);
}