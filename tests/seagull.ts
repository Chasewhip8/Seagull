import * as anchor from "@project-serum/anchor";
import { Instruction, Program } from "@project-serum/anchor";
import { Seagull } from "../target/types/seagull";
import { Keypair, Signer, Transaction, TransactionInstruction } from "@solana/web3.js";
import { createInitializeMint2Instruction, createMintToInstruction, TokenInstruction } from "@solana/spl-token";

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

describe("seagull", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Seagull as Program<Seagull>;

    const user = Keypair.generate();
    const filler = Keypair.generate();

    const setupUser = Keypair.generate();
    const mintAuthority = Keypair.generate();
    const baseMintSigner = Keypair.generate();
    const quoteMintSigner = Keypair.generate();

    before("Initialize Mints", async () => {
        await anchor.getProvider().connection.requestAirdrop(anchor.getProvider().publicKey, 100 * 10 ** 9);
        await anchor.getProvider().connection.requestAirdrop(user.publicKey, 100 * 10 ** 9);
        await anchor.getProvider().connection.requestAirdrop(filler.publicKey, 100 * 10 ** 9);

        await sendAndConfirmTransaction([mintAuthority],
            createInitializeMint2Instruction(
                baseMintSigner.publicKey,
                9,
                mintAuthority.publicKey,
                null
            ),
            createInitializeMint2Instruction(
                quoteMintSigner.publicKey,
                9,
                mintAuthority.publicKey,
                null
            ),
            createMintToInstruction(
                baseMintSigner.publicKey,
                user.publicKey,
                mintAuthority.publicKey,
                100 * 10 ** 9
            ),
            createMintToInstruction(
                quoteMintSigner.publicKey,
                filler.publicKey,
                mintAuthority.publicKey,
                100 * 10 ** 9
            ),
        )
    });

    it("Market Initialized!", async () => {

    });
});
