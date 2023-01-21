import * as anchor from "@project-serum/anchor";

import { AnchorProvider, Idl, Program, Provider } from "@project-serum/anchor";
import { Connection, PublicKey, sendAndConfirmTransaction, Transaction, TransactionInstruction } from "@solana/web3.js";
import { EndPoint } from "./types";

export abstract class SeagullMarketProvider<T extends Idl> {
    private readonly _connection: Connection;
    private readonly _program: anchor.Program<T>;
    private readonly _cluster: EndPoint;

    protected constructor(connection: Connection, programId: anchor.web3.PublicKey, cluster: EndPoint) {
        this._cluster = cluster;
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
                {commitment: connection.commitment}
            )
        );
    }

    private async sendTransactionAndConfirm(
        signers: anchor.web3.Signer[],
        instruction: TransactionInstruction[],
        confirmOptions?: anchor.web3.ConfirmOptions
    ): Promise<anchor.web3.TransactionSignature> {
        const sendConfig = confirmOptions ?? {commitment: this._connection.commitment};

        const transaction = new Transaction({
            feePayer: signers[0].publicKey,
            ...(await this._connection.getLatestBlockhash(sendConfig.commitment))
        });
        transaction.add(...instruction);
        transaction.sign(...signers);

        return sendAndConfirmTransaction(this._connection, transaction, signers, sendConfig);
    }

    get connection(): Connection {
        return this._connection;
    }

    get program(): Program<T> {
        return this._program;
    }

    get cluster(): EndPoint {
        return this._cluster;
    }

    abstract createProgram(programId: anchor.web3.PublicKey, provider: Provider): anchor.Program<T>;
}