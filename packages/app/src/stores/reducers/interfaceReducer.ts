import { createAsyncThunk, createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { Market, MarketSide, Side } from "@seagullfinance/seagull/dist/types";
import { RootState } from "../store";
import { PublicKey } from "@solana/web3.js";
import { addTransaction, addTransactions, refreshBalances, sendTransaction } from "./userDataReducer";

// declaring the types for our state
export type interfaceState = {
    amount: number,
    price: number,
    auctionLength: number,

    market: Market,
    side: Side
};

function initializeState(): interfaceState {
    return {
        amount: 0,
        price: 0,
        auctionLength: 0,
        market: null,
        side: MarketSide.Buy
    }
}

export const setMarket = createAsyncThunk<Market,
    string,
    { state: RootState }>('interface/setMarket',
    async (address, { getState }): Promise<Market> => {
        return await getState().config.sdk.fetchMarket(new PublicKey(address));
    }
);

// Create the actual state
export const interfaceSlice = createSlice({
    name: 'interface',
    initialState: initializeState(),
    reducers: {
        resetInterfaceState: () => {
            return initializeState();
        },
        setSide: (state, action: PayloadAction<Side>) => {
            state.side = action.payload;
        },
        setAmount: (state, action: PayloadAction<number>) => {
            state.amount = action.payload;
        },
        setAuctionLength: (state, action: PayloadAction<number>) => {
            state.auctionLength = action.payload;
        },
        setPrice: (state, action: PayloadAction<number>) => {
            state.price = action.payload;
        }
    },
    extraReducers: builder => {
        builder
            .addCase(setMarket.fulfilled, (state, { payload }) => {
                state.market = payload;
            })
    }
});

// Export of actions above in created slice
export const {
    resetInterfaceState,
    setSide,
    setPrice,
    setAmount,
    setAuctionLength
} = interfaceSlice.actions;

// Exports of selectors of the created slice
export const selectAmount = (state: RootState) => state.interface.amount;
export const selectPrice = (state: RootState) => state.interface.price;
export const selectAuctionLength = (state: RootState) => state.interface.auctionLength;
export const selectMarket = (state: RootState) => state.interface.market;
export const selectSide = (state: RootState) => state.interface.side;

// Exporting the reducer here, as we need to add this to the store
export default interfaceSlice.reducer;