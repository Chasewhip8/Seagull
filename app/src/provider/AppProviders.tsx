import { FC, PropsWithChildren, useEffect } from "react";
import { initialLoadStore } from "../stores/store";
import { WalletContextConsumer } from "./WalletContextConsumer";
import { WalletContextProvider } from "./WalletContextProvider";
import { WindowContextProvider } from "./WindowContextProvider";
import { RefreshProvider } from "./RefreshProvider";
import { useAppDispatch } from "../hooks/common";

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initialLoadStore());
    }, [dispatch]);

    return (
        <WindowContextProvider>
            <WalletContextProvider>
                <WalletContextConsumer/> {/*Needed to steal the wallet and put it in our redux store on change, issues reset sequence as well*/}
                <RefreshProvider>
                    {children}
                </RefreshProvider>
            </WalletContextProvider>
        </WindowContextProvider>
    )
}