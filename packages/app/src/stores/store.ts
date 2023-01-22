import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { ClusterConfig } from "../models/types";
import configReducer, { resetConfigState } from "./reducers/configReducer";
import { WalletContextState } from "@solana/wallet-adapter-react";
import notificationReducer from "./reducers/notificationReducer";
import interfaceReducer from './reducers/interfaceReducer';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from "redux-persist/es/types";
import persistentReducer, { PersistentState } from "./reducers/persistentReducer";
import externalDataReducer, {
    loadTokenList,
    resetExternalState
} from "./reducers/externalDataReducer";
import userDataReducer from "./reducers/userDataReducer";

const persistConfig: PersistConfig<any> = {
    key: 'root',
    storage
};

export const store = configureStore({
    reducer: {
        config: configReducer,
        notification: notificationReducer,
        externalData: externalDataReducer,
        interface: interfaceReducer,
        userData: userDataReducer,
        persist: persistReducer<PersistentState>(persistConfig, persistentReducer)
    },
    // TODO REMOVE THIS AND FIX THE UNDERLYING ISSUE
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
    // END OR FIX TO REMOVE
});

export const persistor = persistStore(store);

export const initialLoadStore = () => async (dispatch) => {
    await dispatch(loadTokenList());
}

export const resetStore = (
    cluster: ClusterConfig,
    wallet: WalletContextState = null,
    resetWallet?: boolean
) => async (dispatch, getState) => {
    // we don't pass in a wallet if we just change the config cluster
    // from dev to main for example. In this case, pass in the current
    // wallet.

    if (!resetWallet) {
        wallet = wallet || getState().config.wallet;
    }

    await Promise.all([
        dispatch(resetConfigState({ cluster, wallet })),
        dispatch(resetExternalState()),
        dispatch(initialLoadStore())
    ]);
}

/**
 * Hijack Bigint Serialization
 *
 * For some ungodly reason BigInt is not serializable, sometimes??, so
 * we ripped this out of a GitHub issue because JSON is a dinosaur.
 *
 * https://github.com/GoogleChromeLabs/jsbi/issues/30
 */
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ExtraThunkArg = unknown> = ThunkAction<void,
    RootState,
    ExtraThunkArg,
    Action<string>>;