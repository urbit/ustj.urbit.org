import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import classnames from "classnames";
import fs from "fs";

export default function Home({ issues }) {
  const [issue, setIssue] = useState(issues[0]);

  return (
    <>
      <Head>
        <title>urbitsystems.tech</title>
        {/* {Meta(post, false, true)} */}
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center bg-primary">
        <header className="flex items-center justify-between h-12 md:h-16 bg-primary layout layout-px">
          <span>Urbit Systems Technical Journal</span>
          <span>Information</span>
        </header>
        <main className="flex flex-col flex-1 layout">
          <div
            className="w-full bg-black layout-px"
            style={{ height: "calc((100vh/4) * 3)" }}
          ></div>
          <div className="h-96 w-full bg-primary layout layout-px"></div>
        </main>
        <footer></footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const slugs = fs.readdirSync("./ustj");
  const issues =
    slugs?.map((slug) => {
      return JSON.parse(fs.readFileSync(`./ustj/${slug}`, "utf8"));
    }) || null;

  return {
    props: { issues },
  };
}
