import { useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useAtom } from "jotai";
import { hashAtom } from "@store/atoms";
import LeaderBanner from "@components/Library/LeaderBanner";
import HeaderMenu from "@components/Library/HeaderMenu";
import ConnectWallet from "@components/Library/ConnectWallet";

async function fetchUserHash(address: `0x${string}` | undefined) {
  const query = { address };
  let data = await (
    await fetch("https://leaderboard-api-dev.onrender.com/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
  ).json();
  console.log(data.hash);
  return data.hash;
}

const Profile = () => {
  const { address, isConnected } = useAccount();
  const [_, setHash] = useAtom(hashAtom);

  useEffect(() => {
    if (isConnected) {
      fetchUserHash(address).then((_hash) => {
        setHash(_hash);
      });
    }
  }, [isConnected]);

  return isConnected ? <HeaderMenu address={address} /> : <ConnectWallet />;
};

export default function Header() {
  return (
    <div className="relative flex justify-center sm:justify-between w-full px-9 sm:px-11 lg:px-[120px] py-[42px] sm:py-12 z-10 font-bold text-base leading-6 sm:leading-8 text-white transition duration-200">
      <Link href="/">
        <div className="flex flex-col justify-center cursor-pointer">
          <span className="font-bold font-spaceGrotesk text-white text-lg sm:text-2xl leading-[23px] sm:leading-[30px]">
            yieldbay
          </span>
        </div>
      </Link>
      <div className="hidden sm:inline-flex items-center gap-x-4 sm:mr-2">
        <LeaderBanner />
        <Profile />
      </div>
    </div>
  );
}
