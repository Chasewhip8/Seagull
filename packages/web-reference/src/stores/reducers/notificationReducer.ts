import { createSlice, current, PayloadAction, } from '@reduxjs/toolkit';
import { DEFAULT_CLUSTER } from "../../configs/ClusterConfig";
import { ClusterConfig, Notification } from "../../models/types";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { RootState } from "../store";

// declaring the types for our state
export type NotificationState = {
    notifications: Notification[]
};

function initializeState(cluster: ClusterConfig, wallet: WalletContextState): NotificationState {
    return {
        notifications: []
    }
}

// Create the actual state
export const notificationSlice = createSlice({
    name: 'notification',
    initialState: initializeState(DEFAULT_CLUSTER, null),
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action: PayloadAction<Notification>) => {
            // Filter out the notification passed into the action.
            // Use current to access the real object for filtering. Otherwise, we are filtering a proxy object which won't work.
            state.notifications = current(state.notifications).filter(notification => {
                return notification != action.payload
            });
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        // No reducer needed to set the connection or wallet as if they change the entire state should be reset with the resetConfigState action.
        resetNotificationState: (
            state,
            action: PayloadAction<{ config: ClusterConfig, wallet: WalletContextState }>
        ) => initializeState(action.payload.config, action.payload.wallet)
    },
});

// Export of actions above in created slice
export const {
    addNotification,
    removeNotification
} = notificationSlice.actions;

// Exports of selectors of the created slice
export const selectNotifications = (state: RootState) => state.notification.notifications;

// Exporting the reducer here, as we need to add this to the store
export default notificationSlice.reducer;