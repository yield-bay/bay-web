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
        primary: colors.indigo,
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        heading: ["Poppins", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
};

/* 
const theme = {
  dark: {
    baseBlue: "#000E23",
    baseBlueMid: "#001A42",
    baseBlueDark: "01050D",
    primaryBlue: "3780FF",
    primaryWhite: "3780FF",
  },
  light: {},
};

export default theme;
*/
