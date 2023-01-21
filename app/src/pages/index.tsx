import Container from "components/layout/Container";
import Navigation from "components/layout/Navigation";
import Card from "components/layout/Card";
import type { NextPage } from "next";
import { useAppSelector } from "hooks/common";
import Selector from "components/Selector";

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
          <div className="flex flex-row justify-between space-x-4">
            <Selector
              className="flex-1"
              label="From Token"
              items={tokens.map((token) => ({
                id: token.mint,
                name: token.name,
                image: token.tokenIcon,
              }))}
            />
            <Selector
              className="flex-1"
              label="To Token"
              items={tokens.map((token) => ({
                id: token.mint,
                name: token.name,
                image: token.tokenIcon,
              }))}
            />
          </div>
        </Card>
      </Container>
    </main>
  );
};

export default Dashboard;
