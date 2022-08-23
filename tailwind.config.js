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
        baseBlueMid: "#001A42",
        baseBlueDark: "#01050D",
        primaryBlue: "#3780FF",
        primaryWhite: "#EEF1FC",
        blueSilver: "#E2E8FF",
        bodyGray: "#EEF1FC",
        mediumGray: "#838383",
      },
      fontFamily: {
        inter: ["Inter", ...defaultTheme.fontFamily.sans],
        spaceGrotesk: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
