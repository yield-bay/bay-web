import { FC, ReactNode, useEffect } from "react";
import clsx from "clsx";
import Footer from "@components/Common/Footer";
import Header from "@components/Common/Header";
import { satoshiFont } from "@utils/localFont";
import { useAtom } from "jotai";
import _ from "lodash";
import {
  farmsAtom,
  lpTokenPricesAtom,
  positionsAtom,
  tokenPricesAtom,
} from "@store/atoms";
import { useQuery } from "@tanstack/react-query";
import { FarmType, TokenPriceType } from "@utils/types/common";
import {
  fetchListicleFarms,
  fetchLpTokenPrices,
  fetchTokenPrices,
} from "@utils/api";
import { useAccount } from "wagmi";
import { dotAccountAtom, isConnectedDotAtom } from "@store/accountAtoms";
import {
  accountInitAtom,
  addLiqModalOpenAtom,
  claimModalOpenAtom,
  evmPosLoadingAtom,
  isInitialisedAtom,
  mangataAddressAtom,
  mangataHelperAtom,
  mangataPoolsAtom,
  removeLiqModalOpenAtom,
  stakingModalOpenAtom,
  subPosLoadingAtom,
  unstakingModalOpenAtom,
  lpUpdatedAtom,
} from "@store/commonAtoms";
import AddLiquidityModal from "@components/Library/AddLiquidityModal";
import RemoveLiquidityModal from "@components/Library/RemoveLiquidityModal";
import StakingModal from "@components/Library/StakingModal";
import UnstakingModal from "@components/Library/UnstakingModal";
import { useConnection } from "@hooks/useConnection";
import { useRouter } from "next/router";
import ClaimRewardsModal from "@components/Library/ClaimRewardsModal";
import SlippageModal from "@components/Library/SlippageModal";
import { Mangata as MangataConfig } from "@utils/xcm/config";
import MangataHelper from "@utils/xcm/common/mangataHelper";
import Account from "@utils/xcm/common/account";
import { handleWalletConnectEvent } from "@utils/tracking";
import {
  emptyEvmPositions,
  fetchEvmPositions,
} from "@utils/position-utils/evmPositions";
import {
  emptySubstratePositions,
  fetchSubstratePositions,
} from "@utils/position-utils/substratePositions";

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const isOnline = useConnection();
  const router = useRouter();

  // Modal States
  // const [addliqModalOpen] = useAtom(addLiqModalOpenAtom);
  const [removeLiqModalOpen] = useAtom(removeLiqModalOpenAtom);
  const [stakingModalOpen] = useAtom(stakingModalOpenAtom);
  const [unstakingModalOpen] = useAtom(unstakingModalOpenAtom);
  const [claimModalOpen] = useAtom(claimModalOpenAtom);

  const [lpUpdated] = useAtom(lpUpdatedAtom);

  // Mangata Setup
  const [mangataHelperx, setMangataHelper] = useAtom(mangataHelperAtom);
  const [, setMangataAddress] = useAtom(mangataAddressAtom);
  const [, setPools] = useAtom(mangataPoolsAtom);
  const [accountInit, setAccountInit] = useAtom(accountInitAtom);
  const [, setIsInitialised] = useAtom(isInitialisedAtom);

  useEffect(() => {
    // check internet connection and redirect to 500 page if not connected
    if (!isOnline) {
      router.push("/500");
    }
  }, [isOnline]);

  // States
  const [, setAllFarms] = useAtom(farmsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap, setTokenPricesMap] = useAtom(tokenPricesAtom);

  useEffect(() => {
    console.log("---- Updated Positions ----\n", positions);
  }, [positions]);

  const { isConnected, address, connector } = useAccount();
  const [isConnectedDot] = useAtom(isConnectedDotAtom);

  const [account] = useAtom(dotAccountAtom);

  const [, setIsEvmPosLoading] = useAtom(evmPosLoadingAtom);
  const [, setIsSubPosLoading] = useAtom(subPosLoadingAtom);

  // Accounts for testing
  // const address = "0xf3616d8cc52c67e7f0991a0a3c6db9f5025fa60c"; // Nightwing's Address
  // const [dotAccount] = useAtom(dotAccountAtom);
  // const account = {
  //   ...dotAccount,
  //   address: "5D2d7gtBrGXw8BmcwenaiDWWEnvwVRm5MUx7FMcR8C88QgGw",
  // };

  // Fetching all farms
  const { isLoading, data: farmsList } = useQuery({
    queryKey: ["farmsList"],
    queryFn: async () => {
      try {
        const { farms } = await fetchListicleFarms();
        setAllFarms(farms);
        return farms;
      } catch (error) {
        console.error(error);
      }
    },
  });
  const farms: FarmType[] = isLoading ? new Array<FarmType>() : farmsList!;

  // Fetching Lp token prices
  const { isLoading: isLpPricesLoading, data: lpTokenPrices } = useQuery({
    queryKey: ["lpTokenPrices"],
    queryFn: async () => {
      try {
        const { lpTokenPrices } = await fetchLpTokenPrices();
        return lpTokenPrices;
      } catch (error) {
        console.error("Error while fetching Lp Token prices", error);
      }
    },
  });
  useEffect(() => {
    if (isLpPricesLoading) {
      console.log("loading lp prices...");
    } else {
      const tempLpTokenPrices: { [key: string]: number } = {};
      lpTokenPrices?.forEach((lptp: TokenPriceType) => {
        tempLpTokenPrices[
          `${lptp.chain}-${lptp.protocol}-${lptp.symbol}-${lptp.address}` // key
        ] = lptp.price; // assigning lp token price to the key
      });
      console.log("lpTokenPricesMap", tempLpTokenPrices);
      setLpTokenPricesMap(tempLpTokenPrices);
    }
  }, [isLpPricesLoading]);

  // Fetching token prices
  const { isLoading: isTPricesLoading, data: tokenPrices } = useQuery({
    queryKey: ["tokenPrices"],
    queryFn: async () => {
      try {
        const { tokenPrices } = await fetchTokenPrices();
        return tokenPrices;
      } catch (error) {
        console.error("Error while fetching token prices", error);
      }
    },
  });
  useEffect(() => {
    if (isTPricesLoading) {
      console.log("loading token prices...");
    } else {
      // Setting Token prices data
      // console.log("token prices", tokenPrices);
      // Mapped token prices in a variable
      const tokenPricesMap: any = {};
      tokenPrices?.forEach((tp: any) => {
        tokenPricesMap[
          `${tp.chain}-${tp.protocol}-${tp.symbol}-${tp.address}` // key
        ] = tp.price; // assigning token price to the key
      });
      console.log("tokenPricesMap", tokenPricesMap);
      setTokenPricesMap(tokenPricesMap);
    }
  }, [isTPricesLoading]);

  useEffect(() => {
    console.log("lpTokenPrices useeffect", lpTokenPricesMap);
  }, [lpTokenPricesMap]);

  useEffect(() => {
    console.log("tokenPrices useeffect", tokenPricesMap);
  }, [tokenPricesMap]);

  const setupMangataHelper = async (accountInit: Account | null) => {
    if (account?.address == null) {
      console.log("Connect wallet to use App!");
      return;
    }

    if (mangataHelperx != null && accountInit?.address === account.address) {
      console.log("accountinit", accountInit?.address);
      console.log("account address", account.address);
      console.log("Already initialised!");
      return;
    }

    console.log("Initializing APIs of both chains ...");

    let mangataConfig = MangataConfig;
    const mangataHelper = new MangataHelper(mangataConfig);
    console.log("initiliazing mangata helper...");
    await mangataHelper.initialize();
    console.log("✅ mangata helper initialized\n", mangataHelper);
    setMangataHelper(mangataHelper);

    const mangataChainName = mangataHelper.config.key;

    console.log("mangata Assets", mangataHelper.config.assets);

    const mangataNativeToken = _.first(mangataHelper.config.assets);

    console.log(
      `Mangata chain name: ${mangataChainName}, native token: ${JSON.stringify(
        mangataNativeToken
      )}\n`
    );

    console.log("1. Reading token and balance of account ...");

    // New account instance from connected account
    const account1 = new Account({
      address: account?.address,
      meta: {
        name: account?.name,
      },
    });
    await account1.init([mangataHelper]);
    console.log("account1", account1);
    // It is setting Account1 here, and this fn runs only once in starting
    // it should re-run when an account is updated.
    setAccountInit(account1);

    const mangataAddress = account1.getChainByName(mangataChainName)?.address;
    setMangataAddress(mangataAddress);

    const pools = await mangataHelper.getPools({ isPromoted: true });
    console.log("Promoted Pools", pools);
    setPools(pools);
    setIsInitialised(true);
  };

  // Side-effect for Substrate Chains
  useEffect(() => {
    if (isConnectedDot && farms.length > 0) {
      handleWalletConnectEvent({
        address: account?.address!,
        walletType: "DOT",
        connector: account?.wallet?.extensionName!,
      });
      console.log("running mangata setup\n==> account", account);
      fetchSubstratePositions({
        farms,
        positions,
        setPositions,
        setIsSubPosLoading,
        account,
      });
      setupMangataHelper(accountInit);
    } else if (!isConnectedDot && farms.length > 0) {
      console.log("emptying mangata positions...");
      emptySubstratePositions({
        farms,
        positions,
        setPositions,
      });
    }
  }, [isConnectedDot, account, farms]);

  // Side-effect for EVM Chains
  useEffect(() => {
    const lpTokensPricesLength = Object.keys(lpTokenPricesMap).length;
    const tokenPricesLength = Object.keys(tokenPricesMap).length;
    if (
      isConnected &&
      farms.length > 0 &&
      lpTokensPricesLength > 0 &&
      tokenPricesLength > 0
    ) {
      handleWalletConnectEvent({
        address: address!,
        walletType: "EVM",
        connector: connector?.name!,
      });
      fetchEvmPositions({
        farms,
        positions,
        setPositions,
        setIsEvmPosLoading,
        address,
        tokenPricesMap,
        lpTokenPricesMap,
      }); // Run setup when wallet connected
    } else if (
      !isConnected &&
      farms.length > 0 &&
      lpTokensPricesLength > 0 &&
      tokenPricesLength > 0
    ) {
      console.log("emptying evm positions running...");
      emptyEvmPositions({
        farms,
        positions,
        setPositions,
      });
    }
  }, [
    isConnected,
    farms,
    address,
    lpTokenPricesMap,
    tokenPricesMap,
    lpUpdated,
  ]);

  return (
    <div
      className={clsx(
        "relative flex flex-col min-h-screen font-inter bg-main-gradient text-white overflow-hidden",
        satoshiFont.variable
      )}
    >
      <div className="hidden md:block absolute -left-2 top-16 bg-main-flare blur-[22.5px] w-[1853px] h-[295px] transform rotate-[-156deg]" />
      <AddLiquidityModal />
      <RemoveLiquidityModal />
      {stakingModalOpen && <StakingModal />}
      {unstakingModalOpen && <UnstakingModal />}
      {claimModalOpen && <ClaimRewardsModal />}
      <SlippageModal />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
