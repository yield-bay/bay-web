import "../styles/globals.css";

import { lazy } from "react";
import type { AppProps } from "next/app";
import useAnalyticsSetup from "@hooks/useAnalyticsSetup";
const Providers = lazy(() => import("@components/Providers"));
const Layout = lazy(() => import("@components/Layout"));

export default function App({ Component, pageProps }: AppProps) {
  const { initialState } = pageProps;
  useAnalyticsSetup(process.env.NEXT_PUBLIC_FATHOM_CODE as string);

  return (
    <Providers initialState={initialState}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
