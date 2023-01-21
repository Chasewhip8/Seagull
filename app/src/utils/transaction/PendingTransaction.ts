import { Connection, Transaction, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { createTransaction, sendTransaction, signTransaction, signTransactions } from "./transactions";

import { produce } from "immer";
import { KeyValueMap } from "../../models/types";

export type BalanceData<T = unknown> = { balance: number } & T;
export type BalanceDataMap<T> = KeyValueMap<BalanceData<T>>;

export class PendingTransaction<T> {
    private readonly _id: number;
    // Description of updates made by the transaction displayed to the user, these cannot change
    private readonly _description: string;

    // A function to produce a signed transaction reflecting the changes set via the draft
    private readonly transactionInstructionProvider: () => Promise<TransactionInstruction[] | Transaction>;
    private signedTransaction: Transaction;
    private readonly expectedChanges: (draft: BalanceDataMap<T>) => BalanceDataMap<T> | void | undefined;

    // An Immer curried producer of the last state mutating to expected state.
    constructor(
        description,
        expectedChanges: (draft: BalanceDataMap<T>) => BalanceDataMap<T> | void | undefined,
        transactionInstructionProvider: () => Promise<TransactionInstruction[] | Transaction>
    ) {
        this._id = Math.random();
        this._description = description;
        this.transactionInstructionProvider = transactionInstructionProvider;
        this.expectedChanges = expectedChanges;
        this._sentTransaction = false;
        this._signTime = 0;
    }

    private _signTime: number;

    get signTime() {
        return this._signTime;
    }

    private _sentTransaction: boolean;

    get sentTransaction() {
        return this._sentTransaction;
    }

    private _state: BalanceDataMap<T>;

    get state(): BalanceDataMap<T> {
        return this._state;
    }

    private _nextTransaction: PendingTransaction<T>;

    get nextTransaction(): PendingTransaction<T> {
        return this._nextTransaction;
    }

    get id(): number {
        return this._id;
    }

    get signInvalidTime() {
        return this._signTime + 120_000;
    }

    get description() {
        return this._description;
    }

    /**
     * Adds a pending transaction to the furthest link in the chain and sets the
     * state of the transaction to its parents state. Returns an error if a validity
     * check fails.
     *
     * @param pendingTransaction the transaction to add
     */
    public addPendingTransaction(pendingTransaction: PendingTransaction<T>): BalanceDataMap<T> {
        if (this._nextTransaction) {
            return this._nextTransaction.addPendingTransaction(pendingTransaction);
        } else {
            this._nextTransaction = pendingTransaction;
            return pendingTransaction.applyInternalPatches(this._state);
        }
    }

    public async signTransaction(connection: Connection, wallet: WalletContextState) {
        if (connection == null || wallet == null) {
            throw Error("Connection or wallet not provided!");
        }

        const transaction = await this.getUnsignedTransaction(connection, wallet);
        const signedTransaction = await signTransaction(wallet, transaction);

        this.setSignedTransaction(signedTransaction);
    }

    public async getUnsignedTransaction(connection: Connection, wallet: WalletContextState){
        const providerResult = await this.transactionInstructionProvider();
        if (providerResult == null) {
            throw Error("result was invalid!");
        }

        if (providerResult instanceof Transaction){
            return providerResult;
        } else {
            return await createTransaction(connection, wallet, providerResult);
        }
    }

    public setSignedTransaction(signedTransaction: Transaction) {
        if (!signedTransaction.verifySignatures()){
            throw Error("Transaction signatures are invalid!");
        }

        this._signTime = Date.now(); // Keep this before we ask for sign since the blockhash is what matters
        this.signedTransaction = signedTransaction;
    }

    public async sendTransaction(connection: Connection): Promise<TransactionSignature> {
        const RESEND_INTERVAL = 15;
        const MAX_RESENDS = 5;

        const sleep = (ms) => new Promise(
            resolve => setTimeout(resolve, ms)
        );

        const withinRetryPeriod = () => {
            return Date.now() < this.signInvalidTime - (RESEND_INTERVAL * 1000);
        }

        this._sentTransaction = true;

        return new Promise(async (resolve, reject) => {
            let signature;
            let confirmedSent = false;
            let subscribedWebsocket = false;
            let numResends = 0;

            while (true){
                try {
                    if (!withinRetryPeriod()){
                        reject("Transaction Listen Loop (fatal): Internal Timeout");
                        return;
                    }

                    if (signature) {
                        const response = await connection.getSignatureStatuses([signature]);
                        const payload = response ? response.value[0] : null;

                        if (payload && !payload.err) {
                            if (payload.confirmationStatus == "finalized"){
                                resolve(signature);
                                return
                            } else {
                                confirmedSent = true;
                            }
                        }
                    }

                    if (!confirmedSent && numResends < MAX_RESENDS){
                        try {
                            numResends++;
                            signature = await sendTransaction(connection, this.signedTransaction);
                        } catch (err){
                            if (err == "Error: failed to send transaction: Transaction simulation failed: This transaction has already been processed"){
                                confirmedSent = true;
                            }
                        }
                    }

                    if (!subscribedWebsocket && signature){
                        subscribedWebsocket = true;
                        connection.onSignature(signature, (signatureResult) => {
                            if (signatureResult.err){
                                subscribedWebsocket = false;
                            } else {
                                resolve(signature);
                                return;
                            }
                        }, "finalized");
                    }

                    await sleep(RESEND_INTERVAL * 1000);
                } catch (err){
                    if (!withinRetryPeriod()){
                        reject("Transaction Listen Loop (fatal): " + err);
                        return;
                    }
                    if (signature){
                        connection.removeSignatureListener(signature).then(() => {
                            console.log("Unsubscribed from listener: " + signature);
                        });
                    }
                }
            }
        });
    }

    public applyPatchesAll(state: BalanceDataMap<T>): BalanceDataMap<T> {
        const newState = this.applyInternalPatches(state);
        if (this.nextTransaction) {
            return this.nextTransaction.applyPatchesAll(newState);
        }
        return newState;
    }

    private applyInternalPatches(state: BalanceDataMap<T>): BalanceDataMap<T> {
        this._state = produce(state, this.expectedChanges);
        return this._state;
    }
}

export async function signMultiplePendingTransactions(transactions: PendingTransaction<any>[], wallet: WalletContextState, connection: Connection){
    const transactionObjects = await Promise.all(transactions.map((ptx) => ptx.getUnsignedTransaction(connection, wallet)));
    const signedTransactions = await signTransactions(wallet, transactionObjects);

    signedTransactions.map((stx, index) => transactions[index].setSignedTransaction(stx));
}