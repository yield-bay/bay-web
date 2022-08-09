import type { NextPage } from "next";
import Layout from "./Layout";
import Home from "@components/Home";

const Index: NextPage = () => {
  return (
    <Layout>
      <Home />
    </Layout>
  );
};

export default Index;
