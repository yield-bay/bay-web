import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen font bg-baseBlue text-white bg-bg-pattern">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
