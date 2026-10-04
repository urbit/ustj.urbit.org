import Head from "next/head";
import { SITE_URL, JOURNAL_NAME, X_HANDLE } from "@/lib/articles.mjs";

// Open Graph and X (Twitter) card tags. X shows only the image and title of
// a large card, so the image itself carries the title and abstract; other
// services (Slack, Discord, iMessage) also show the description.
export default function SocialMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}) {
  const url = SITE_URL + path;
  const imageUrl = SITE_URL + image;
  return (
    <Head>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={url} />
      <meta key="og:site_name" property="og:site_name" content={JOURNAL_NAME} />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:image" property="og:image" content={imageUrl} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content={imageAlt} />
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:site" name="twitter:site" content={X_HANDLE} />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={imageUrl} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={imageAlt} />
    </Head>
  );
}
