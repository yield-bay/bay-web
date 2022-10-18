const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
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
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
        spaceGrotesk: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
        montserrat: ["Montserrat", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        tooltipLight: "0px 0px 5px #A2C4FF",
        tooltipDark: "0px 0px 5px #3780FF",
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
      "bg-pattern": "url('/Pattern.png')",
      "hero-gradient":
        "linear-gradient(180deg, rgba(0, 14, 35, 0) 8.54%, #01050D 100%)",
      "hero-gradient-mob":
        "linear-gradient(180deg, rgba(3, 14, 33, 0) -21.54%, #01060F 100%);",
    },
  },
  plugins: [],
};
