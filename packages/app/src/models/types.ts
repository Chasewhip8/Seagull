import { Commitment } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export type ClusterConfig = {
    clusterName: string,
    clusterUrl: string,
    refreshBalanceInterval: number,
    walletAdapterNetwork: WalletAdapterNetwork,
    commitment: Commitment,
    transactionTimeout: number,
    tokens: TokenInfo[],
    markets: MarketInfo[]
}

export type TokenInfo = {
    name: string,
    symbol: string,
    tokenIcon: any,
    mint: string,
    price?: number,
    extraInfo?: string,
    decimals?: number
}

export type MarketInfo = {
    name: string,
    address: string,
    image: any,
    description: string
}

export interface KeyValueMap<T> {
    [key: string]: T;
}

export const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export type Notification = {
    message: string,
    description?: string,
    type: NotificationType,
    txId?: string,
    timeout?: number
}