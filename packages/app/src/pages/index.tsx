import Container from "components/layout/Container";
import Navigation from "components/layout/Navigation";
import Card from "components/layout/Card";
import type { NextPage } from "next";
import { useAppDispatch, useAppSelector, useTokenInfo } from "hooks/common";
import Selector from "components/Selector";
import { AmountInput } from "../components/AmountInput";
import { classNames } from "../utils/styles";
import { MarketSide } from "@seagullfinance/seagull/dist/types";
import { selectClusterConfig } from "../stores/reducers/configReducer";
import {
    resetInterfaceState,
    selectAmount, selectAuctionLength,
    selectMarket,
    selectPrice,
    selectSide, setAmount, setAuctionLength,
    setMarket, setPrice,
    setSide
} from "../stores/reducers/interfaceReducer";
import { usePlaceOrderTransaction } from "../utils/transaction/placeOrderTransaction";
import { addTransaction } from "../stores/reducers/userDataReducer";

const Dashboard: NextPage = (props) => {
    const dispatch = useAppDispatch();
    const config = useAppSelector(selectClusterConfig);

    const side = useAppSelector(selectSide);
    const market = useAppSelector(selectMarket);

    const baseInfo = useTokenInfo(market?.baseMint.toBase58());
    const quoteInfo = useTokenInfo(market?.quoteMint.toBase58());

    const amount = useAppSelector(selectAmount);
    const price = useAppSelector(selectPrice);
    const auctionLength = useAppSelector(selectAuctionLength);

    const placeOrder = usePlaceOrderTransaction();

    return (
        <main className="bg-gray-50 h-screen">
            <Navigation />
            <Container>
                <Card
                    className="mt-6"
                    header={<h1 className="text-2xl font-bold">JIT Swap</h1>}
                >
                    <div className="flex flex-col gap-y-2">
                        <div className={"flex flex-row w-full"}>
                            <button
                                className={classNames(
                                    "w-full inline-flex justify-center items-center rounded-l-md border border-green-600 px-4 py-2 text-sm font-medium text-green-600 shadow-sm hover:bg-green-300 focus:outline-none",
                                    side == MarketSide.Buy ? "bg-green-200" : "bg-transparent"
                                )}
                                onClick={() => dispatch(setSide(MarketSide.Buy))}
                            >BUY</button>
                            <button
                                className={classNames(
                                    "w-full inline-flex justify-center items-center rounded-r border border-red-600 bg-transparent px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-300 focus:outline-none",
                                    side == MarketSide.Sell ? "bg-red-200" : "bg-transparent"
                                )}
                                onClick={() => dispatch(setSide(MarketSide.Sell))}
                            >SELL</button>
                        </div>
                        <div className="flex flex-row space-x-2 w-full">
                            <Selector
                                className="flex-1"
                                label="Market"
                                items={config.markets.map((market) => ({
                                    id: market.address,
                                    name: market.name,
                                    image: market.image,
                                    details: market.description,
                                    data: market
                                }))}
                                onChange={(item) => dispatch(setMarket(item.address))}
                            />
                            <AmountInput
                                className="flex-1"
                                amount={amount}
                                onChange={(newValue) => dispatch(setAmount(newValue))}
                                label={`${baseInfo.symbol} Amount`}
                                name="amount"
                                id="amount"
                            />
                        </div>
                        <div className="flex flex-row space-x-2 w-full">
                            <AmountInput
                                className="flex-1"
                                amount={auctionLength}
                                onChange={(newValue) => dispatch(setAuctionLength(newValue))}
                                label="Auction Length (min)"
                                name="auction length"
                                id="auction length"
                            />
                            <AmountInput
                                className="flex-1"
                                amount={price}
                                onChange={(newValue) => dispatch(setPrice(newValue))}
                                label={`${quoteInfo.symbol} Price`}
                                name="price"
                                id="price"
                            />
                        </div>
                        <div className="flex flex-row mt-3">
                            <button
                                className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={() => {
                                    placeOrder().then((tx) => dispatch(addTransaction({
                                        transaction: tx,
                                        onComplete: (dispatch) => {
                                            //dispatch(resetInterfaceState());
                                        }
                                    })));
                                }}
                            >{side == MarketSide.Buy ? "Start Buy Auction" : "Start Sell Auction"}</button>
                        </div>
                    </div>
                </Card>
            </Container>
        </main>
    );
};

export default Dashboard;
