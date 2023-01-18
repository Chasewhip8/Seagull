import * as anchor from "@project-serum/anchor";
import { Instruction, Program } from "@project-serum/anchor";
import { Seagull } from "../target/types/seagull";
import { Connection, Keypair, Signer, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
    createAssociatedTokenAccount,
    createInitializeMint2Instruction,
    createMint,
    createMintToInstruction, mintTo, TOKEN_PROGRAM_ID,
    TokenInstruction
} from "@solana/spl-token";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";

async function sendAndConfirmTransaction(signers: Signer[], ...instructions: TransactionInstruction[]){
    const blockHash = await anchor.getProvider().connection.getLatestBlockhash();
    const tx = new Transaction({
        blockhash: blockHash.blockhash,
        lastValidBlockHeight: blockHash.lastValidBlockHeight,
    }).add(...instructions);
    return anchor.getProvider().sendAndConfirm(
        tx,
        signers,
        {
            commitment: "finalized",
            skipPreflight: true
        }
    )
}

async function waitForConfirm(connection: Connection, ...txs: string[]){
    for (const tx of txs){
        await connection.confirmTransaction(tx, "finalized");
    }
}

describe("seagull", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const connection = anchor.getProvider().connection;
    const program = anchor.workspace.Seagull as Program<Seagull>;

    const user = Keypair.generate();
    const filler = Keypair.generate();

    const setupUser = Keypair.generate();
    const mintAuthority = Keypair.generate();
    let baseMint = null;
    let quoteMint = null;

    before("Initialize Mints", async () => {
        const tx1 = await connection.requestAirdrop(setupUser.publicKey, 100 * 10 ** 9);
        const tx2 = await connection.requestAirdrop(user.publicKey, 100 * 10 ** 9);
        const tx3 = await connection.requestAirdrop(filler.publicKey, 100 * 10 ** 9);

        await waitForConfirm(connection, tx1, tx2, tx3);

        baseMint = await createMint(
            connection,
            setupUser,
            mintAuthority.publicKey,
            null, 9
        );

        quoteMint = await createMint(
            connection,
            setupUser,
            mintAuthority.publicKey,
            null, 9
        );

        const userBaseTokenAccount = await createAssociatedTokenAccount(connection, setupUser, baseMint, user.publicKey);
        const fillerQuoteTokenAccount = await createAssociatedTokenAccount(connection, setupUser, quoteMint, user.publicKey);

        const tx4 = await mintTo(connection, setupUser, baseMint, userBaseTokenAccount, mintAuthority, 100 * 10**9);
        const tx5 = await mintTo(connection, setupUser, quoteMint, fillerQuoteTokenAccount, mintAuthority, 100 * 10**9);

        await waitForConfirm(connection, tx4, tx5);
    });

    it("Market Initialized!", async () => {
        const quoteHoldingAccount = Keypair.generate();
        const baseHoldingAccount = Keypair.generate();

        const [market, bump] = findProgramAddressSync(
            [
                quoteMint.toBuffer(),
                baseMint.toBuffer()
            ],
            program.programId
        );

        const tx = await program.methods.initMarket()
            .accounts({
                payer: setupUser.publicKey,
                quoteMint: quoteMint,
                quoteHoldingAccount: quoteHoldingAccount.publicKey,
                baseMint: baseMint,
                market: market,
                baseHoldingAccount: baseHoldingAccount.publicKey,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([quoteHoldingAccount, baseHoldingAccount, setupUser])
            .rpc();

        let marketData = await program.account.market.fetch(market);
        console.log(marketData.orderQueue.toBuffer());
    });
});
