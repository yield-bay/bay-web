import "../styles/globals.css";
import { lazy } from "react";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import useAnalyticsSetup from "@hooks/useAnalyticsSetup";
const Providers = lazy(() => import("@components/Common/Providers"));
const Layout = lazy(() => import("@components/Common/Layout"));
import { FATHOM_CODE } from "@utils/constants";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useAnalyticsSetup(FATHOM_CODE);
  return (
    <Providers>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
