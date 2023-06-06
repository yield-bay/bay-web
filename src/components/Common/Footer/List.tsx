import { FC } from "react";

type LinkProps = {
  title: string;
  link: string;
};

export const community: LinkProps[] = [
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
  {
    title: "Github",
    link: "https://github.com/yield-bay/",
  },
];

export const List: FC<LinkProps> = ({ title, link }) => (
  <li>
    <a
      href={link}
      className="inline-flex hover:opacity-80"
      target="_blank"
      rel="noreferrer"
    >
      {title}
    </a>
  </li>
);

export default List;
