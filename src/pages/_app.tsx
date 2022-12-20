import "../styles/globals.css";
import { lazy, useEffect } from "react";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import axios from "axios";
import useAnalyticsSetup from "@hooks/useAnalyticsSetup";
const Providers = lazy(() => import("@components/Providers"));
const Layout = lazy(() => import("@components/Layout"));
import {
  FATHOM_CODE,
  // LEADERBOARD_API_DEV,
  LEADERBOARD_API_PROD,
} from "@utils/constants";

async function updateUser(hash: string | undefined | string[]) {
  const query = { hash };
  try {
    const data = await axios.post(
      LEADERBOARD_API_PROD as string,
      JSON.stringify(query)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (router.query.hash) {
      updateUser(router.query.hash);
    }
  }, [router]);

  const { initialState } = pageProps;
  useAnalyticsSetup(FATHOM_CODE as string);

  return (
    <Providers initialState={initialState}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
