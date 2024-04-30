import React, { useEffect } from "react";
import Head from "next/head";
import fs from "fs";
import IntraNav from "@/components/IntraNav";

export default function Article({ html }) {
  useEffect(() => {
    document.body.style = `background-color:hsl(210, 20%, 98%);`;
  });

  return (
    <>
      <Head>
        <title>The State of Urbit: Eight Years After the Whitepaper</title>
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center">
        <IntraNav />
        <main className="flex flex-col items-center flex-1 layout">
          <iframe
            className="flex-1 w-full overflow-auto"
            src="/ustj/v01-i01/html/mss.html"
            frameBorder="0"
          />
        </main>
      </div>
    </>
  );
}

export async function getStaticProps({ params }) {
  // const slug = params.slug;
  // const html = fs.readFileSync(`./content/${slug.join("/")}.html`, "utf8");

  return {
    props: {
      html: null,
    },
  };
}

export async function getStaticPaths() {
  const slugs = ["/article/v01-i01/after-the-whitepaper"];

  return {
    paths: slugs,
    fallback: false,
  };
}
