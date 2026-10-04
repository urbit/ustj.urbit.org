#!/usr/bin/env node
// Generate the 1200x630 social card images (X / Open Graph) for the home page
// and for every published article. Run from the repository root after linking
// a new article in ustj/*.json:
//
//   node scripts/make-cards.mjs            # only cards that do not exist yet
//   node scripts/make-cards.mjs --all      # regenerate everything
//   node scripts/make-cards.mjs v03-i02    # regenerate one issue's cards
//
// Cards are written next to the article HTML (mssN.card.png) and to
// public/images/card.png, and are committed like any other asset. Rendering
// uses a locally installed Chromium-family browser through puppeteer-core;
// set CARD_BROWSER to its executable if it is not found automatically.
import fs from "fs";
import { pathToFileURL } from "url";
import puppeteer from "puppeteer-core";
import {
  JOURNAL_NAME,
  JOURNAL_DESCRIPTION,
  HOME_CARD,
  SITE_URL,
  articleMeta,
  readIssues,
} from "../src/lib/articles.mjs";

const WIDTH = 1200;
const HEIGHT = 630;
const FONT_URL =
  "https://media.urbit.org/fonts/UrbitSans/UrbitSansVFWeb-Regular.woff2";
const LOGO = "./public/ustj/v01-i01/ustj-logo-.png";
const HOME_BLURB =
  JOURNAL_DESCRIPTION +
  " Like the Bell Labs Technical Journal on which it is modeled, it documents" +
  " the engineering work necessary to realize the vision of computing as" +
  " sovereign, deterministic, and grounded on solid first principles.";

export const BROWSERS = [
  process.env.CARD_BROWSER,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function page({ theme, topLeft, topRight, body }) {
  return `<!doctype html><meta charset="utf-8">
<style>
@font-face { font-family: "Urbit Sans"; src: url("${FONT_URL}") format("woff2"); font-weight: 100 700; }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
body { font-family: "Urbit Sans"; letter-spacing: 0.01em; background: ${theme.primary}; color: ${theme.black};
  padding: 44px 64px 40px; display: flex; flex-direction: column; }
body > * { flex: none; }
.mono { font-variation-settings: "xtab" 500; }
.top { display: flex; justify-content: space-between; font-size: 25px; font-weight: 500; padding-bottom: 14px; border-bottom: 2px solid ${theme.black}; }
h1 { font-size: 58px; line-height: 1.08; font-weight: 600; margin-top: 30px; letter-spacing: 0; }
.by { font-size: 28px; line-height: 1.25; margin-top: 20px; margin-bottom: 24px; font-weight: 500; }
.by span { white-space: nowrap; }
.abs { font-size: 28px; line-height: 1.32; margin-top: auto; padding-top: 18px; border-top: 2px solid ${theme.black};
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.home { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 34px; }
.home h1 { font-size: 104px; line-height: 1.04; margin-top: 0; }
.home img { width: 150px; height: 150px; margin-top: 12px; mix-blend-mode: multiply; }
</style>
<div class="top"><span>${esc(topLeft)}</span><span>${esc(topRight)}</span></div>
${body}`;
}

export function articlePage(issue, meta) {
  const authors = meta.authors
    .map(
      (a) =>
        `<span>${a.name ? esc(a.name) + " " : ""}<span class="mono">~${a.patp}</span></span>`,
    )
    .join(", ");
  const summary = meta.summary.replace(/\s+/g, " ").trim();
  return page({
    theme: issue.theme,
    topLeft: JOURNAL_NAME,
    topRight: issue.issue.replace(":", " :"),
    body: `<h1>${esc(meta.title)}</h1>
<div class="by">${authors}</div>
${summary ? `<div class="abs">${esc(summary)}</div>` : ""}`,
  });
}

function homePage(issue) {
  const logo = fs.readFileSync(LOGO).toString("base64");
  return page({
    theme: issue.theme,
    topLeft: issue.title,
    topRight: SITE_URL.replace(/^https?:\/\//, ""),
    body: `<div class="home"><h1>Urbit Systems<br>Technical Journal</h1><img src="data:image/png;base64,${logo}"></div>
<div class="abs">${esc(HOME_BLURB)}</div>`,
  });
}

// Runs in the page: shrink the title, then the abstract, until the card fits.
export function fit() {
  const h1 = document.querySelector("h1");
  const abs = document.querySelector(".abs");
  if (document.querySelector(".home")) return { fits: true };
  const fits = () => document.body.scrollHeight <= document.body.clientHeight;
  const tries = [];
  for (const size of [58, 52, 46, 42, 38]) {
    for (const lines of [4, 3]) tries.push([size, lines]);
  }
  tries.push([38, 2], [34, 2]);
  for (const [size, lines] of tries) {
    h1.style.fontSize = size + "px";
    if (abs) abs.style.webkitLineClamp = lines;
    if (fits()) return { fits: true, size, lines };
  }
  return { fits: false };
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const only = args.filter((a) => !a.startsWith("--"));

  const executablePath = BROWSERS.find((p) => fs.existsSync(p));
  if (!executablePath) {
    throw new Error("No browser found; set CARD_BROWSER to a Chromium-family executable.");
  }

  const issues = readIssues();
  const jobs = [];
  const latest = issues[issues.length - 1];
  if (all || !fs.existsSync(`./public${HOME_CARD}`)) {
    jobs.push({ out: `./public${HOME_CARD}`, html: homePage(latest), label: "home" });
  }
  for (const issue of issues) {
    for (const entry of issue.content) {
      if (!entry.html) continue;
      const meta = articleMeta(issue, issue.slug, entry);
      const wanted = all || only.includes(issue.slug) || !meta.hasCard;
      if (!wanted || (only.length && !only.includes(issue.slug))) continue;
      if (!meta.abstract) console.warn(`  no abstract, using first paragraph: ${entry.html}`);
      jobs.push({ out: `./public${meta.card}`, html: articlePage(issue, meta), label: meta.title });
    }
  }
  if (!jobs.length) {
    console.log("All cards are up to date.");
    return;
  }

  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const tab = await browser.newPage();
    await tab.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    for (const job of jobs) {
      await tab.setContent(job.html, { waitUntil: "load" });
      const fontOk = await tab.evaluate(async () => {
        await document.fonts.ready;
        return document.fonts.check('600 58px "Urbit Sans"');
      });
      if (!fontOk) throw new Error("Urbit Sans did not load; check the network.");
      const result = await tab.evaluate(fit);
      if (!result.fits) console.warn(`  does not fit, text is clipped: ${job.label}`);
      await tab.screenshot({ path: job.out, type: "png" });
      console.log(`${job.out}  ${result.size ? `${result.size}px title, ${result.lines} lines` : ""}`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
