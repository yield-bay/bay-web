import "../styles/globals.css";
import { lazy, useEffect } from "react";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";
import axios from "axios";
import useAnalyticsSetup from "@hooks/useAnalyticsSetup";
const Providers = lazy(() => import("@components/Providers"));
const Layout = lazy(() => import("@components/Layout"));

async function updateUser(hash: string | undefined | string[]) {
  const query = { hash };
  try {
    const data = await axios.post(
      "https://leaderboard-api-dev.onrender.com/update",
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
      console.log("hash", router.query.hash);
      updateUser(router.query.hash);
    } else {
      console.log("No hash");
    }
  }, [router]);

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
