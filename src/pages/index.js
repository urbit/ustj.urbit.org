import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import classnames from "classnames";
import fs from "fs";

export default function Home({ issues }) {
  const [issue, setIssue] = useState(issues[0]);

  useEffect(() => {
    if (issue) {
      document.body.style =
        `--black:${issue.theme.black};` +
        `--white:${issue.theme.white};` +
        `--primary:${issue.theme.primary};` +
        `--muted:${issue.theme.muted};`;
    }
  }, [issue]);

  return (
    <>
      <Head>
        <title>urbitsystems.tech</title>
        {/* {Meta(post, false, true)} */}
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center bg-black">
        <header className="flex items-center justify-between h-12 md:h-16 bg-primary layout layout-px">
          <span>Urbit Systems Technical Journal</span>
          <span>Information</span>
        </header>
        <main className="flex flex-col flex-1 layout">
          <div
            className="flex items-center justify-center w-full bg-black layout-px"
            style={{ height: "calc((100vh/4) * 3)" }}
          >
            <img className="h-3/4 w-auto" alt="" src={issue.links.cover} />
          </div>
          <div className="w-full bg-primary layout layout-px space-y-2.5 pt-2.5 pb-12 md:pb-16">
            <div>{issue.issue}</div>
            <hr className="border-t border-black" />
            <div>{issue.title}</div>
            {issue.content.map((o) => {
              const renderAuthors = (authors) =>
                authors.map((s) => <p>~ {s}</p>);
              return (
                <>
                  <hr className="border-t border-black" />
                  <div className="flex space-x-5">
                    <div className="font-mono whitespace-nowrap">
                      {renderAuthors(o.author)}
                    </div>
                    <p>{o.title}</p>
                  </div>
                </>
              );
            })}
            <hr className="border-t border-black" />
          </div>
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
