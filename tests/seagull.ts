import * as anchor from "@project-serum/anchor";
import { Instruction, Program } from "@project-serum/anchor";
import { Seagull } from "../target/types/seagull";
import {
    Connection,
    Keypair,
    PublicKey,
    Signer,
    SystemProgram,
    Transaction,
    TransactionInstruction
} from "@solana/web3.js";
import {
    createAssociatedTokenAccount,
    createInitializeMint2Instruction,
    createMint,
    createMintToInstruction, mintTo, TOKEN_PROGRAM_ID,
    TokenInstruction
} from "@solana/spl-token";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import BN from "bn.js";

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

    const user_keypair = Keypair.generate();
    const filler_keypair = Keypair.generate();

    const setupUser = Keypair.generate();
    const mintAuthority = Keypair.generate();
    let baseMint = null;
    let quoteMint = null;

    let userBaseTokenAccount = null;
    let fillerQuoteTokenAccount = null;

    before("Initialize Mints", async () => {
        const tx1 = await connection.requestAirdrop(setupUser.publicKey, 100 * 10 ** 9);
        const tx2 = await connection.requestAirdrop(user_keypair.publicKey, 100 * 10 ** 9);
        const tx3 = await connection.requestAirdrop(filler_keypair.publicKey, 100 * 10 ** 9);

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

        userBaseTokenAccount = await createAssociatedTokenAccount(connection, setupUser, baseMint, user_keypair.publicKey);
        fillerQuoteTokenAccount = await createAssociatedTokenAccount(connection, setupUser, quoteMint, filler_keypair.publicKey);

        const tx4 = await mintTo(connection, setupUser, baseMint, userBaseTokenAccount, mintAuthority, 100 * 10**9);
        const tx5 = await mintTo(connection, setupUser, quoteMint, fillerQuoteTokenAccount, mintAuthority, 100 * 10**9);

        await waitForConfirm(connection, tx4, tx5);
    });

    let market: PublicKey = null;

    it("Market Initialized!", async () => {
        const quoteHoldingAccount = Keypair.generate();
        const baseHoldingAccount = Keypair.generate();

        market = findProgramAddressSync(
            [
                Buffer.from("Market"),
                quoteMint.toBuffer(),
                baseMint.toBuffer()
            ],
            program.programId
        )[0];

        await program.methods.initMarket()
            .accounts({
                payer: setupUser.publicKey,
                quoteMint: quoteMint,
                baseMint: baseMint,
                quoteHoldingAccount: quoteHoldingAccount.publicKey,
                baseHoldingAccount: baseHoldingAccount.publicKey,
                market: market,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([quoteHoldingAccount, baseHoldingAccount, setupUser])
            .rpc();
    });

    let user = null;
    let filler = null;

    it("Initialize User Accounts!", async () => {
        user = findProgramAddressSync(
            [
                Buffer.from("User"),
                quoteMint.toBuffer(),
                baseMint.toBuffer()
            ],
            program.programId
        );

        await program.methods
            .initUser(new anchor.BN(1))
            .accounts({
                authority: user_keypair.publicKey,
                market: market,
                systemProgram: SystemProgram.programId,
            })
            .signers([user_keypair])
            .rpc();

        filler = findProgramAddressSync(
            [
                Buffer.from("User"),
                quoteMint.toBuffer(),
                baseMint.toBuffer()
            ],
            program.programId
        );

        await program.methods
            .initUser(new anchor.BN(2))
            .accounts({
                authority: filler_keypair.publicKey,
                market: market,
                systemProgram: SystemProgram.programId,
            })
            .signers([filler_keypair])
            .rpc();
    });

    let market_account = null;
    it("Fetch Market Account", async () => {
        market_account = await program.account.market.fetch(market);
    });

    it("Place Order", async () => {
        await program.methods
            .placeOrder()
            .accounts({
                authority: filler_keypair.publicKey,
                user: user_keypair.publicKey,
                userSideAccount: userBaseTokenAccount.publicKey,
                sideMint: baseMint.publicKey,
                market: market,
                orderQueue: market_account.order_queue.publicKey,

            })
            .signers([filler_keypair])
            .rpc();
    });
});
