export function convertMinutesToSlots(minutes: number) {
    return minutes * 60 * 3;
}

// export function convertToU64(a: number): BN {
//     return JSBI.asUintN(64, JSBI.BigInt(Math.floor(a)));
// }
//
// export function convertToAtomicUnits(x: number, decimals: number): number {
//     return Math.floor(x * (10 ** decimals));
// }
//
// export function convertToAtomicUnitsU64(x: number, decimals: number): JSBI {
//     return convertToU64(convertToAtomicUnits(x, decimals));
// }
//
// export function convertFromAtomicUnits(x: number, decimals: number): number {
//     return x / (10 ** decimals);
// }
//
// export function convertFromAtomicUnitsU64(x: JSBI, decimals: number): number {
//     return JSBI.toNumber(x) / (10 ** decimals);
// }