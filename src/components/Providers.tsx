import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";
import NextNProgress from "nextjs-progressbar";
import { WALLET_CONNECT_PROJECT_ID } from "@utils/constants";

// Chain interactions
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { TalismanConnector } from "@wagmi-connector/TalismanConnector";
import { SubWalletConnector } from "@wagmi-connector/SubwalletConnector";

const connectors = [
  new MetaMaskConnector({
    options: { shimDisconnect: true },
  }),
  // new WalletConnectConnector({
  //   options: {
  //     projectId: WALLET_CONNECT_PROJECT_ID,
  //   },
  // }),
  new TalismanConnector({
    options: {
      name: "Talisman",
      shimDisconnect: true,
    },
  }), //Options are alredy set in Connector
  new SubWalletConnector({
    options: {
      name: "SubWallet",
      shimDisconnect: true,
    },
  }),
];

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  connectors: connectors,
});

// Creating React-Query Client
const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class">
          <JotaiProvider>
            <NextNProgress color="#0073B7" />
            {children}
          </JotaiProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
};

export default Providers;
