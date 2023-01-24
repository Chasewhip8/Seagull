import { Config } from "./types";
import { Keypair, PublicKey } from "@solana/web3.js";
import { fp32CalcMinTickSizes, fp32FromNumber, tickAlignFloor } from "@seagullfinance/seagull/dist/utils";
import { BN } from "@project-serum/anchor";

export let config: Config = {
    filler: Keypair.fromSecretKey(Uint8Array.from([5,139,124,15,75,212,14,54,13,20,211,161,163,80,117,117,193,125,168,141,250,195,155,210,113,108,228,96,62,233,98,84,214,215,7,214,227,79,248,199,17,237,82,80,153,249,33,237,21,107,117,114,238,114,249,246,240,253,21,128,232,175,39,178])),
    fillerUser: null,
    markets: [
        {
            baseMint: new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1"),
            quoteMint: new PublicKey("8DtFnmrRbasf5Asp8AbZXPw3Fyh41t76GLBiWYFc9yz9"),
            market: null,
            filler: null
        }
    ],
    fillPrice: tickAlignFloor(fp32FromNumber(0.02), fp32CalcMinTickSizes(9)),
    fillSize: new BN(10 ** 9) // 1 of a 9 decimal spl token
}