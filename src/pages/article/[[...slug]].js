import React, { useEffect } from "react";
import Head from "next/head";
import fs from "fs";
import IntraNav from "@/components/IntraNav";
import SocialMeta from "@/components/SocialMeta";
import {
  JOURNAL_NAME,
  JOURNAL_DESCRIPTION,
  HOME_CARD,
  articleMeta,
  excerpt,
  slugify,
} from "@/lib/articles.mjs";

export default function Article({ issue, article, social }) {
  const ref = React.useRef(null);
  const [height, setHeight] = React.useState("0px");

  const measure = () => {
    // latex.css gives the body min-height: 100vh, so once the frame is sized
    // it can only grow; content rarely shrinks after load, so that is fine.
    const body = ref.current?.contentDocument?.body;
    if (body) setHeight(body.scrollHeight + "px");
  };

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return undefined;
    let observer;

    // Web fonts and MathJax finish after the iframe's load event and change
    // the content height, so keep measuring as the article body resizes.
    const attach = () => {
      measure();
      const doc = frame.contentDocument;
      if (doc?.body && typeof ResizeObserver !== "undefined") {
        observer?.disconnect();
        observer = new ResizeObserver(measure);
        observer.observe(doc.body);
        observer.observe(doc.documentElement);
      }
    };

    // The page is static HTML, so the browser often finishes loading the
    // iframe before React hydrates and a React onLoad handler would never
    // fire. Attach to a document that is already there, and listen for any
    // later load as well.
    const doc = frame.contentDocument;
    if (doc?.readyState === "complete" && doc.body?.childElementCount) {
      attach();
    }
    frame.addEventListener("load", attach);
    return () => {
      frame.removeEventListener("load", attach);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style = `background-color:hsl(210, 20%, 98%);`;
  });

  return (
    <>
      <Head>
        <title>{`${social.title} • UrbitSTJ`}</title>
      </Head>
      <SocialMeta type="article" {...social} />
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center">
        <IntraNav shopUrl={issue.links.shop} />
        <main className="flex flex-col items-center flex-1 layout">
          <iframe
            ref={ref}
            className="w-full overflow-auto"
            src={article.html}
            frameBorder="0"
            scrolling="no"
            style={{ height }}
          />
        </main>
      </div>
    </>
  );
}

export async function getStaticProps({ params }) {
  const issue = JSON.parse(
    fs.readFileSync(`./ustj/${params.slug[0]}.json`, "utf8"),
  );

  const article = issue.content.find(
    (c) => slugify(c.title) === params.slug[1],
  );

  // Link-preview tags. Articles without a generated card (pending ones, or a
  // card not yet made by scripts/make-cards.mjs) fall back to the home card.
  const meta = articleMeta(issue, params.slug[0], article);
  const byline = meta.authors
    .map((a) => (a.name ? `${a.name} ~${a.patp}` : `~${a.patp}`))
    .join(", ");
  const social = {
    title: meta.title,
    description: meta.summary ? excerpt(meta.summary, 200) : JOURNAL_DESCRIPTION,
    path: meta.path,
    image: meta.hasCard ? meta.card : HOME_CARD,
    imageAlt: meta.hasCard
      ? `${meta.title}, by ${byline}. ${JOURNAL_NAME}, ${issue.issue}.`
      : `${JOURNAL_NAME}: ${issue.title}.`,
  };

  return {
    props: {
      issue,
      article,
      social,
    },
  };
}

export async function getStaticPaths() {
  const slugs = fs.readdirSync("./ustj");
  const issues =
    slugs?.map((slug) => {
      return {
        slug: slug.replace(/\.json$/g, ""),
        ...JSON.parse(fs.readFileSync(`./ustj/${slug}`, "utf8")),
      };
    }) || null;

  const paths = [];
  issues.forEach((i) => {
    i.content.forEach((c) => {
      paths.push(`/article/${i.slug}/${slugify(c.title)}`);
    });
  });

  return {
    paths,
    fallback: false,
  };
}
