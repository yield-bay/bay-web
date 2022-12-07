import "../styles/globals.css";
import { useRouter } from "next/router";

import { lazy } from "react";
import type { AppProps } from "next/app";
import useAnalyticsSetup from "@hooks/useAnalyticsSetup";
const Providers = lazy(() => import("@components/Providers"));
const Layout = lazy(() => import("@components/Layout"));

async function updateUser(hash: string | undefined | string[]) {
  const query = { hash };
  let data = await (
    await fetch("https://leaderboard-api-dev.onrender.com/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
  ).json();
  console.log(data);
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  if (router.query.hash) {
    console.log(router.query.hash);
    updateUser(router.query.hash);
  } else {
    console.log("No hash");
  }
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
