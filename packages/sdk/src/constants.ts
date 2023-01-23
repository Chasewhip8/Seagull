import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const SEAGULL_PROGRAM_ID = new PublicKey("DmcruH9NFwSAxZL4u1UdQd3S5TQdS8SQGFjFbng5KBEC");

export const BN_0 = new BN(0);
export const U64_MAX_BN = new BN('18446744073709551615');
export const ID_RESERVED_SIDE_BIT = new BN(1).ishln(63);
export const ID_SAFE_BITS = U64_MAX_BN.uxor(ID_RESERVED_SIDE_BIT);