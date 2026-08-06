import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import fs from "fs";
import IntraNav from "@/components/IntraNav";

const SITE_URL = "https://ustj.urbit.org";
const JOURNAL_NAME = "Urbit Systems Technical Journal";
const SEASONS = { WI: "Winter", SP: "Spring", SU: "Summer", FA: "Fall" };

function slugify(title) {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]+/g, "")
    .replaceAll(/\s+/g, "-");
}

function parseIssueCode(issue) {
  const m = issue.match(/^([A-Z]{2})(\d{4}):\s*Vol\.\s*(\d+),\s*No\.\s*(\d+)$/);
  if (!m) return { year: null, volume: null, number: null };
  const [, season, year, volume, number] = m;
  return {
    season: SEASONS[season] || season,
    year: Number(year),
    volume: Number(volume),
    number: Number(number),
  };
}

function formatAuthorsApa(authors) {
  if (authors.length === 1) return `${authors[0]}.`;
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}.`;
  return `${authors.slice(0, -1).join(", ")}, & ${authors[authors.length - 1]}.`;
}

function apaCitation(article) {
  const { authors, title, year, volume, number, url } = article;
  const yearStr = year ? `(${year}).` : "(n.d.).";
  const volNo = volume && number ? ` ${volume}(${number}).` : "";
  return `${formatAuthorsApa(authors)} ${yearStr} ${title}. ${JOURNAL_NAME},${volNo} ${url}`;
}

function bibtexKey(article) {
  const firstAuthor = article.authors[0].split("-")[0];
  const firstWord = slugify(article.title).split("-")[0];
  return `${firstAuthor}${article.year || ""}${firstWord}`;
}

function bibtexEntry(article) {
  const { authors, title, year, volume, number, url } = article;
  const lines = [
    `@article{${bibtexKey(article)},`,
    `  author = {${authors.join(" and ")}},`,
    `  title = {${title}},`,
    `  journal = {${JOURNAL_NAME}},`,
  ];
  if (year) lines.push(`  year = {${year}},`);
  if (volume) lines.push(`  volume = {${volume}},`);
  if (number) lines.push(`  number = {${number}},`);
  lines.push(`  url = {${url}}`);
  lines.push(`}`);
  return lines.join("\n");
}

function decodeEntities(str) {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function extractAbstract(htmlPath) {
  if (!fs.existsSync(htmlPath)) return "";
  const html = fs.readFileSync(htmlPath, "utf8");
  const match = html.match(/<section role="doc-abstract"[^>]*>([\s\S]*?)<\/section>/);
  if (!match) return "";

  let body = match[1].replace(/<h3[^>]*class="abstracttitle"[\s\S]*?<\/h3>/, "");
  body = body.replace(/<li[^>]*>/gi, "\n• ");
  body = body.replace(/<\/(p|li)>/gi, "\n");
  body = body.replace(/<br\s*\/?>/gi, "\n");
  body = body.replace(/<[^>]+>/g, "");
  body = decodeEntities(body);
  body = body.replace(/[ \t]+/g, " ");
  body = body.replace(/ *\n */g, "\n");
  body = body.replace(/\n{2,}/g, "\n\n");
  return body.trim();
}

function downloadBibtex(articles) {
  const content = articles.map(bibtexEntry).join("\n\n") + "\n";
  const blob = new Blob([content], { type: "text/plain" });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = "ustj.bib";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

function groupByIssue(articles) {
  const groups = [];
  articles.forEach((article) => {
    const last = groups[groups.length - 1];
    if (last && last.issueLabel === article.issueLabel) {
      last.articles.push(article);
    } else {
      groups.push({ issueLabel: article.issueLabel, articles: [article] });
    }
  });
  return groups;
}

function ArticleEntry({ article }) {
  const [abstractExpanded, setAbstractExpanded] = useState(false);
  const [bibtexExpanded, setBibtexExpanded] = useState(false);
  const hasAbstract = Boolean(article.abstract);

  return (
    <div>
      <p>
        <Link href={article.path} className="hover:text-primary">
          {apaCitation(article)}
        </Link>
      </p>
      <div className="flex flex-wrap gap-x-4 mt-1">
        {hasAbstract && (
          <button
            type="button"
            onClick={() => setAbstractExpanded(!abstractExpanded)}
            className="type-ui text-muted hover:text-primary"
          >
            {abstractExpanded ? "▾ Hide abstract" : "▸ Show abstract"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setBibtexExpanded(!bibtexExpanded)}
          className="type-ui text-muted hover:text-primary"
        >
          {bibtexExpanded ? "▾ Hide BibTeX" : "▸ Show BibTeX"}
        </button>
      </div>
      {abstractExpanded && (
        <p className="whitespace-pre-line type-ui text-muted mt-1">
          {article.abstract}
        </p>
      )}
      {bibtexExpanded && (
        <pre className="overflow-x-auto type-ui text-muted mt-1 font-mono whitespace-pre">
          {bibtexEntry(article)}
        </pre>
      )}
    </div>
  );
}

export default function Citations({ articles }) {
  useEffect(() => {
    document.body.style = `background-color:var(--black);`;
  });

  return (
    <>
      <Head>
        <title>Citations • UrbitSTJ</title>
      </Head>
      <div className="flex flex-col min-h-screen w-screen max-w-full items-center">
        <IntraNav />
        <main className="flex flex-col flex-1 bg-black text-white layout pb-12 md:pb-16 layout-px">
          <div className="layout-narrow mt-4 lg:mt-8 xl:mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 md:mb-[1.5625rem] 3xl:mb-[1.875rem]">
              <h1 className="text-4xl">Article Index</h1>
              <button
                type="button"
                onClick={() => downloadBibtex(articles)}
                className="btn border-2 border-primary text-primary hover:bg-primary hover:text-black"
              >
                Export BibTeX
              </button>
            </div>
            <div className="pb-8">
              {groupByIssue(articles).map((group) => (
                <div key={group.issueLabel} className="mb-6">
                  <h3 className="text-2xl mb-3">{group.issueLabel}</h3>
                  <div className="space-y-4">
                    {group.articles.map((article) => (
                      <ArticleEntry key={article.url} article={article} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const slugs = fs
    .readdirSync("./ustj")
    .filter((f) => f.endsWith(".json"))
    .sort();

  const articles = [];
  slugs.forEach((slug) => {
    const issueSlug = slug.replace(/\.json$/, "");
    const issue = JSON.parse(fs.readFileSync(`./ustj/${slug}`, "utf8"));
    const { year, volume, number } = parseIssueCode(issue.issue);

    issue.content.forEach((c) => {
      if (!c.html) return;
      const path = `/article/${issueSlug}/${slugify(c.title)}`;
      articles.push({
        authors: c.author,
        title: c.title.replace(/\s+/g, " ").trim(),
        year,
        volume,
        number,
        path,
        url: `${SITE_URL}${path}`,
        abstract: extractAbstract(`./public${c.html}`),
        issueLabel: issue.issue,
      });
    });
  });

  return { props: { articles } };
}
