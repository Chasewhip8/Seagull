import { ClusterConfig } from "../../../models/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ICON_B_SOL, ICON_BONK, ICON_M_SOL, ICON_SOL } from "../../../utils/images";

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
      address: "testAddress"
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
  programId: "DmcruH9NFwSAxZL4u1UdQd3S5TQdS8SQGFjFbng5KBEC",
  walletAdapterNetwork: WalletAdapterNetwork.Devnet,
  refreshBalanceInterval: 60,
  clusterUrl: "https://localhost:8899/",
  commitment: "confirmed",
  transactionTimeout: 120 * 1000,
};

export default DEVNET;
