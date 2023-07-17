import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAtom } from "jotai";
import NextNProgress from "nextjs-progressbar";
import { APP_NAME } from "@utils/constants";
import { ChakraProvider, extendBaseTheme } from "@chakra-ui/react";
import chakraTheme from "@chakra-ui/theme";

// Chain interactions
import { WagmiConfig } from "wagmi";
import { config } from "./wagmiSetup";
import { WalletAccount, getWallets } from "@talismn/connect-wallets";
import { dotWalletAtom, dotWalletsAtom } from "@store/walletAtoms";
import { dotWalletAccountsAtom } from "@store/accountAtoms";

// Creating React-Query Client
const queryClient = new QueryClient();

const { Tooltip } = chakraTheme.components;
const theme = extendBaseTheme({
  components: {
    Tooltip,
  },
});

const Providers = ({ children }: { children: ReactNode }) => {
  const [, setWallets] = useAtom(dotWalletsAtom);
  const [, setWalletAccounts] = useAtom(dotWalletAccountsAtom);
  const [wallet] = useAtom(dotWalletAtom);

  useEffect(() => {
    let unmounted = false;
    const walletsOrder = ["talisman", "polkadot-js", "subwallet-js"];
    let supportedWallets = getWallets().filter((wallet) =>
      walletsOrder.includes(wallet.extensionName)
    );

    // Nova Wallet for Mobile devices
    const polkadotJsWallet = supportedWallets.find(
      (wallet) => wallet.extensionName === "polkadot-js"
    );
    if (
      polkadotJsWallet != null &&
      (window as { walletExtension?: { isNovaWallet?: boolean } })
        .walletExtension?.isNovaWallet === true
    ) {
      polkadotJsWallet.title = "Nova Wallet";
      polkadotJsWallet.logo = { src: "/nova_logo.png", alt: "Nova Wallet" };
      supportedWallets = [polkadotJsWallet];
    }

    if (!unmounted) {
      setWallets(supportedWallets);
    }
    return () => {
      unmounted = true;
    };
  }, []);

  // SUBSTRATE: If no wallet, then it fetch and set substrate wallets
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
    <ChakraProvider theme={theme}>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <NextNProgress color="#0073B7" />
          {children}
        </QueryClientProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
};

export default Providers;
