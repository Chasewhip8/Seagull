import { createSlice } from '@reduxjs/toolkit';
import { Market, MarketSide, Side, User } from "@seagullfinance/seagull/dist/types";
import { RootState } from "../store";

// declaring the types for our state
export type interfaceState = {
    inputAmount: number,
    market: Market,
    user: User,
    side: Side
};

function initializeState(): interfaceState {
    return {
        inputAmount: 0,
        market: null,
        user: null,
        side: MarketSide.Buy
    }
}

// Create the actual state
export const interfaceSlice = createSlice({
    name: 'interface',
    initialState: initializeState(),
    reducers: {
        resetInterfaceState: () => {
            return initializeState();
        }
    },
});

// Export of actions above in created slice
export const {
    resetInterfaceState,
} = interfaceSlice.actions;

// Exports of selectors of the created slice
export const selectInputAmount = (state: RootState) => state.interface.inputAmount;
export const selectMarket = (state: RootState) => state.interface.market;
export const selectUser = (state: RootState) => state.interface.user;
export const selectSide = (state: RootState) => state.interface.side;

// Exporting the reducer here, as we need to add this to the store
export default interfaceSlice.reducer;