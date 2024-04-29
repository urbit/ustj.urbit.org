import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import classnames from "classnames";
import fs from "fs";
import IntraNav from "@/components/IntraNav";

function Contents({ issue }) {
  let comingSoonFlag = true;

  return (
    <div className="w-full layout layout-px space-y-2.5 pt-2.5 pb-12 md:pb-16">
      <div>{issue.title}</div>
      <hr className="border-t border-black" />
      <div>{issue.issue}</div>
      {issue.content.map((o) => {
        const renderAuthors = (authors) => authors.map((s) => <p>~ {s}</p>);
        let ComingSoon = null;
        if (!o.pdf && comingSoonFlag) {
          ComingSoon = () => (
            <img className="h-[1.5em]" alt="" src="/images/coming-soon.png" />
          );
          comingSoonFlag = false;
        }
        return (
          <>
            <hr className="border-t border-black" />
            <div
              className={classnames("flex justify-between", {
                "text-muted pointer-events-none": !o.pdf,
              })}
            >
              <div className="flex space-x-5">
                <Link className={!o.pdf ? "text-transparent" : ""} href={o.pdf || ""}>PDF</Link>
                <div className="font-mono whitespace-nowrap">
                  {renderAuthors(o.author)}
                </div>
                <Link href={o.html || ""}>{o.title}</Link>
              </div>
              {ComingSoon && <ComingSoon />}
            </div>
          </>
        );
      })}
      <hr className="border-t border-black" />
    </div>
  );
}

export default function Home({ issues }) {
  const [issue, setIssue] = useState(issues[0]);
  const byKey = issues.reduce((res, curr) => {
    const newRes = { ...res };
    newRes[curr.issue] = curr;
    return newRes;
  }, {});

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
        <title>ustj.urbit.org</title>
        {/* {Meta(post, false, true)} */}
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center bg-black">
        <IntraNav shopUrl={issue.links.shop} />
        <main className="flex flex-col items-center flex-1 pb-16 layout bg-black">
          <div className="inline-flex items-center h-12 md:h-16 space-x-5">
            {issues.length > 1 && (
              <>
                <select
                  className="btn outline-0 border border-primary text-primary bg-black"
                  value={issue.issue}
                  onChange={(e) => {
                    setIssue(byKey[e.target.value]);
                  }}
                >
                  {issues.map((issue) => (
                    <option value={issue.issue}>{issue.issue}</option>
                  ))}
                </select>
                {/* <Link className="btn bg-primary text-black" href={issue.links.shop}> */}
                {/*   Buy $25 */}
                {/* </Link> */}
              </>
            )}
          </div>
          <div
            className="flex items-center justify-center w-full layout-px"
            style={{ height: "calc(100vh * 0.6)" }}
          >
            <img className="h-full w-auto" alt="" src={issue.links.cover} />
          </div>
        </main>
        <footer className="flex justify-center w-full bg-primary">
          <Contents issue={issue} />
        </footer>
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
