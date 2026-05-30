import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import classnames from "classnames";
import fs from "fs";
import IntraNav from "@/components/IntraNav";
import PdfIcon from "@/components/PdfIcon";

function Row({ children, className, href }) {
  const c = classnames(
    "layout-px py-2.5",
    { "hover:bg-black hover:text-primary cursor-pointer": href },
    className,
  );

  if (href) {
    return (
      <Link className={c} href={href}>
        {children}
      </Link>
    );
  }
  return <div className={c}>{children}</div>;
}

function Contents({ issue }) {
  let comingSoonFlag = true;

  return (
    <div className="w-full layout pb-12 md:pb-16">
      <Row>{issue.title}</Row>
      <hr className="border-t border-black" />
      <Row>{issue.issue}</Row>
      {issue.content.map((o) => {
        const renderAuthors = (authors) =>
          authors.map((s) => <p key={s}>~ {s}</p>);
        // Show the "coming soon" badge only on the first article without a PDF.
        const showComingSoon = !o.pdf && comingSoonFlag;
        if (showComingSoon) {
          comingSoonFlag = false;
        }
        const articleUrl = `/article/${issue.slug}/${o.title
          .toLowerCase()
          .replaceAll(/[^a-z0-9\s-]+/g, "")
          .replaceAll(/\s+/g, "-")}`;

        return (
          <div key={o.title}>
            <hr className="border-t border-black" />
            <Row
              className={classnames("flex justify-between", {
                "text-muted pointer-events-none": !o.pdf,
              })}
              href={(o.html && articleUrl) || ""}
            >
              <div className="flex space-x-5">
                <span
                  className="flex items-center h-full"
                  onClick={(e) => {
                    e.preventDefault();
                    document.location = o.pdf || "";
                  }}
                >
                  <PdfIcon
                    className={classnames(
                      !o.pdf ? "text-transparent" : "hover:text-white",
                      "h-[1.5em]",
                    )}
                  />
                </span>
                <div className="font-mono whitespace-nowrap author-container">
                  {renderAuthors(o.author)}
                </div>
                <span>{o.title}</span>
              </div>
              {showComingSoon && (
                <img
                  className="hidden sm:block h-[1.5em]"
                  alt=""
                  src="/images/coming-soon.png"
                />
              )}
            </Row>
          </div>
        );
      })}
      <hr className="border-t border-black" />
    </div>
  );
}

export default function Home({ issues }) {
  const [issue, setIssue] = useState(issues[issues.length - 1]);
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
        <title>Urbit Systems Technical Journal</title>
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center bg-black">
        <IntraNav shopUrl={issue.links.shop} />
        <main className="flex flex-col items-center flex-1 pb-16 layout bg-black">
          <div className="inline-flex items-center h-12 md:h-16 space-x-5">
            <>
              {issues.length > 1 && (
                <select
                  className="btn outline-0 border border-primary text-primary bg-black"
                  value={issue.issue}
                  onChange={(e) => {
                    setIssue(byKey[e.target.value]);
                  }}
                >
                  {issues.map((issue) => (
                    <option key={issue.issue} value={issue.issue}>
                      {issue.issue}
                    </option>
                  ))}
                </select>
              )}
              <Link
                className="btn sm:hidden border-2 border-primary bg-primary hover:bg-black text-black hover:text-primary"
                href={issue.links.shop}
              >
                Buy $29
              </Link>
            </>
          </div>
          <div
            className="flex items-center justify-center w-full layout-px"
            style={{ height: "calc(100vh * 0.6)" }}
          >
            <img className="h-full w-auto" alt="" src={issue.links.cover} />
          </div>
        </main>
        <div className="flex justify-center w-full bg-primary">
          <Contents issue={issue} />
        </div>
        <footer className="flex flex-col items-center w-full bg-primary text-black type-ui">
          <div className="layout h-12 md:h-16">
            <div className="flex justify-between items-center h-full layout-px gap-4">
              <span className="truncate min-w-0">
                Urbit Systems Technical Journal
              </span>
              <span className="font-mono shrink-0">
                {process.env.NEXT_PUBLIC_COMMIT_HASH || "unknown"}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const slugs = fs.readdirSync("./ustj");
  const issues =
    slugs?.map((slug) => {
      return {
        slug: slug.replace(/\.json$/g, ""),
        ...JSON.parse(fs.readFileSync(`./ustj/${slug}`, "utf8")),
      };
    }) || null;

  return {
    props: { issues },
  };
}
