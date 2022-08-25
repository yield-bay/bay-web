type LinkProps = {
  title: string;
  link: string;
};

export default function Footer() {
  const ecosystem: LinkProps[] = [
    {
      title: "Home",
      link: "https://www.yieldbay.io/",
    },
    {
      title: "App",
      link: "https://app.yieldbay.io/",
    },
    {
      title: "Farms List",
      link: "https://list.yieldbay.io/",
    },
  ];

  const community: LinkProps[] = [
    {
      title: "Twitter",
      link: "https://twitter.com/yield_bay",
    },
    {
      title: "Discord",
      link: "https://discord.gg/AKHuvbz7q4",
    },
    {
      title: "Docs",
      link: "https://docs.yieldbay.io/",
    },
    // {
    //   title: "Github",
    //   link: "https://github.com/yield_bay/",
    // }
  ];

  return (
    <footer className="text-white" aria-labelledby="footer-heading">
      <div className="max-w-6xl py-12 px-6 md:px-20 lg:py-14 lg:px-[121px]">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* LEFT SIDE */}
          <div className="p-[10px] pl-0">
            <div>
              <span className="font-bold font-spaceGrotesk text-white text-[32px] leading-[37.12px]">
                yieldbay
              </span>
            </div>
            <div className="py-9 font-normal text-base leading-5">
              <p>Yield Farming hub for the Polkadot &amp; Kusama Parachains.</p>
              <p className="mt-4">
                Discover yield farms, deposit liquidity and earn rewards in the
                interoperable, multi-chain paraverse of Polkadot and Kusama.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="md:grid md:grid-cols-2 md:gap-14 py-[15px]">
            <div className="mt-0 xl:mt-0">
              <p className="text-base font-bold tracking-[0.115em] uppercase font-montserrat">
                Ecosystem
              </p>
              <ul role="list" className="mt-4 space-y-4 text-base">
                {ecosystem.map((ele, index) => (
                  <List key={index} title={ele.title} link={ele.link} />
                ))}
              </ul>
            </div>
            <div className="mt-12 md:mt-0">
              <p className="text-base font-bold tracking-[0.115em] uppercase font-montserrat">
                Community
              </p>
              <ul role="list" className="mt-4 space-y-4">
                {community.map((ele, index) => (
                  <List key={index} title={ele.title} link={ele.link} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const List = ({ title, link }: LinkProps): any => {
  return (
    <li>
      <a
        href={link}
        className="inline-flex text-base leading-4 font-bold font-spaceGrotesk hover:opacity-80"
        target="_blank"
        rel="noreferrer"
      >
        {title}
      </a>
    </li>
  );
};
