const { fontFamily, screens } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      base: "920px",
      ...screens,
    },
    extend: {
      colors: {
        baseBlue: "#000E23",
        baseBlueMid: "#011433",
        baseBlueDark: "#010E23",
        primaryBlue: "#3780FF",
        primaryWhite: "#EEF1FC",
        blueSilver: "#E2E8FF",
        bodyGray: "#EEF1FC",
        mediumGray: "#838383",
        success300: "#C5FFDC",
        success500: "#12B76A",
        success700: "#027A48",
      },
      fontFamily: {
        inter: ["Inter", ...fontFamily.sans],
        montserrat: ["Montserrat", ...fontFamily.sans],
        satoshi: ["var(--font-satoshi)", ...fontFamily.sans],
      },
      boxShadow: {
        farmBtn: "0px 1px 2px rgba(16, 24, 40, 0.05)",
      },
      animation: {
        shiny: "shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
      },
    },
    backgroundImage: {
      "main-gradient":
        "linear-gradient(180deg, #070813 22.59%, rgba(139, 105, 235, 0.47) 414.39%)",
      "main-flare":
        "linear-gradient(90deg, #ADADFF 1.14%, rgba(65, 65, 96, 0.375) 55%, rgba(0, 0, 0, 0) 87.3%)",
      "net-worth-card":
        "linear-gradient(224.04deg, #36364D -48.59%, rgba(54, 54, 77, 0) 105.16%)",
      "rewards-card":
        "linear-gradient(172.15deg, #6DA695 -104.57%, rgba(54, 54, 77, 0) 261.47%);",
      "liquidity-red":
        "radial-gradient(298.23% 157.58% at -22.67% -89.82%, #D08181 0%, #FFF 100%);",
      "liquidity-blue":
        "radial-gradient(183.00% 161.70% at -17.83% -110.99%, #8181D0 0%, #FFF 100%);",
    },
  },
};
