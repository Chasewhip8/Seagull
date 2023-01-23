import Container from "components/layout/Container";
import Navigation from "components/layout/Navigation";
import Card from "components/layout/Card";
import type { NextPage } from "next";
import { useAppSelector } from "hooks/common";
import Selector from "components/Selector";
import Input from "components/Input";
import { AmountInput } from "../components/AmountInput";
import { classNames } from "../utils/styles";
import { MarketSide } from "@seagullfinance/seagull/dist/types";
import { selectClusterConfig } from "../stores/reducers/configReducer";

const Dashboard: NextPage = (props) => {
    const config = useAppSelector(selectClusterConfig);

    const side = MarketSide.Buy;

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
                                    "w-full inline-flex items-center rounded-l-md border border-green-600 px-4 py-2 text-sm font-medium text-green-600 shadow-sm hover:bg-green-300 focus:outline-none",
                                    side == MarketSide.Buy ? "bg-green-200" : "bg-transparent"
                                )}
                            >BUY</button>
                            <button
                                className={classNames(
                                    "w-full inline-flex items-center rounded-r border border-red-600 bg-transparent px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-300 focus:outline-none",
                                    side == MarketSide.Sell ? "bg-red-200" : "bg-transparent"
                                )}
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
                            />
                            <AmountInput
                                className="flex-1"
                                amount={1}
                                onChange={(newValue) => {}}
                                label="Amount"
                                name="amount"
                                id="amount"
                            />
                        </div>
                        <div className="flex flex-row space-x-2 w-full">
                            <AmountInput
                                className="flex-1"
                                amount={1}
                                onChange={(newValue) => {}}
                                label="Auction Length (min)"
                                name="auction length"
                                id="auction length"
                            />
                            <AmountInput
                                className="flex-1"
                                amount={1}
                                onChange={(newValue) => {}}
                                label="Price"
                                name="price"
                                id="price"
                            />
                        </div>
                        <div className="flex flex-row mt-3">
                            <button
                                className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >Execute Order</button>
                        </div>
                    </div>
                </Card>
            </Container>
        </main>
    );
};

export default Dashboard;
