import Link from "next/link";
import Button from "./Library/Button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect } from "react";
import { hashAtom } from "@store/atoms";
import { useAtom } from "jotai";

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

  // try {
  //   const response = await axios.get(
  //     "https://leaderboard-api-dev.onrender.com/leaderboard"
  //   );
  //   console.log(response);
  // } catch (error) {
  //   console.error(error);
  // }
}

function Profile() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected) {
      fetchUserHash(address);
    }
  }, [isConnected]);
  if (isConnected) {
    // (async () => {
    //   const query = { address };
    //   let data = await (
    //     await fetch("https://leaderboard-api.onrender.com/leaderboard", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(query),
    //     })
    //   ).json();
    //   console.log(data);
    // })();
    return (
      <div>
        Connected to {address}
        <Button size="small" onButtonClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }
  // return <button onClick={() => connect()}>Connect Wallet</button>;
  return (
    <>
      {connectors.map((c) => (
        <Button
          key={c.id}
          size="small"
          onButtonClick={() => connect({ connector: c })}
        >
          Connect to {c.name}
        </Button>
      ))}
    </>
  );
}

export default function Header() {
  // const { address, isConnected } = useAccount();
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
        <a
          href="https://discord.gg/AKHuvbz7q4"
          target="_blank"
          rel="noreferrer"
        >
          <Button size="small">List your protocol</Button>
        </a>
        {/* <Button size="small" onClick={Profile}>Connect Metamask Wallet</Button> */}
        <Profile />
      </div>
    </div>
  );
}
