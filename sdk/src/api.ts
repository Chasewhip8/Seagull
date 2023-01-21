import * as anchor from "@project-serum/anchor";

import { AnchorProvider, BN, Idl, Program, Provider } from "@project-serum/anchor";
import {
    Connection,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
    TransactionInstruction,
    TransactionSignature
} from "@solana/web3.js";
import { Market, Side, User } from "./types";

export abstract class SeagullMarketProvider<T extends Idl> {
    private readonly _connection: Connection;
    private readonly _program: anchor.Program<T>;

    protected constructor(connection: Connection, programId: anchor.web3.PublicKey) {
        this._connection = connection;
        this._program = this.createProgram(
            programId,
            new AnchorProvider(
                connection,
                {
                    publicKey: PublicKey.default,
                    signTransaction(): Promise<Transaction> {
                        return Promise.reject();
                    },
                    signAllTransactions(): Promise<Transaction[]> {
                        return Promise.reject();
                    }
                },
                { commitment: connection.commitment }
            )
        );
    }

    public async sendTransaction<ARGS extends any[]>(
        keypair: anchor.web3.Signer,
        sendConfig: anchor.web3.ConfirmOptions,
        instructionFunction: (...args: ARGS) => Promise<TransactionInstruction>,
        ...args: ARGS
    ): Promise<TransactionSignature> {
        const ix: TransactionInstruction = await instructionFunction.apply(null, args);
        const transaction = new Transaction({
            feePayer: keypair.publicKey,
            ...await this.connection.getLatestBlockhash(sendConfig.commitment)
        });
        transaction.add(ix);
        transaction.sign(keypair);

        return sendAndConfirmTransaction(this.connection, transaction, [keypair], sendConfig);
    }

    get connection(): Connection {
        return this._connection;
    }

    get program(): Program<T> {
        return this._program;
    }

    public abstract createProgram(programId: PublicKey, provider: Provider): Program<T>;

    public abstract initMarket(
        payer: PublicKey,
        quoteMint: PublicKey,
        baseMint: PublicKey,
        quoteHoldingAccount: PublicKey,
        baseHoldingAccount: PublicKey,
    ): Promise<TransactionInstruction>;

    public abstract initUser(
        authority: PublicKey,
        market: Market,
        user_id: BN
    ): Promise<TransactionInstruction>;

    public abstract placeOrder(
        side: Side,
        amount: BN,
        lowest_price: BN,
        a_end: BN,
        market: Market,
        user: User
    ): Promise<TransactionInstruction>;

    public abstract cancelOrder(
        order_id: BN,
        market: Market,
        user: User
    ): Promise<TransactionInstruction>;

    public abstract settleOrder(
        order_id: BN,
        market: Market,
        user: User,
        filler: User,
        quoteHoldingAccount: PublicKey,
        baseHoldingAccount: PublicKey,
    ): Promise<TransactionInstruction>;

    public abstract fillOrder(
        side: Side,
        max_size: BN,
        price: BN,
        expire_slot: BN,
        market: Market,
        filler: User,
    ): Promise<TransactionInstruction>;

    public abstract claimUnsettled(
        market: Market,
        user: User,
    ): Promise<TransactionInstruction>;
}