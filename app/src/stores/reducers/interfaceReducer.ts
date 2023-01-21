import { createSlice, PayloadAction, } from '@reduxjs/toolkit';
import { RootState } from "../store";

// declaring the types for our state
export type interfaceState = {

};

function initializeState(): interfaceState {
    return {

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

// Exporting the reducer here, as we need to add this to the store
export default interfaceSlice.reducer;