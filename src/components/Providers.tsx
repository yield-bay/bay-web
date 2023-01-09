import type { ReactNode } from "react";
import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { TalismanConnector } from "@talismn/wagmi-connector";
import { SubWalletConnector } from "@wagmi-connector";
import NextNProgress from "nextjs-progressbar";

const connectors = [
  new MetaMaskConnector({
    options: { shimDisconnect: true },
  }),
  new WalletConnectConnector({
    options: {
      qrcode: true,
    },
  }),
  new TalismanConnector(),
  new SubWalletConnector(),
];

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
  connectors: connectors,
});

// Creating React-Query Client
const queryClient = new QueryClient();

const Providers = ({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: any;
}) => {
  return (
    <WagmiConfig client={client}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class">
          <JotaiProvider initialValues={initialState}>
            <NextNProgress color="#0073B7" />
            {children}
          </JotaiProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
};

export default Providers;
