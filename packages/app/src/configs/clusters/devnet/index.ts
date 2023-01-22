import { ClusterConfig } from "../../../models/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const DEVNET: ClusterConfig = {
  clusterName: "Devnet",
  tokens: [
    {
      name: "JFI",
      symbol: "JFI",
      tokenIcon:
        "/_next/static/images/jungleIconSmall-fb5fb414a151589d5967fce1721d3cbb.svg",
      extraInfo: "Jungle Governance Token",
      mint: "GePFQaZKHcWE5vpxHfviQtH5jgxokSs51Y5Q4zgBiMDs",
      decimals: 9,
    },
  ],
  walletAdapterNetwork: WalletAdapterNetwork.Devnet,
  refreshBalanceInterval: 60,
  clusterUrl: "https://devnet.genesysgo.net/",
  commitment: "confirmed",
  transactionTimeout: 120 * 1000,
};

export default DEVNET;
