import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export type AccountWithKey<T> = T & { publicKey: PublicKey };

export type TypedKeyMap<K extends string, V> = { [k in K]: V };
export type SideKey = "Buy" | "Sell";
export type Side = { buy: {} } | { sell: {} };

export const MarketSide: TypedKeyMap<SideKey, Side> = {
    Buy: { buy: {} },
    Sell: { sell: {} }
};

export type User = AccountWithKey<UserType>;
export type UserType = {
    authority: PublicKey,
    userId: BN,
    openQuote: BN,
    openBase: BN,
}

export type Market = AccountWithKey<MarketType>;
export type MarketType = {
    quoteMint: PublicKey,
    quoteHoldingAccount: PublicKey,
    baseMint: PublicKey,
    baseHoldingAccount: PublicKey,
    orderQueue: PublicKey,
    minTickSize: BN,
    bump: number
}

export type MarketEvent<T> = {
    data: T,
    name: string
}

export type OrderMatchedEvent = {
    market: PublicKey,
    orderId: BN,
    newFillerId: BN,
    replacedFilerId: BN
}

export type OrderRematchFailEvent = {
    market: PublicKey,
    originalOrderId: BN,
    fillerId: BN
}

export type OrderPlaceEvent = {
    market: PublicKey,
    orderId: BN,
    size: BN,
    aEnd: BN
}

export type OrderEditEvent = OrderPlaceEvent;

export type OrderCancelEvent = {
    market: PublicKey,
    orderId: BN,
}

export type OrderSettledEvent = {
    market: PublicKey,
    orderId: BN,
    settledPrice: BN,
    settledSize: BN
}