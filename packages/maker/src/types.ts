import { PublicKey, Signer } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Market, User } from "@seagullfinance/seagull/dist/types";

export type Config = {
    filler: Signer,
    fillerUser: User | null,
    markets: MarketInfo[],
    fillPrice: BN,
    fillSize: BN
}

export type MarketInfo = {
    quoteMint: PublicKey,
    baseMint: PublicKey,
    market: Market | null,
    filler: User | null
}