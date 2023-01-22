import { ClusterConfig } from "../../../models/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const MAINNET: ClusterConfig = {
    clusterName: "Mainnet",
    refreshBalanceInterval: 60,
    walletAdapterNetwork: WalletAdapterNetwork.Mainnet,
    clusterUrl: "https://081a13yv8m5drwsghyz4jgclmz9ikyhz4mozdrmxmnf23osqcd3csylyzuzy7.xyz2.hyperplane.dev",
    commitment: "confirmed",
    transactionTimeout: 120 * 1000,
    tokens: []
}

export default MAINNET;