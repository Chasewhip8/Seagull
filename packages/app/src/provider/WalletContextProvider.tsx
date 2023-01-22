import { WalletError } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider as ReactUIWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { selectClusterConfig } from "../stores/reducers/configReducer";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolletExtensionWalletAdapter, SolletWalletAdapter } from "@solana/wallet-adapter-sollet";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-ledger";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { useAppSelector } from "../hooks/common";

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { walletAdapterNetwork, transactionTimeout } = useAppSelector(selectClusterConfig);
    const autoConnect = true; // TODO fix this and add persistent store setting

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network: walletAdapterNetwork }),
            new SolletWalletAdapter({ network: walletAdapterNetwork, timeout: transactionTimeout }),
            new SolletExtensionWalletAdapter({ network: walletAdapterNetwork, timeout: transactionTimeout }),
            new LedgerWalletAdapter()
        ],
        [walletAdapterNetwork, transactionTimeout]
    );

    const onError = useCallback((error: WalletError) => {
        console.error("Wallet Extension Error: " + error);
    }, []);

    return (
        <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
            <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
        </WalletProvider>
    );
};