import { createAsyncThunk, createSlice, PayloadAction, } from '@reduxjs/toolkit';
import { RootState } from "../store";
import { TokenInfo } from "../../models/types";

export type TokenMap = {[key: string]: TokenInfo};
export type MarketPriceMap = {[key: string]: number};

// declaring the types for our state
export type ExternalDataState = {
    pending: boolean,
    error: string,

    tokenListLoaded: boolean,
    tokenList: TokenMap
};

function initializeState(): ExternalDataState {
    return {
        pending: false,
        error: null,

        tokenListLoaded: false,
        tokenList: {}
    }
}

// Load Jupiter Token List
export const loadTokenList = createAsyncThunk<TokenMap, void, { state: RootState }>(
    'externalData/loadTokenList',
    async (v, {getState}): Promise<TokenMap> => {
        if (getState().externalData.tokenListLoaded){
            return getState().externalData.tokenList;
        }

        // Create new map.
        const newTokenList = {} as TokenMap;

        // Load internal config
        getState().config.cluster.tokens.map((token) => {
            newTokenList[token.mint] = token;
        })

        return newTokenList;
    }
);

// Create the actual state
export const marketDataSlice = createSlice({
    name: 'externalData',
    initialState: initializeState(),
    reducers: {
        resetExternalState: () => {
            return initializeState();
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadTokenList.fulfilled, (state, action: PayloadAction<TokenMap>) => {
                state.tokenListLoaded = true;
                state.tokenList = {...state.tokenList, ...action.payload};
            })
    },
});

// Export of actions above in created slice
export const {
    resetExternalState
} = marketDataSlice.actions;

// Exports of selectors of the created slice
export const selectTokenInfos = (state: RootState) => state.externalData.tokenList;
export const selectTokenListLoaded = (state: RootState) => state.externalData.tokenListLoaded;

// Exporting the reducer here, as we need to add this to the store
export default marketDataSlice.reducer;