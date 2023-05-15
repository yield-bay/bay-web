import type { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { satoshiFont } from "@utils/localFont";
import clsx from "clsx";

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <div
      className={clsx(
        "flex flex-col min-h-screen font-inter bg-baseBlue text-white",
        satoshiFont.variable
      )}
    >
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
