import Head from "next/head";
import config from "../config";

const {
  siteName,
  defaultTitle,
  defaultDescription,
  defaultDomain,
  defaultImage,
  defaultUsername,
} = config;

export default function SEOTags({
  title = defaultTitle,
  description = defaultDescription,
  image = defaultImage,
  url = defaultDomain,
  username = defaultUsername,
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta
        name="keywords"
        content="yield-farming, yield farming, yield, defi, polkadot, dotsama, polkadot defi, yield aggregator, kusama, paraverse"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content={username} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
