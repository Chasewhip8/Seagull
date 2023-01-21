import { createAsyncThunk, createSlice, current, ThunkDispatch } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from "../store";
import {
    BalanceDataMap,
    PendingTransaction,
    signMultiplePendingTransactions,
} from "../../utils/transaction/PendingTransaction";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { GetTokenAccountsByOwnerConfig, PublicKey } from "@solana/web3.js";
import { findAssociatedTokenAddressSync } from "../../utils/solana";
import { WRAPPED_SOL_MINT } from "../../models/types";
import { notify } from "../../utils/notifications";
import App from "next/app";

interface AccountData {
    account?: string
}

export type Accounts = BalanceDataMap<AccountData>;
export type Transaction = PendingTransaction<AccountData>;

// declaring the types for our state
export type UserDataState = {
    transactionPending: boolean,
    transactionSendError: string,
    transactionQueueError: string

    userAccounts: Accounts,
    originalUserAccounts: Accounts,

    pendingTransaction: Transaction,
    allTransactions: Transaction[]
};

function initializeState(): UserDataState {
    return {
        transactionPending: false,
        transactionSendError: null,
        transactionQueueError: null,
        userAccounts: {},
        originalUserAccounts: null,
        allTransactions: [],
        pendingTransaction: null
    }
}

export const addTransaction = createAsyncThunk<Transaction,
    { transaction: Transaction, onComplete: (dispatch: AppDispatch) => void },
    { state: RootState }>('userData/addTransaction',
    async ({ transaction, onComplete }, { getState, dispatch }): Promise<Transaction> => {
        const { wallet, connection } = getState().config;

        if (wallet == null || connection == null) {
            throw Error("Wallet or connection invalid!");
        }

        try {
            await transaction.signTransaction(connection, wallet);

            if (onComplete){
                onComplete(dispatch as AppDispatch);
            }
            return transaction;
        } catch (error) {
            notify({ type: 'error', message: `Transaction failed to sign!`, description: transaction.description }, dispatch as AppDispatch);
            console.log("Transaction Failed: " + error?.message);
            throw error;
        }
    }
);

export const addTransactions = createAsyncThunk<Transaction[],
    { transactions: Transaction[], onComplete: (dispatch: AppDispatch) => void },
    { state: RootState }>('userData/addTransactions',
    async ({ transactions, onComplete }, { getState, dispatch }): Promise<Transaction[]> => {
        const { wallet, connection } = getState().config;

        if (wallet == null || connection == null) {
            throw Error("Wallet or connection invalid!");
        }

        try {
            await signMultiplePendingTransactions(transactions, wallet, connection);

            if (onComplete){
                onComplete(dispatch as AppDispatch);
            }
            return transactions;
        } catch (error) {
            notify({ type: 'error', message: `Transactions failed to sign!`,
                description: transactions[0].description + "...(" + (transactions.length - 1) + " more)"}, dispatch as AppDispatch);
            console.log("Transaction Failed: " + error?.message);
            throw error;
        }
    }
);

export const sendTransaction = createAsyncThunk<void,
    void,
    { state: RootState }>('userData/sendTransaction',
    async (v, { getState, dispatch }) => {
        const { wallet, connection } = getState().config;
        const { pendingTransaction } = getState().userData;

        if (wallet == null || connection == null || pendingTransaction == null) {
            throw "Transaction Failed: No transaction or wallet was found!";
        }

        let signature = "";
        try {
            signature = await pendingTransaction.sendTransaction(connection);
            notify({
                type: 'success',
                message: 'Transaction successful!',
                description: pendingTransaction.description,
                txId: signature
            }, dispatch as AppDispatch);
        } catch (error) {
            notify({
                type: 'error',
                message: `Transaction failed and reverted queue!`,
                description: pendingTransaction.description,
                txId: signature
            }, dispatch as AppDispatch);
            console.log("Transaction failed while sending: " + error?.message);
            throw error;
        }
    }
);

