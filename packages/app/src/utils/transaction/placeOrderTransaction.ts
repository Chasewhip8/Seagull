import { Transaction } from "../../stores/reducers/userDataReducer";
import { PendingTransaction } from "./PendingTransaction";
import { TransactionInstruction } from "@solana/web3.js";
import {
    findUserAddress,
    findUserID,
    fp32CalcMinTickSizes,
    fp32FromNumber,
    tickAlignFloor
} from "@seagullfinance/seagull/dist/utils";
import { convertMinutesToSlots } from "../amounts";
import { useAppSelector, useTokenInfo } from "../../hooks/common";
import { selectConnection, selectSDK, selectWallet } from "../../stores/reducers/configReducer";
import {
    selectAmount,
    selectAuctionLength,
    selectMarket,
    selectPrice,
    selectSide,
} from "../../stores/reducers/interfaceReducer";
import BN from "bn.js";
import { MarketSide } from "@seagullfinance/seagull/dist/types";

export function usePlaceOrderTransaction(): () => Promise<Transaction> {
    const wallet = useAppSelector(selectWallet);
    const sdk = useAppSelector(selectSDK);
    const market = useAppSelector(selectMarket);
    const quoteDecimals = useTokenInfo(market?.quoteMint.toBase58()).decimals;
    const side = useAppSelector(selectSide);
    const amount = useAppSelector(selectAmount);
    const price = useAppSelector(selectPrice);
    const auctionLengthMin = useAppSelector(selectAuctionLength);
    const connection = useAppSelector(selectConnection);

    const mint = side == MarketSide.Buy ? market?.quoteMint : market?.baseMint;

    return (async () => {
        return new PendingTransaction(
            `Place order`,
            (state) => {
                // @ts-ignore
                const currentBase = state[mint];

                currentBase.balance = currentBase.balance - amount;
            },
            async () => {
                const userId = findUserID(wallet.publicKey);
                let instruction: TransactionInstruction[] = [];

                let user = null;
                try {
                    user = await sdk.fetchUser(findUserAddress(market.publicKey, userId));
                } catch (e){
                    console.log("User did not exist! Creating it in transaction!");
                }

                if (!user){
                    instruction.push(await sdk.initUser(
                        wallet.publicKey,
                        market,
                        userId
                    ));
                }

                const slot = await connection.getSlot("confirmed");
                console.log(convertMinutesToSlots(auctionLengthMin) + slot);

                instruction.push(await sdk.placeOrder(
                    side,
                    new BN(Math.floor(amount * 10 ** 9)), // TODO use real decimals
                    new BN(tickAlignFloor(fp32FromNumber(price), fp32CalcMinTickSizes(quoteDecimals))),
                    new BN(convertMinutesToSlots(auctionLengthMin) + slot),
                    market,
                    user ?? {
                        authority: wallet.publicKey,
                        publicKey: findUserAddress(market.publicKey, userId),
                        userId: userId,
                        openQuote: new BN(0),
                        openBase: new BN(0)
                    }
                ))

                return instruction;
            }
        )
    });
}