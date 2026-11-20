import React, { useEffect } from "react";
import Head from "next/head";
import fs from "fs";
import IntraNav from "@/components/IntraNav";
import SocialMeta from "@/components/SocialMeta";
import {
  SITE_URL,
  JOURNAL_NAME,
  JOURNAL_DESCRIPTION,
  HOME_CARD,
  articleMeta,
  excerpt,
  slugify,
} from "@/lib/articles.mjs";

export default function Article({ issue, article, social, scholar }) {
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
      <Head>
        {/* Highwire Press tags, read by Google Scholar and reference managers. */}
        <meta key="citation_title" name="citation_title" content={scholar.title} />
        {scholar.authors.map((a, i) => (
          <meta key={`citation_author_${i}`} name="citation_author" content={a} />
        ))}
        <meta key="citation_journal_title" name="citation_journal_title" content={JOURNAL_NAME} />
        {scholar.year && <meta key="citation_publication_date" name="citation_publication_date" content={scholar.year} />}
        {scholar.volume && <meta key="citation_volume" name="citation_volume" content={scholar.volume} />}
        {scholar.number && <meta key="citation_issue" name="citation_issue" content={scholar.number} />}
        {scholar.pdf && <meta key="citation_pdf_url" name="citation_pdf_url" content={scholar.pdf} />}
        {scholar.doi && <meta key="citation_doi" name="citation_doi" content={scholar.doi} />}
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center">
        <IntraNav shopUrl={issue.links.shop} />
        <main className="flex flex-col items-center flex-1 layout">
          {scholar.doi && (
            <p className="w-full type-ui text-muted mt-2">
              DOI:{" "}
              <a href={`https://doi.org/${scholar.doi}`} className="hover:text-primary">
                {scholar.doi}
              </a>
            </p>
          )}
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

  const m = issue.issue.match(/^[A-Z]{2}(\d{4}):\s*Vol\.\s*(\d+),\s*No\.\s*(\d+)$/);
  const scholar = {
    title: meta.title,
    authors: meta.authors.map((a) => a.name || `~${a.patp}`),
    year: m ? m[1] : null,
    volume: m ? m[2] : null,
    number: m ? m[3] : null,
    pdf: article.pdf ? SITE_URL + article.pdf : null,
    doi: meta.doi,
  };

  return {
    props: {
      issue,
      article,
      social,
      scholar,
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
