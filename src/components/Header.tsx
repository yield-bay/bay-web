import Link from "next/link";
// import HeaderMenu from "@components/Library/HeaderMenu";
// import ConnectWalletEvm from "@components/Library/ConnectWalletEvm";
// import ConnectWalletDot from "@components/Library/ConnectWalletDot";
// import ClientOnly from "./Library/ClientOnly";
// import { useAccount } from "wagmi";
import ConnectWallet from "./Library/ConnectWallet";

// const Profile = () => {
// const { address, isConnected } = useAccount();
// return (
//   <ClientOnly>
//     <div className="inline-flex gap-x-3 items-center">
//       {/* EVM Wallet */}
//       <div>
//         {isConnected ? (
//           <HeaderMenu address={address} />
//         ) : (
//           <ConnectWalletEvm />
//         )}
//       </div>
//       {/* Polkadot Wallet */}
//       <ConnectWalletDot />
//     </div>
//   </ClientOnly>
// );
// };

export default function Header() {
  return (
    <div className="relative w-full px-9 sm:px-11 lg:px-[72px] py-[38px] sm:py-12 z-10 font-bold text-base leading-6 sm:leading-8 text-white transition duration-200">
      <div className="w-full flex justify-between items-center">
        <Link href="/">
          <div className="flex flex-col justify-center cursor-pointer">
            <span className="font-bold text-white text-lg sm:text-lg leading-[23px] sm:leading-[21.78px]">
              yieldbay
            </span>
          </div>
        </Link>
        <div className="inline-flex items-center gap-x-4">
          <ConnectWallet />
        </div>
      </div>
    </div>
  );
}
