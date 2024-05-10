import React, { useEffect } from "react";
import Head from "next/head";
import fs from "fs";
import IntraNav from "@/components/IntraNav";

export default function Article({ issue, article }) {
  const ref = React.useRef(null);
  const [height, setHeight] = React.useState("0px");

  const onLoad = () => {
    setHeight(ref.current.contentWindow.document.body.scrollHeight + "px");
  };

  useEffect(onLoad, [ref]);

  useEffect(() => {
    document.body.style = `background-color:hsl(210, 20%, 98%);`;
  });

  return (
    <>
      <Head>
        <title>{article.title}</title>
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center">
        <IntraNav />
        <main className="flex flex-col items-center flex-1 layout">
          <iframe
            ref={ref}
            className="w-full overflow-auto"
            src={article.html}
            frameBorder="0"
            scrolling="no"
            style={{ height }}
            onLoad={onLoad}
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

  const article = issue.content.find((c) => {
    const slug = c.title
      .toLowerCase()
      .replaceAll(/[^a-z0-9\s-]+/g, "")
      .replaceAll(/\s+/g, "-");
    return slug === params.slug[1];
  });

  return {
    props: {
      issue,
      article,
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
      paths.push(
        `/article/${i.slug}/${c.title
          .toLowerCase()
          .replaceAll(/[^a-z0-9\s-]+/g, "")
          .replaceAll(/\s+/g, "-")}`,
      );
    });
  });

  return {
    paths,
    fallback: false,
  };
}
