import { ClusterConfig } from "../../../models/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ICON_B_SOL, ICON_BONK, ICON_M_SOL, ICON_SOL } from "../../../utils/images";
import { clusterApiUrl } from "@solana/web3.js";
import { SEAGULL_PROGRAM_ID } from "@seagullfinance/seagull";

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
    },
    {
      name: "Test",
      symbol: "TEST",
      tokenIcon: ICON_SOL,
      extraInfo: "Native Currency of Testing",
      mint: "8DtFnmrRbasf5Asp8AbZXPw3Fyh41t76GLBiWYFc9yz9",
      decimals: 9
    }
  ],
  markets: [
    {
      name: "bSOL/TEST",
      description: "Liquid Unstake Market",
      image: ICON_B_SOL,
      address: "DURFmkAW8HJcDG23PF4aDZ89isSfVvXx1ErsNS6Y7Fow"
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
  programId: SEAGULL_PROGRAM_ID.toBase58(),
  walletAdapterNetwork: WalletAdapterNetwork.Devnet,
  refreshBalanceInterval: 120,
  clusterUrl: clusterApiUrl('devnet'),
  commitment: "confirmed",
  transactionTimeout: 120 * 1000,
};

export default DEVNET;
