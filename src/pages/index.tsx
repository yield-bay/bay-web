import type { NextPage } from "next";
import Home from "@components/Home";
import MetaTags from "@metaTags/MetaTags";

const Index: NextPage = () => {
  return (
    <>
      <MetaTags />
      <Home />
    </>
  );
};

export default Index;
