import type { NextPage } from "next";
import Layout from "@components/Layout";
import Home from "@components/Home";
import Header from "@components/Header";

const Index: NextPage = () => {
  return (
    <Layout>
      <Header />
      <Home />
    </Layout>
  );
};

export default Index;
