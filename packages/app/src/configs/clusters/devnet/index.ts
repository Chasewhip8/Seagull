import { ClusterConfig } from "../../../models/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ICON_B_SOL, ICON_BONK, ICON_M_SOL, ICON_SOL } from "../../../utils/images";
import { clusterApiUrl } from "@solana/web3.js";

const DEVNET: ClusterConfig = {
  clusterName: "Devnet",
  tokens: [
    {
      name: "BlazeStake Staked SOL",
      symbol: "bSOL",
      tokenIcon: ICON_B_SOL,
      extraInfo: "Solana Liquid Staking Token",
      mint: "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
      decimals: 9,
    },
    {
      name: "Solana",
      symbol: "SOL",
      tokenIcon: ICON_SOL,
      extraInfo: "Native Currency of Solana",
      mint: "So11111111111111111111111111111111111111112", // wSOL mint
      decimals: 9
    }
  ],
  markets: [
    {
      name: "bSOL/SOL",
      description: "Liquid Unstake Market",
      image: ICON_B_SOL,
      address: "6o3wPDXRyvSgsvmyTs43cfusuWLH5uGjEcPDtqfQG8QG"
    },
    {
      name: "mSOL/SOL",
      description: "Liquid Unstake Market",
      image: ICON_M_SOL,
      address: "testAddress2"
    },
    {
      name: "BONK/SOL",
      description: "JIT Market",
      image: ICON_BONK,
      address: "testAddress3"
    }
  ],
  programId: "5m6icMgJpaZoWywACLyRtTrdZ52FUoR6x6iuciKky9J2",
  walletAdapterNetwork: WalletAdapterNetwork.Devnet,
  refreshBalanceInterval: 120,
  clusterUrl: clusterApiUrl('devnet'),
  commitment: "confirmed",
  transactionTimeout: 120 * 1000,
};

export default DEVNET;
