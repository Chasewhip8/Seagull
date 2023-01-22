import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { Seagull } from "../target/types/seagull";
import {
    ConfirmOptions,
    Connection,
    Keypair
} from "@solana/web3.js";
import {
    createAssociatedTokenAccount,
    createMint,
    mintTo
} from "@solana/spl-token";
import { SeagullSocks } from "../sdk/src/provider";
import { findMarketAddress, findUserAddress } from "../sdk/src/utils";
import { Market, User } from "../sdk/src/types";

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
    const sdk = new SeagullSocks(connection, program.programId, program);

    const setupUser = Keypair.generate();
    const userKeypair = Keypair.generate();
    const fillerKeypair = Keypair.generate();

    const mintAuthority = Keypair.generate();

    const baseMintKeypair = Keypair.generate();
    const baseMint = baseMintKeypair.publicKey;
    const quoteMintKeypair = Keypair.generate();
    const quoteMint = quoteMintKeypair.publicKey;

    const sendConfig: ConfirmOptions = { commitment: "confirmed" };

    before("Initialize Mints", async () => {
        const tx1 = await connection.requestAirdrop(setupUser.publicKey, 100 * 10 ** 9);
        const tx2 = await connection.requestAirdrop(userKeypair.publicKey, 100 * 10 ** 9);
        const tx3 = await connection.requestAirdrop(fillerKeypair.publicKey, 100 * 10 ** 9);

        await waitForConfirm(connection, tx1, tx2, tx3);

        await createMint(
            connection,
            setupUser,
            mintAuthority.publicKey,
            null, 9,
            baseMintKeypair
        );

        await createMint(
            connection,
            setupUser,
            mintAuthority.publicKey,
            null, 9,
            quoteMintKeypair
        );

        const userBaseTokenAccount = await createAssociatedTokenAccount(connection, setupUser, baseMint, userKeypair.publicKey);
        const fillerQuoteTokenAccount = await createAssociatedTokenAccount(connection, setupUser, quoteMint, fillerKeypair.publicKey);

        const tx4 = await mintTo(connection, setupUser, baseMint, userBaseTokenAccount, mintAuthority, 100 * 10**9);
        const tx5 = await mintTo(connection, setupUser, quoteMint, fillerQuoteTokenAccount, mintAuthority, 100 * 10**9);

        await waitForConfirm(connection, tx4, tx5);
    });

    const marketAddress = findMarketAddress(baseMint, quoteMint);
    let market: Market = null;

    it("Market Initialized!", async () => {
        const quoteHoldingAccount = Keypair.generate();
        const baseHoldingAccount = Keypair.generate();

        await sdk.sendTransaction([setupUser, quoteHoldingAccount, baseHoldingAccount], sendConfig,
            sdk.initMarket,
            setupUser.publicKey,
            quoteMint,
            baseMint,
            quoteHoldingAccount.publicKey,
            baseHoldingAccount.publicKey
        )

        market = await sdk.fetchMarket(marketAddress);
    });

    let user: User = null;
    let filler: User = null;

    it("Initialize User Accounts!", async () => {
        await sdk.sendTransaction([userKeypair], sendConfig,
            sdk.initUser,
            userKeypair.publicKey,
            market,
            new BN(1)
        );

        await sdk.sendTransaction([fillerKeypair], sendConfig,
            sdk.initUser,
            fillerKeypair.publicKey,
            market,
            new BN(2)
        );

        user = await sdk.fetchUser(findUserAddress(marketAddress, new BN(1)));
        filler = await sdk.fetchUser(findUserAddress(marketAddress, new BN(2)));
    });

    it("Fetch Market Account", async () => {

    });

    it("Place Order", async () => {

    });
});
