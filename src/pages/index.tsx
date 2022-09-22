import type { NextPage } from "next";
import Layout from "@components/Layout";
import Home from "@components/Home";
import MetaTags from "@metaTags/MetaTags";

const Index: NextPage = () => {
  return (
    <Layout>
      <MetaTags />
      <Home />
    </Layout>
  );
};

export default Index;
