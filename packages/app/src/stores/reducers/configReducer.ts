import { createSlice, PayloadAction, } from '@reduxjs/toolkit';
import { DEFAULT_CLUSTER } from "../../configs/ClusterConfig";
import { ClusterConfig } from "../../models/types";
import { RootState } from "../store";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { SeagullMarketProvider } from "@seagullfinance/seagull/dist/api";
import { SeagullSocks } from "@seagullfinance/seagull/dist/provider";

// declaring the types for our state
export type ConfigState = {
    cluster: ClusterConfig,
    connection: Connection,
    sdk: SeagullMarketProvider<any>,
    wallet: WalletContextState
};

function initializeState(cluster: ClusterConfig, wallet: WalletContextState): ConfigState {
    const connection = new Connection(cluster.clusterUrl, {
        commitment: cluster.commitment,
        confirmTransactionInitialTimeout: cluster.transactionTimeout
    });

    return {
        cluster: cluster,
        connection: connection,
        sdk: new SeagullSocks(connection, new PublicKey(cluster.programId)),
        wallet: wallet
    }
}

// Create the actual state
export const configSlice = createSlice({
    name: 'config',
    initialState: initializeState(DEFAULT_CLUSTER, null),
    reducers: {
        // No reducer needed to set the connection or wallet as if they change the entire state should be reset with the resetConfigState action.
        resetConfigState(
            state,
            action: PayloadAction<{
                cluster: ClusterConfig,
                wallet: WalletContextState
            }>
        ) {
            return initializeState(action.payload.cluster, action.payload.wallet);
        }
    }
});

// Export of actions above in created slice
export const {
    resetConfigState
} = configSlice.actions;

// Exports of selectors of the created slice
export const selectClusterConfig = (state: RootState) => state.config.cluster;
export const selectConnection = (state: RootState) => state.config.connection;
export const selectWallet = (state: RootState) => state.config.wallet;
export const selectSDK = (state: RootState) => state.config.sdk;

// Exporting the reducer here, as we need to add this to the store
export default configSlice.reducer;