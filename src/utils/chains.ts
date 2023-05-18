export const chains = [
  {
    name: "moonriver",
    url: process.env.NEXT_PUBLIC_MOONRIVER_URL,
    protocols: [
      {
        name: "zenlink",
        chef: "0xf4Ec122d32F2117674Ce127b72c40506c52A72F8",
      },
      {
        name: "solarbeam",
        chef: "0x0329867a8c457e9F75e25b0685011291CD30904F",
      },
    ],
  },
  {
    name: "moonbeam",
    url: process.env.NEXT_PUBLIC_MOONBEAM_URL,
    protocols: [
      {
        name: "curve",
        chef: "0xC106C836771B0B4f4a0612Bd68163Ca93be1D340",
      },
      {
        name: "curve",
        chef: "0x4efb9942e50aB8bBA4953F71d8Bebd7B2dcdE657",
      },
      {
        name: "zenlink",
        chef: "0xD6708344553cd975189cf45AAe2AB3cd749661f4",
      },
      {
        name: "stellaswap", // v1
        chef: "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E",
      },
      {
        name: "stellaswap", // v2
        chef: "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      },
    ],
  },
  {
    name: "astar",
    url: process.env.NEXT_PUBLIC_ASTAR_URL,
    protocols: [
      {
        name: "zenlink",
        chef: "0x460ee9DBc82B2Be84ADE50629dDB09f6A1746545",
      },
    ],
  },
];
