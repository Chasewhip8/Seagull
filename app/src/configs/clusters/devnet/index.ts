import { ClusterConfig } from "../../../models/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const DEVNET: ClusterConfig = {
    clusterName: "Devnet",
    tokens: [],
    walletAdapterNetwork: WalletAdapterNetwork.Devnet,
    refreshBalanceInterval: 60,
    clusterUrl: "https://devnet.genesysgo.net/",
    commitment: "confirmed",
    transactionTimeout: 120 * 1000
}

export default DEVNET;