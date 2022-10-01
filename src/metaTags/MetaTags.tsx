import BasicTags from "./Tags/BasicTags";
import SEOTags from "./Tags/SEOTags";

export default function MetaTags(props: {
  title?: string | undefined;
  description?: string | undefined;
  image?: string | undefined;
  url?: string | undefined;
  username?: string | undefined;
}) {
  return (
    <>
      <BasicTags />
      <SEOTags {...props} />
    </>
  );
}
