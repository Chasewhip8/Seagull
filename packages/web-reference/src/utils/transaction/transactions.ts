import { Connection, Transaction, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

export async function createTransaction(
    connection: Connection,
    wallet: WalletContextState,
    ixs: TransactionInstruction[]
): Promise<Transaction> {
    const latestBlockHash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
    });

    transaction.instructions.push(...ixs);
    return transaction;
}

export async function signTransaction(
    wallet: WalletContextState,
    transaction: Transaction
): Promise<Transaction> {
    const { signTransaction } = wallet;
    return signTransaction(transaction);
}

export async function signTransactions(
    wallet: WalletContextState,
    transactions: Transaction[]
): Promise<Transaction[]> {
    const { signAllTransactions } = wallet;
    return signAllTransactions(transactions);
}

export async function sendTransaction(
    connection: Connection,
    transaction: Transaction
): Promise<TransactionSignature> {
    return connection.sendRawTransaction(transaction.serialize(), {
        maxRetries: 5,
        preflightCommitment: "confirmed",
        skipPreflight: true
    });
}