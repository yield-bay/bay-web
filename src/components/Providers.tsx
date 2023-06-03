import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAtom } from "jotai";
import NextNProgress from "nextjs-progressbar";
import { APP_NAME, WALLET_CONNECT_PROJECT_ID } from "@utils/constants";

// Chain interactions
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { TalismanConnector } from "@wagmi-connector/TalismanConnector";
import { SubWalletConnector } from "@wagmi-connector/SubwalletConnector";
import { WalletAccount, getWallets } from "@talismn/connect-wallets";
import { dotWalletAtom, dotWalletsAtom } from "@store/walletAtoms";
import { dotWalletAccountsAtom } from "@store/accountAtoms";

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

// Creating React-Query Client
const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  const [, setWallets] = useAtom(dotWalletsAtom);
  const [, setWalletAccounts] = useAtom(dotWalletAccountsAtom);
  const [wallet] = useAtom(dotWalletAtom);

  useEffect(() => {
    let unmounted = false;
    const walletsOrder = ["talisman", "polkadot-js", "subwallet-js"];
    let supportedWallets = getWallets()
      .filter((wallet) => walletsOrder.includes(wallet.extensionName))
      .sort((a, b) => {
        return (
          walletsOrder.indexOf(a.extensionName) -
          walletsOrder.indexOf(b.extensionName)
        );
      });

    // Nova Wallet for Mobile devices
    const polkadotJsWallet = supportedWallets.find(
      (wallet) => wallet.extensionName === "polkadot-js"
    );
    if (
      polkadotJsWallet != null &&
      (window as { walletExtension?: { isNovaWallet?: boolean } })
        .walletExtension?.isNovaWallet === true
    ) {
      console.log("found nova wallet!");
      polkadotJsWallet.title = "Nova Wallet";
      polkadotJsWallet.logo = { src: "/nova_logo.png", alt: "Nova Wallet" };
      supportedWallets = [polkadotJsWallet];
    } else {
      console.log("don't find nova wallet");
      console.log(
        "window",
        window as { walletExtension?: { isNovaWallet?: boolean } }
      );
    }

    console.log("supported wallets substrate", supportedWallets);
    if (!unmounted) {
      setWallets(supportedWallets);
    }
    return () => {
      unmounted = true;
    };
  }, []);

  useEffect(() => {
    if (wallet !== null) {
      (async () => {
        try {
          await wallet.enable(APP_NAME);
          await wallet.subscribeAccounts(
            (accounts: WalletAccount[] | undefined) => {
              // jotai:: setting accounts in selected wallet
              setWalletAccounts(accounts as WalletAccount[]);
            }
          );
        } catch (err) {
          console.log("Error in subscribing accounts: ", err);
        }
      })();
    }
  }, [wallet]);
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <NextNProgress color="#0073B7" />
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
};

export default Providers;
