import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    const title = "YieldBay List";
    const desc =
      "Discover yield opportunities across multiple protocols and parachains on Polkadot and Kusama.";
    const domain = "https://list.yieldbay.io/";
    const twitterUsername = "@yield_bay";

    return (
      <Html>
        <Head>
          <meta name="title" content={title} />
          <meta name="description" content={desc} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={domain} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={desc} />
          <meta property="og:image" content="/twitter-cover.png" />
          {/* <meta property="og:locale" content={} /> */}
          {/* <meta property="og:site_name" content="YieldBay Farms" /> */}
          <meta
            name="keywords"
            content="yield-farming, yield farming, yield, defi, polkadot, dotsama, polkadot defi, yield aggregator, kusama, paraverse"
          />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={domain} />
          <meta name="twitter:site" content={twitterUsername} />
          <meta name="twitter:creator" content="@yield_bay" />
          <meta property="twitter:title" content={title} />
          <meta property="twitter:description" content={desc} />
          <meta property="twitter:image" content="/twitter-cover.png" />

          <link rel="icon" href="/favicon/favicon.ico" />
          <link rel="manifest" href="/favicon/site.webmanifest" />
          <link
            rel="icon"
            type="image/png"
            sizes="512x512"
            href="/favicon/android-chrome-512x512.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/favicon/android-chrome-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
