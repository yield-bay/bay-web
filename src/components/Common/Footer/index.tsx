import CButton from "@components/Library/CButton";
import List, { community } from "./List";

const Footer = () => {
  return (
    <footer className="text-white" aria-labelledby="footer-heading">
      <div className="p-8 mt-[14px] sm:mt-0 sm:py-12 sm:px-6 md:px-20 lg:py-14 lg:px-[72px]">
        <div className="lg:flex flex-row justify-between">
          {/* LEFT SIDE */}
          <div className="max-w-[312px]">
            <div className="flex items-center justify-between">
              <span className="font-bold font-satoshi text-xl sm:text-2xl leading-7">
                yieldbay
              </span>
              <a
                href="https://discord.gg/AKHuvbz7q4"
                target="_blank"
                rel="noreferrer"
              >
                <CButton variant="primary">List your protocol</CButton>
              </a>
            </div>
            <div className="pt-8 pb-6 sm:pt-8 font-bold text-xs sm:text-xs leading-4 sm:leading-4">
              <p>Yield Farming hub for the Polkadot &amp; Kusama Parachains.</p>
              <p className="mt-4">
                Discover yield farms, deposit liquidity and earn rewards in the
                interoperable, multi-chain paraverse of Polkadot and Kusama.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <ul
            role="list"
            className="flex flex-row sm:flex-col items-center justify-between sm:space-y-4 text-right text-base leading-4 font-bold pb-20 sm:pb-0"
          >
            {community.map((ele, index) => (
              <List key={index} title={ele.title} link={ele.link} />
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
