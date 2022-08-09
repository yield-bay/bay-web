import { Container } from "@components/sharedstyles";

const Layout = ({ children }) => {
  return (
    <Container>
      <div className="flex flex-col flex-1">
        <div>{children}</div>
      </div>
    </Container>
  );
};

export default Layout;
