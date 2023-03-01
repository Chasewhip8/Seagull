import { FC, PropsWithChildren } from "react";
import { selectClusterConfig, selectWallet } from "../stores/reducers/configReducer";
import { refreshBalances } from "../stores/reducers/userDataReducer";
import { useAppDispatch, useAppSelector, useRefresh } from "../hooks/common";
import { selectTokenListLoaded } from "../stores/reducers/externalDataReducer";

export const RefreshProvider: FC<PropsWithChildren> = ({ children }) => {
    const dispatch = useAppDispatch();
    const cluster = useAppSelector(selectClusterConfig);
    const wallet = useAppSelector(selectWallet);
    const tokenListLoaded = useAppSelector(selectTokenListLoaded);

    useRefresh(() => {
        dispatch(refreshBalances());
    }, Boolean(wallet?.publicKey && tokenListLoaded), cluster.refreshBalanceInterval * 1000, false, 15_000);

    return (
        <>
            {children}
        </>
    )
}