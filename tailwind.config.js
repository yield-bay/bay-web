const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

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
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        heading: ["Poppins", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};
