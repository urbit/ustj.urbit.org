import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

export default function Home({ issues, initialSlug }) {
  const router = useRouter();
  const [issue, setIssue] = useState(
    issues.find((o) => o.slug === initialSlug) || issues[issues.length - 1],
  );

  const issueIndex = issues.findIndex((o) => o.issue === issue.issue);
  const showIssue = (offset) => {
    const nextIndex = (issueIndex + offset + issues.length) % issues.length;
    const nextIssue = issues[nextIndex];
    setIssue(nextIssue);
    router.replace(`/issue/${nextIssue.slug}`, undefined, { shallow: true });
  };

  const coverStyle = (offset) => {
    if (offset === 0) {
      return {
        transform: "translateX(-50%) rotateY(0deg) scale(1)",
        zIndex: 100,
      };
    }
    const abs = Math.abs(offset);
    const sign = Math.sign(offset);
    const shiftVw = sign * (16 + (abs - 1) * 9);
    const scale = Math.max(0.45, 0.78 - (abs - 1) * 0.14);
    const depth = -140 - (abs - 1) * 60;
    return {
      transform: `translateX(-50%) translateX(${shiftVw}vw) translateZ(${depth}px) rotateY(${sign * 60}deg) scale(${scale})`,
      zIndex: 100 - abs,
      opacity: abs > 3 ? 0 : 1,
    };
  };

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
            <Link
              className="btn sm:hidden border-2 border-primary bg-primary hover:bg-black text-black hover:text-primary"
              href={issue.links.shop}
            >
              Buy $29
            </Link>
          </div>
          <div
            className="relative flex items-center justify-center w-full layout-px overflow-hidden"
            style={{ height: "calc(100vh * 0.6)" }}
          >
            {issues.length > 1 && (
              <button
                type="button"
                aria-label="Previous issue"
                onClick={() => showIssue(-1)}
                className="absolute left-4 md:left-8 z-20 text-primary text-4xl md:text-5xl px-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                ◂
              </button>
            )}
            <div
              className="relative h-full w-full"
              style={{ perspective: "1600px" }}
            >
              {issues.map((o, i) => (
                <div
                  key={o.issue}
                  className="absolute top-0 left-1/2 h-full flex items-center justify-center transition-all duration-500 ease-in-out"
                  style={coverStyle(i - issueIndex)}
                >
                  <img
                    className="h-full w-auto shadow-2xl"
                    alt=""
                    src={o.links.cover}
                  />
                </div>
              ))}
            </div>
            {issues.length > 1 && (
              <button
                type="button"
                aria-label="Next issue"
                onClick={() => showIssue(1)}
                className="absolute right-4 md:right-8 z-20 text-primary text-4xl md:text-5xl px-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                ▸
              </button>
            )}
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

function readIssues() {
  const slugs = fs.readdirSync("./ustj");
  return (
    slugs?.map((slug) => {
      return {
        slug: slug.replace(/\.json$/g, ""),
        ...JSON.parse(fs.readFileSync(`./ustj/${slug}`, "utf8")),
      };
    }) || null
  );
}

export async function getStaticProps({ params }) {
  const issues = readIssues();
  const requestedSlug =
    params?.params?.[0] === "issue" ? params.params[1] : null;
  const initialIssue =
    issues.find((o) => o.slug === requestedSlug) || issues[issues.length - 1];

  return {
    props: { issues, initialSlug: initialIssue.slug },
  };
}

export async function getStaticPaths() {
  const issues = readIssues();
  const paths = ["/", ...issues.map((i) => `/issue/${i.slug}`)];

  return {
    paths,
    fallback: false,
  };
}
