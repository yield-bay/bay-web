import type { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-inter bg-baseBlue text-white">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
