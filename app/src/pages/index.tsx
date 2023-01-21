import Container from "components/layout/Container";
import Navigation from "components/layout/Navigation";
import Card from "components/layout/Card";
import type { NextPage } from "next";
import { useAppSelector } from "hooks/common";
import Selector from "components/Selector";
import Input from "components/Input";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

const Dashboard: NextPage = (props) => {
  const tokens = useAppSelector((state) => state.config.cluster.tokens);

  return (
    <main className="bg-gray-50 h-screen">
      <Navigation />
      <Container>
        <Card
          className="mt-6"
          header={<h1 className="text-2xl font-bold">Token Swap</h1>}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-row space-x-2 w-full">
              <Selector
                className="flex-1"
                label="From Token"
                items={tokens.map((token) => ({
                  id: token.mint,
                  name: token.name,
                  image: token.tokenIcon,
                  details: token.extraInfo,
                }))}
              />
              <Input
                className="flex-1"
                value="1.33 Units of JFI"
                label="Amount"
                name="amount"
                id="amount"
                type="text"
              />
            </div>
            <ArrowsUpDownIcon className="h-12 w-12 text-gray-400" />
            <div className="flex flex-row space-x-2 w-full">
              <Selector
                className="flex-1"
                label="To Token"
                items={tokens.map((token) => ({
                  id: token.mint,
                  name: token.name,
                  image: token.tokenIcon,
                  details: token.extraInfo,
                }))}
              />
              <Input
                className="flex-1"
                label="Amount"
                name="amount"
                value="1.33 Units of JFI"
                id="amount"
                type="text"
              />
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
};

export default Dashboard;
