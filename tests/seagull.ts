import * as anchor from "@project-serum/anchor";
import { BN, BorshCoder, BorshEventCoder, EventParser, Program } from "@project-serum/anchor";
import { Seagull } from "../target/types/seagull";
import {
    ConfirmOptions,
    Connection,
    Keypair, TransactionSignature
} from "@solana/web3.js";
import {
    createAssociatedTokenAccount,
    createMint,
    mintTo
} from "@solana/spl-token";
import { SeagullSocks } from "../sdk/src/provider";
import {
    findMarketAddress,
    findUserAddress,
    fp32CalcMinTickSizes,
    fp32FromNumber, getKey,
    tickAlignFloor
} from "../sdk/src/utils";
import { Market, MarketEvent, MarketSide, OrderPlaceEvent, OrderSettledEvent, User } from "../sdk/src/types";
import { assert, expect } from "chai";

async function waitForConfirm(connection: Connection, ...txs: string[]){
    for (const tx of txs){
        await connection.confirmTransaction(tx, "confirmed");
    }
}

describe("seagull", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const connection = anchor.getProvider().connection;
    const program = anchor.workspace.Seagull as Program<Seagull>;
    const sdk = new SeagullSocks(connection, program.programId, program);
    const eventParser = new EventParser(program.programId, new BorshCoder(program.idl));

    const setupUser = Keypair.generate();
    const userKeypair = Keypair.generate();
    const fillerKeypair = Keypair.generate();

    const mintAuthority = Keypair.generate();

    const baseMintKeypair = Keypair.generate();
    const baseMint = baseMintKeypair.publicKey;
    const quoteMintKeypair = Keypair.generate();
    const quoteMint = quoteMintKeypair.publicKey;

    const sendConfig: ConfirmOptions = {
        commitment: "confirmed",
        skipPreflight: true
    };

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

        await createAssociatedTokenAccount(connection, setupUser, quoteMint, userKeypair.publicKey);
        await createAssociatedTokenAccount(connection, setupUser, baseMint, fillerKeypair.publicKey);

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

    let orderPlacedSlot = 0;
    let placedOrderId: BN = null;

    it("Place Order", async () => {
        const slot = await connection.getSlot();
        orderPlacedSlot = slot + 10;

        const price = tickAlignFloor(fp32FromNumber(1), fp32CalcMinTickSizes(9));

        const sig = await sdk.sendTransaction([userKeypair], sendConfig,
            sdk.placeOrder,
            MarketSide.Sell,
            new BN(10 ** 9),
            price,
            new BN(orderPlacedSlot),
            market,
            user
        );

        const events = await parseEvents(eventParser, sig);
        placedOrderId = (events.next().value as MarketEvent<OrderPlaceEvent>).data.orderId;
    });

    it("Place Fill", async () => {
        const slot = await connection.getSlot();

        const price = tickAlignFloor(fp32FromNumber(1.2), fp32CalcMinTickSizes(9));

        const sig = await sdk.sendTransaction([fillerKeypair], sendConfig,
            sdk.fillOrder,
            MarketSide.Buy,
            new BN(10 ** 9),
            price,
            new BN(slot + 50),
            market,
            filler
        );

        const events = await parseEvents(eventParser, sig);
        assert((events.next().value as MarketEvent<any>).name == "OrderMatchedEvent");
    });

    it("Place Better Fill", async () => {
        const slot = await connection.getSlot();

        const price = tickAlignFloor(fp32FromNumber(2), fp32CalcMinTickSizes(9));

        const sig = await sdk.sendTransaction([fillerKeypair], sendConfig,
            sdk.fillOrder,
            MarketSide.Buy,
            new BN(10 ** 9),
            price,
            new BN(slot + 50),
            market,
            filler
        );

        const events = await parseEvents(eventParser, sig);

        assert((events.next().value as MarketEvent<any>).name == "OrderMatchedEvent", "The order was not matched!");
        assert((events.next().value as MarketEvent<any>).name == "OrderRematchFailEvent", "The second rematch did not fail!");
    });

    it("Place Same Fill Twice", async () => {
        const slot = await connection.getSlot();
        const price = tickAlignFloor(fp32FromNumber(2), fp32CalcMinTickSizes(9));

        await assertThrowsAsync(async () => {
            await sdk.sendTransaction([fillerKeypair], sendConfig,
                sdk.fillOrder,
                MarketSide.Buy,
                new BN(10 ** 9),
                price,
                new BN(slot + 50),
                market,
                filler
            )
        })
    });

    it("Place Worse Fill", async () => {
        const slot = await connection.getSlot();
        const price = tickAlignFloor(fp32FromNumber(1.5), fp32CalcMinTickSizes(9));

        await assertThrowsAsync(async () => {
            await sdk.sendTransaction([fillerKeypair], sendConfig,
                sdk.fillOrder,
                MarketSide.Buy,
                new BN(10 ** 9),
                price,
                new BN(slot + 50),
                market,
                filler
            )
        })
    });

    it("Settle Order", async () => {
        const sig = await sdk.sendTransaction([setupUser], sendConfig,
            sdk.settleOrder,
            placedOrderId,
            market,
            user,
            filler
        );

        const events = await parseEvents(eventParser, sig);
        assert((events.next().value as MarketEvent<OrderSettledEvent>).name == "OrderSettledEvent", "The order was not settled!");
    });

    it("Fails place order after existing ends", async () => {
        const slot = await connection.getSlot();
        const price = tickAlignFloor(fp32FromNumber(3), fp32CalcMinTickSizes(9));
        await assertThrowsAsync(async () => {
            await sdk.sendTransaction([fillerKeypair], sendConfig,
                sdk.fillOrder,
                MarketSide.Buy,
                new BN(10 ** 9),
                price,
                new BN(slot + 100),
                market,
                filler
            )
        })
    });
});

async function waitUntilSlot(connection: Connection, slot: number) {
    while (await connection.getSlot({commitment: "confirmed"}) < slot){
        await new Promise(r => setTimeout(r, 10));
    }
}

async function assertThrowsAsync(fn) {
    let f = () => {};
    try {
        await fn();
    } catch(e) {
        f = () => {throw e};
    } finally {
        assert.throws(f);
    }
}

async function parseEvents(eventParser: EventParser, sig: TransactionSignature){
    const tx = await anchor.getProvider().connection.getTransaction(sig, {
        commitment: "confirmed",
    });

    return eventParser.parseLogs(tx.meta.logMessages);
}