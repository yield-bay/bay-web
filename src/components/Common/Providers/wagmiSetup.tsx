// Chain interactions
import { createConfig, configureChains } from "wagmi";
import { moonriver, moonbeam } from "wagmi/chains";
import { astar } from "@utils/network";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { TalismanConnector } from "@utils/wagmi-connector/TalismanConnector";
import { SubWalletConnector } from "@utils/wagmi-connector/SubwalletConnector";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains(
  [moonriver, moonbeam, astar],
  [publicProvider()]
);

const connectors = [
  new MetaMaskConnector({
    options: { shimDisconnect: true },
    chains,
  }),
  new TalismanConnector({
    options: {
      name: "Talisman",
      shimDisconnect: true,
    },
    chains,
  }), // Options are alredy set in Connector
  new SubWalletConnector({
    options: {
      name: "SubWallet",
      shimDisconnect: true,
    },
    chains,
  }),
  // new WalletConnectConnector({
  //   options: {
  //     projectId: WALLET_CONNECT_PROJECT_ID,
  //   },
  // }),
];

const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: connectors,
});

export { config };
