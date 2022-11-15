import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { Provider } from "jotai";
import useAnalyticsSetup from "@hooks/useAnalyticsSetup";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const { initialState } = pageProps;
  useAnalyticsSetup(process.env.NEXT_PUBLIC_FATHOM_CODE as string);

  return (
    <ThemeProvider attribute="class">
      <Provider initialValues={initialState}>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  );
}
