import { FC, useEffect } from "react";
import { selectClusterConfig, selectWallet } from "../stores/reducers/configReducer";
import { resetStore } from "../stores/store";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { useAppDispatch, useAppSelector } from "../hooks/common";

export const WalletContextConsumer: FC = () => {
    const oldWallet: WalletContextState = useAppSelector(selectWallet);
    const clusterConfig = useAppSelector(selectClusterConfig);
    const newWallet = useWallet();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (newWallet == oldWallet) {
            return
        }

        if (!newWallet.connected && oldWallet != null) {
            dispatch(resetStore(clusterConfig, null, true));
        } else if (newWallet.connected && (oldWallet == null || newWallet.publicKey !== oldWallet.publicKey)) {
            dispatch(resetStore(clusterConfig, newWallet));
        }
    }, [clusterConfig, dispatch, newWallet, oldWallet]);

    return (
        <></>
    )
}
