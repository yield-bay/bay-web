// NextJS Imports
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";

// Stylesheet Imports
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  // Analytics Setup here
  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
