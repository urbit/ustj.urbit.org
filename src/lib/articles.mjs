// Article metadata shared by the pages (at build time) and by
// scripts/make-cards.mjs. Everything is derived from the issue JSON in ./ustj
// and from the TeX4ht article HTML in ./public.
import fs from "fs";

// Canonical origin for social cards and share URLs.
export const SITE_URL = "https://urbitsystems.tech";
export const JOURNAL_NAME = "Urbit Systems Technical Journal";
export const JOURNAL_DESCRIPTION =
  "The Urbit Systems Technical Journal publishes articles on the ongoing " +
  "development of Urbit and on solid-state computing more generally.";
export const X_HANDLE = "@UrbitSTJ";
export const HOME_CARD = "/images/card.png";

export function slugify(title) {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]+/g, "")
    .replaceAll(/\s+/g, "-");
}

export function decodeEntities(str) {
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

// Real names from the article's author block, in the same order as `patps`.
// Entries are null where the article gives only a ship name.
export function extractAuthorNames(htmlPath, patps) {
  if (!fs.existsSync(htmlPath)) return patps.map(() => null);
  const html = fs.readFileSync(htmlPath, "utf8");
  const divMatch = html.match(/<div class="author"[^>]*>([\s\S]*?)<\/div>/);
  if (!divMatch) return patps.map(() => null);

  const names = [];
  divMatch[1].split(/<br\s*\/?>/).forEach((line) => {
    let text = line.replace(/<[^>]+>/g, "");
    text = decodeEntities(text).replace(/\s+/g, " ").trim();
    const m = text.match(/~([a-z]+(?:-[a-z]+)*)/);
    if (!m) return;
    if (text[m.index + m[0].length] === ".") return;
    const name = text.slice(0, m.index).trim().replace(/,$/, "").trim();
    names.push(name || null);
  });

  return names.length === patps.length ? names : patps.map(() => null);
}

const SUPERSCRIPT = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "+": "⁺", n: "ⁿ" };
const TEX_SYMBOLS = { times: "×", cdot: "·", le: "≤", leq: "≤", ge: "≥", geq: "≥", to: "→", rightarrow: "→", approx: "≈", neq: "≠", ldots: "…", dots: "…", pm: "±" };

// Inline MathJax source, \( ... \), as readable plain text for the simple
// cases that turn up in abstracts: 2^{-64}, 100\times.
function texToText(str) {
  return str.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) =>
    tex
      .replace(/\^\{([^}]*)\}|\^(\S)/g, (m, braced, single) => {
        const chars = [...(braced ?? single)];
        return chars.every((c) => SUPERSCRIPT[c])
          ? chars.map((c) => SUPERSCRIPT[c]).join("")
          : "^" + chars.join("");
      })
      .replace(/\\([a-zA-Z]+)\s*/g, (m, name) => TEX_SYMBOLS[name] ?? m)
      .trim(),
  );
}

// Tagged TeX4ht markup to plain text: one line per paragraph or list item.
function htmlToText(body) {
  // Small caps are lower-case letters styled by CSS; as plain text they
  // should read as the capitals they stand for (isa -> ISA).
  body = body.replace(
    /<span\s+class=["'](?:small-caps|ec-lmcsc-[^"']*)["']\s*>([^<]*)<\/span>/g,
    (_, text) => text.toUpperCase(),
  );
  body = body.replace(/<span class=["']footnote-mark["']>[\s\S]*?<\/span>/g, "");
  body = body.replace(/<li[^>]*>/gi, "\n• ");
  body = body.replace(/<\/(p|li)>/gi, "\n");
  body = body.replace(/<br\s*\/?>/gi, "\n");
  body = body.replace(/<[^>]+>/g, "");
  body = decodeEntities(body);
  // Presentation ligatures (ﬁ, ﬂ, ﬃ) back to plain letters.
  body = body.replace(/[ﬀ-ﬆ]/g, (c) => c.normalize("NFKD"));
  body = texToText(body);
  body = body.replace(/[ \t ]+/g, " ");
  body = body.replace(/ *\n */g, "\n");
  body = body.replace(/\n{2,}/g, "\n\n");
  // TeX4ht keeps the PDF's line breaks; rejoin them into flowing text but
  // keep paragraph breaks and bullet lines.
  body = body.replace(/([^\n])\n(?!\n|• )/g, "$1 ");
  return body.trim();
}

export function extractAbstract(htmlPath) {
  if (!fs.existsSync(htmlPath)) return "";
  const html = fs.readFileSync(htmlPath, "utf8");
  const match = html.match(
    /<section[^>]*role=["']doc-abstract["'][^>]*>([\s\S]*?)<\/section>/,
  );
  if (!match) return "";
  // Drop the "Abstract" heading. Only its label is removed, not the whole
  // <h3>, because some articles nest the abstract text inside the heading.
  const body = match[1].replace(
    /<h3[^>]*abstracttitle[^>]*>\s*<span[^>]*>\s*Abstract\s*<\/span>/,
    "",
  );
  return htmlToText(body);
}

// The opening paragraph of the article body, for the few articles that have
// no abstract.
export function extractLead(htmlPath) {
  if (!fs.existsSync(htmlPath)) return "";
  const html = fs.readFileSync(htmlPath, "utf8");
  const start = html.search(/<h3[^>]*class=["']sectionHead["']/);
  if (start < 0) return "";
  const match = html.slice(start).match(/<p[\s>][\s\S]*?<\/p>/);
  return match ? htmlToText(match[0]).replace(/\s+/g, " ") : "";
}

// Shorten text to about `max` characters at a word boundary.
export function excerpt(text, max = 200) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.]+$/, "") + "…";
}

// The social card image sits next to the article HTML:
// /ustj/v03-i02/mss1.html -> /ustj/v03-i02/mss1.card.png
export function cardPath(htmlUrl) {
  return htmlUrl.replace(/\.html$/, ".card.png");
}

// Everything a social card or a set of share tags needs for one article.
// `entry` is an item of an issue's `content` array.
export function articleMeta(issue, issueSlug, entry) {
  const title = entry.title.replace(/\s+/g, " ").trim();
  const published = Boolean(entry.html);
  const htmlPath = published ? `./public${entry.html}` : null;
  const names = published
    ? extractAuthorNames(htmlPath, entry.author)
    : entry.author.map(() => null);
  const card = published ? cardPath(entry.html) : null;
  const abstract = published ? extractAbstract(htmlPath) : "";
  return {
    title,
    issueLabel: issue.issue,
    authors: entry.author.map((patp, i) => ({ patp, name: names[i] })),
    abstract,
    // What a card or link preview shows: the abstract, else the first
    // paragraph of the article.
    summary: abstract || (published ? extractLead(htmlPath) : ""),
    path: `/article/${issueSlug}/${slugify(entry.title)}`,
    card,
    hasCard: Boolean(card) && fs.existsSync(`./public${card}`),
  };
}

export function readIssues() {
  // Sorted so the newest issue is last regardless of directory order.
  return fs
    .readdirSync("./ustj")
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((file) => ({
      slug: file.replace(/\.json$/, ""),
      ...JSON.parse(fs.readFileSync(`./ustj/${file}`, "utf8")),
    }));
}