// Async Thunk Actions
export const refreshBalances = createAsyncThunk<Accounts,
    void,
    { state: RootState }>('userData/getUserBalances',
    async (v, { getState }): Promise<Accounts> => {
        const { connection, wallet } = getState().config;

        if (getState().userData.pendingTransaction != null){
            console.log("Aborted balance refresh due to inflight transaction!");
            throw Error("Aborted due to inflight transaction");
        }

        const tokenInfos = getState().externalData.tokenList;
        if (!tokenInfos){
            console.warn("Aborted balance due to being fetched before token info has been loaded!");
            throw Error("Token Infos not loaded!");
        }

        console.log("Reloading token account balances...");

        const owner = wallet.publicKey.toBase58();
        const newAccounts: Accounts = {};

        for (const pubkey in tokenInfos){
            const info = tokenInfos[pubkey];

            newAccounts[info.mint] = {
                balance: 0,
                account: findAssociatedTokenAddressSync(owner, info.mint).toBase58()
            }
        }

        const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey,
            { programId: TOKEN_PROGRAM_ID },
            {
                commitment: "finalized",
                dataSlice: {
                    offset: 0,
                    length: 64 + 8
                }
            } as GetTokenAccountsByOwnerConfig
        );

        for (const { pubkey, account } of tokenAccounts.value){
            const mint = new PublicKey(account.data.subarray(0, 32));
            const mintBase58 = mint.toBase58();
            const info = tokenInfos[mintBase58];

            if (!info){
                continue;
            }

            const balance = new DataView(account.data.buffer).getBigUint64(64, true);
            newAccounts[mintBase58] = {
                balance: Number(balance) / (10 ** info.decimals),
                account: pubkey.toBase58()
            };
        }

        newAccounts[WRAPPED_SOL_MINT] = {
            balance: (await connection.getBalance(wallet.publicKey, "finalized")) / 1000000000,
            account: findAssociatedTokenAddressSync(owner, WRAPPED_SOL_MINT).toBase58()
        };

        return newAccounts;
    }
);

// Create the actual state
export const userDataSlice = createSlice({
    name: 'userData',
    initialState: initializeState(),
    reducers: {
        // No reducer needed to set the connection or wallet as if they change the entire state should be reset with the resetConfigState action.
        resetUserState: () => initializeState()
    },
    extraReducers: builder => {
        builder
            .addCase(addTransaction.fulfilled, (state, { payload }) => {
                if (state.originalUserAccounts == null) {
                    state.originalUserAccounts = state.userAccounts;
                }

                if (state.pendingTransaction == null) {
                    state.pendingTransaction = payload;
                    state.userAccounts = payload.applyPatchesAll(state.userAccounts);
                } else {
                    state.userAccounts = state.pendingTransaction.addPendingTransaction(payload);
                }
                state.allTransactions.push(payload);
            })
            .addCase(addTransaction.rejected, (state, error) => {
                state.transactionQueueError = error.error?.message;
            })
            .addCase(addTransactions.fulfilled, (state, { payload }) => {
                if (state.originalUserAccounts == null) {
                    state.originalUserAccounts = state.userAccounts;
                }

                for (const tx of payload){
                    if (state.pendingTransaction == null) {
                        state.pendingTransaction = tx;
                        // Make sure to use current() here to not leak a writeable draft into another immer producer
                        state.userAccounts = tx.applyPatchesAll(current(state.userAccounts));
                    } else {
                        state.userAccounts = state.pendingTransaction.addPendingTransaction(tx);
                    }
                }
                state.allTransactions.push(...payload);
            })
            .addCase(addTransactions.rejected, (state, error) => {
                state.transactionQueueError = error.error?.message;
            })
            .addCase(sendTransaction.pending, state => {
                state.transactionPending = true;
            })
            .addCase(sendTransaction.fulfilled, state => {
                state.transactionPending = false;
                // This transactions state is now confirmed, make it the original.
                state.originalUserAccounts = state.pendingTransaction.state;

                // Move to next transaction
                state.pendingTransaction = state.pendingTransaction.nextTransaction;
                state.allTransactions.shift();
            })
            .addCase(sendTransaction.rejected, (state, payload) => {
                state.transactionPending = false;
                state.userAccounts = state.originalUserAccounts;
                state.originalUserAccounts = null;
                // Clear all pending since we failed
                state.allTransactions = [];
                state.pendingTransaction = null;
            })
            .addCase(refreshBalances.fulfilled, (state, { payload }) => {
                state.userAccounts = payload;
            })
    }
});

// Export of actions above in created slice
export const {
    resetUserState
} = userDataSlice.actions;

// Exports of selectors of the created slice
export const selectPendingTransaction = (state: RootState) => state.userData.pendingTransaction;
export const selectAllTransactions = (state: RootState) => state.userData.allTransactions;
export const selectUserAccounts = (state: RootState) => state.userData.userAccounts;

// Exporting the reducer here, as we need to add this to the store
export default userDataSlice.reducer;