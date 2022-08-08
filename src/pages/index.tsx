import type { NextPage } from "next";
import { Container } from "../components/sharedstyles";
import Home from "@components/Home";

const Index: NextPage = () => {
  return (
    <Container>
      <Home />
    </Container>
  );
};

export default Index;
