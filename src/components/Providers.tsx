import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Provider } from "jotai";

const Providers = ({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: any;
}) => {
  return (
    <ThemeProvider attribute="class">
      <Provider initialValues={initialState}>{children}</Provider>
    </ThemeProvider>
  );
};

export default Providers;
