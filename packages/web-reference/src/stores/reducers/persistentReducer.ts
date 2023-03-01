import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from "../store";

// declaring the types for our state
export type PersistentState = {
    acceptedTermsAndConditionsV1: boolean
};

function initializeState(): PersistentState {
    return {
        acceptedTermsAndConditionsV1: false
    }
}

// Create the actual state
export const persistentSlice = createSlice({
    name: 'persisted',
    initialState: initializeState(),
    reducers: {
        setAcceptedTermsAndConditions: (state, action: PayloadAction<boolean>) => {
            state.acceptedTermsAndConditionsV1 = action.payload;
        },
    },
});

// Export of actions above in created slice
export const {
    setAcceptedTermsAndConditions
} = persistentSlice.actions;

// Exports of selectors of the created slice
export const selectAcceptedTermsAndConditions = (state: RootState) => state.persist.acceptedTermsAndConditionsV1;

// Exporting the reducer here, as we need to add this to the store
export default persistentSlice.reducer;