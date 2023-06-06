// Chain interactions
import { createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { TalismanConnector } from "@utils/wagmi-connector/TalismanConnector";
import { SubWalletConnector } from "@utils/wagmi-connector/SubwalletConnector";

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
  }), // Options are alredy set in Connector
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

export { config };
