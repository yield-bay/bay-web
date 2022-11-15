import type { NextPage } from "next";
import Layout from "@components/Layout";
import FarmPage from "@components/FarmPage/index";

const Farm: NextPage = () => {
  return (
    <Layout>
      <FarmPage />
    </Layout>
  );
};

export default Farm;
