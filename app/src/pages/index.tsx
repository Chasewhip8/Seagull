import Container from "components/layout/Container";
import Navigation from "components/layout/Navigation";
import Card from "components/layout/Card";
import type { NextPage } from "next";

const Dashboard: NextPage = (props) => {
  return (
    <main className="bg-gray-50 h-screen">
      <Navigation />
      <Container>
        <Card
          className="mt-6"
          header={<h1 className="text-2xl font-bold">Swap</h1>}
        ></Card>
      </Container>
    </main>
  );
};

export default Dashboard;
