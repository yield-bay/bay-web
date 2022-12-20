import type { ReactNode } from "react";
import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";
import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";
// import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { TalismanConnector } from "@talismn/wagmi-connector";
import { SubWalletConnector } from "@wagmi-connector";

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

const Providers = ({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: any;
}) => {
  return (
    <WagmiConfig client={client}>
      <ThemeProvider attribute="class">
        <JotaiProvider initialValues={initialState}>{children}</JotaiProvider>
      </ThemeProvider>
    </WagmiConfig>
  );
};

export default Providers;
