import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SeagullSocks } from "@seagullfinance/seagull/dist/provider";
import { SEAGULL_PROGRAM_ID } from "@seagullfinance/seagull/dist/constants";
import { config } from "./config";
import { BN, BorshCoder, EventParser } from "@project-serum/anchor";
import { IDL } from "@seagullfinance/seagull/dist/seagull_spot_v1";
import {
    MarketEvent,
    OrderMatchedEvent,
    OrderPlaceEvent,
    OrderSettledEvent
} from "@seagullfinance/seagull/dist/types";
import {
    findMarketAddress,
    findUserAddress,
    findUserID,
    getSideFromKey,
    getUserIdFromKey
} from "@seagullfinance/seagull/dist/utils";
import * as anchor from "@project-serum/anchor";

const connection = new Connection(clusterApiUrl("devnet"), { commitment: "confirmed" });
const sdk = new SeagullSocks(connection, SEAGULL_PROGRAM_ID);
const eventParser = new EventParser(SEAGULL_PROGRAM_ID, new BorshCoder(IDL));

async function setupMarkets(){
    config.markets.map(async (market) => {
        try {
            const quoteHolding = Keypair.generate();
            const baseHolding = Keypair.generate();

            await sdk.sendTransaction(
                [config.filler, quoteHolding, baseHolding],
                { commitment: "finalized" },
                sdk.initMarket,
                config.filler.publicKey,
                market.quoteMint,
                market.baseMint,
                quoteHolding.publicKey,
                baseHolding.publicKey
            )
        } catch (e){
            console.log("Market likely already exists!")
        }

        market.market = await sdk.fetchMarket(findMarketAddress(market.baseMint, market.quoteMint));

        const userId = await findUserID(config.filler.publicKey);
        try {
            await sdk.sendTransaction(
                [config.filler],
                { commitment: "finalized" },
                sdk.initUser,
                config.filler.publicKey,
                market.market,
                userId
            )
        } catch (e){
            console.log("User likely already exists!")
        }

        market.filler = await sdk.fetchUser(findUserAddress(market.market.publicKey, userId));
    });
}

async function fillOrder(marketAddress: PublicKey, orderId: BN, slot: number, aEnd: BN) {
    const market = config.markets.find((info) => info.market?.publicKey == marketAddress);

    if (!market || !market.market){
        console.log("Unknown market address: " + marketAddress.toBase58());
        return;
    }

    const sig = await sdk.sendTransaction(
        [config.filler],
        { commitment: "finalized" },
        sdk.fillOrder,
        getSideFromKey(orderId),
        config.fillSize,
        config.fillPrice,
        new BN(slot + 1000),
        market.market,
        market.filler
    )

    const log = await anchor.getProvider().connection.getTransaction(sig, { commitment: "confirmed" });
    const logs = log?.meta?.logMessages;

    if (logs){
        const events = eventParser.parseLogs(logs);
        for (const eventObj of events){
            if (eventObj.name == "OrderMatchedEvent"){
                const event = eventObj as MarketEvent<OrderMatchedEvent>;
                if (event.data.orderId != orderId || event.data.market != marketAddress){
                    continue;
                }

                console.log("Waiting until slot: " + aEnd.toNumber() + " for orderId: " + orderId);
                await waitUntilSlot(connection, aEnd.toNumber());
                console.log("Finished waiting until slot! orderId: " + orderId);

                const sig = await sdk.sendTransaction(
                    [config.filler],
                    { commitment: "finalized" },
                    sdk.settleOrder,
                    orderId,
                    market.market,
                    market.filler,
                    await sdk.fetchUser(findUserAddress(market.market?.publicKey, getUserIdFromKey(orderId)))
                )

                const log = await anchor.getProvider().connection.getTransaction(sig, { commitment: "confirmed" });
                const logs = log?.meta?.logMessages;
                if (logs) {
                    const events = eventParser.parseLogs(logs);
                    for (const eventObj of events) {
                        if (eventObj.name == "OrderSettledEvent") {
                            const event = eventObj as MarketEvent<OrderSettledEvent>;
                            if (event.data.orderId == orderId && event.data.market == market.market.publicKey){
                                console.log("Settled Order: " + orderId + " on market " + event.data.market.toBase58());
                            }
                        }
                    }
                } else {
                    console.log("No transaction logs returned, most likely order settle failed!");
                }
            }
        }
    } else {
        console.log("No transaction logs returned, most likely failed fill!");
    }
}

async function waitUntilSlot(connection: Connection, slot: number) {
    while (await connection.getSlot({commitment: "confirmed"}) < slot){
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function maker() {
    await setupMarkets();

    connection.onLogs(
        SEAGULL_PROGRAM_ID,
        (logs, ctx) => {
            if (logs.err){
                return;
            }

            const events = eventParser.parseLogs(logs.logs);
            for (const eventObj of events){
                console.log("Event: " + eventObj.name);
                if (eventObj.name == "OrderPlaceEvent"){
                    const newOrder = eventObj as MarketEvent<OrderPlaceEvent>;
                    if (newOrder.data.size.lte(config.fillSize)) {
                        fillOrder(newOrder.data.market, newOrder.data.orderId, ctx.slot, newOrder.data.aEnd);
                    } else {
                        console.log("Found order " + newOrder.data.orderId + ", but the size was greater than the max config value.");
                    }
                }
            }
        },
        "confirmed"
    );
}

maker().then(() => console.log("Done."))