/**
 * Fetches indie/personal blog URLs from multiple curated sources:
 *  - indieblog.page/export  — JSON export of thousands of personal blogs
 *  - ooh.directory          — 44 curated blog categories
 *  - blogroll.org           — 1000+ external blog links
 *
 * Usage:
 *   node scripts/fetch-blogs.mjs
 *
 * Import with:
 *   npx wrangler d1 execute visitarandomwebsite --file=blogs-001.sql --remote
 */

import fs from 'fs';

const SKIP_KEYWORDS = [
  'facebook.com', 'twitter.com', 'x.com', 'youtube.com', 'instagram.com',
  'linkedin.com', 'hotel', 'hostel', 'casino', 'porn', 'booking.com',
  'amazon.com', 'google.com', 'github.com', 'reddit.com', 'wikipedia.org',
];

function shouldSkip(url) {
  const u = url.toLowerCase();
  return SKIP_KEYWORDS.some(s => u.includes(s));
}

function normalise(url) {
  try {
    const u = new URL(url.trim());
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return null;
  }
}

// ── indieblog.page ─────────────────────────────────────────────────────────

async function fetchIndieBlogPage() {
  console.log('Fetching indieblog.page/export...');
  try {
    const res = await fetch('https://indieblog.page/export', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const urls = data
      .map(entry => entry.homepage || entry.url || entry.link)
      .filter(Boolean);
    console.log(`  → ${urls.length} entries from indieblog.page`);
    return urls;
  } catch (e) {
    console.warn(`  ✗ indieblog.page failed: ${e.message}`);
    return [];
  }
}

// ── ooh.directory ──────────────────────────────────────────────────────────

// Paths discovered from ooh.directory homepage — top-level + known subcategories
const OOH_CATEGORY_PATHS = [
  '/blogs/arts/',
  '/blogs/arts/architecture/',
  '/blogs/arts/books/',
  '/blogs/arts/design/',
  '/blogs/arts/games/',
  '/blogs/arts/music/',
  '/blogs/countries/',
  '/blogs/countries/uk/',
  '/blogs/countries/uk/london/',
  '/blogs/countries/usa/',
  '/blogs/economics/',
  '/blogs/economics/business/management/',
  '/blogs/economics/economics/',
  '/blogs/education/',
  '/blogs/humanities/',
  '/blogs/humanities/futures/',
  '/blogs/humanities/geography/',
  '/blogs/humanities/history/',
  '/blogs/humanities/language/',
  '/blogs/personal/',
  '/blogs/politics/',
  '/blogs/politics/law/',
  '/blogs/politics/military/',
  '/blogs/politics/politics/',
  '/blogs/recreation/',
  '/blogs/recreation/food-and-drink/',
  '/blogs/recreation/sport/',
  '/blogs/recreation/travel/',
  '/blogs/science/',
  '/blogs/science/earth-science/',
  '/blogs/science/mathematics/',
  '/blogs/science/space/',
  '/blogs/society/',
  '/blogs/society/death-graves/',
  '/blogs/society/psychogeography/',
  '/blogs/society/religion/',
  '/blogs/technology/',
  '/blogs/technology/development/web/',
  '/blogs/technology/hardware/',
  '/blogs/technology/internet/',
  '/blogs/uncategorizable/',
  '/blogs/uncategorizable/completionists/',
];

function extractBlogOriginsFromHtml(html, baseHost) {
  const origins = new Set();
  // Match all href="..." attributes
  const hrefRe = /href="(https?:\/\/[^"]+)"/g;
  for (const m of html.matchAll(hrefRe)) {
    try {
      const u = new URL(m[1]);
      // Skip links back to ooh.directory itself or common infra
      if (u.hostname === baseHost) continue;
      if (u.hostname.endsWith('ooh.directory')) continue;
      origins.add(`${u.protocol}//${u.hostname}`);
    } catch {}
  }
  return [...origins];
}

async function fetchOohDirectory() {
  console.log('Fetching ooh.directory categories...');
  const all = new Set();

  for (const cat of OOH_CATEGORY_PATHS) {
    const url = `https://ooh.directory${cat}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        console.warn(`  ✗ ooh.directory${cat}: HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      const origins = extractBlogOriginsFromHtml(html, 'ooh.directory');
      for (const o of origins) all.add(o);
      process.stdout.write(`  → ${cat.padEnd(40)} ${origins.length} new | total ${all.size}\r`);
      // Polite delay between pages
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn(`  ✗ ooh.directory${cat}: ${e.message}`);
    }
  }

  console.log(`\n  → ${all.size} unique origins from ooh.directory`);
  return [...all];
}

// ── blogroll.org ───────────────────────────────────────────────────────────

async function fetchBlogrollOrg() {
  console.log('Fetching blogroll.org...');
  try {
    const res = await fetch('https://blogroll.org/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const origins = extractBlogOriginsFromHtml(html, 'blogroll.org');
    console.log(`  → ${origins.length} entries from blogroll.org`);
    return origins;
  } catch (e) {
    console.warn(`  ✗ blogroll.org failed: ${e.message}`);
    return [];
  }
}

// ── indieweb.org/blogroll ──────────────────────────────────────────────────

async function fetchIndieWebBlogroll() {
  console.log('Fetching indieweb.org/blogroll...');
  try {
    const res = await fetch('https://indieweb.org/blogroll', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const origins = extractBlogOriginsFromHtml(html, 'indieweb.org');
    console.log(`  → ${origins.length} entries from indieweb.org/blogroll`);
    return origins;
  } catch (e) {
    console.warn(`  ✗ indieweb.org/blogroll failed: ${e.message}`);
    return [];
  }
}

// ── main ───────────────────────────────────────────────────────────────────

const allUrls = new Set();

const results = await Promise.all([
  fetchIndieBlogPage(),
  fetchBlogrollOrg(),
  fetchIndieWebBlogroll(),
]);

// ooh.directory has many pages — run sequentially after parallel ones
const oohUrls = await fetchOohDirectory();

for (const batch of [...results, oohUrls]) {
  for (const raw of batch) {
    const url = normalise(raw);
    if (url && !shouldSkip(url)) allUrls.add(url);
  }
}

const urls = [...allUrls];
console.log(`\nTotal unique blog URLs: ${urls.length}`);

if (urls.length === 0) {
  console.log('No URLs found — check network or source format.');
  process.exit(0);
}

const BATCH = 500;
let fileIndex = 1;

for (let i = 0; i < urls.length; i += BATCH) {
  const batch = urls.slice(i, i + BATCH);
  const values = batch.map(u => `('${u.replace(/'/g, "''")}', 1)`).join(',\n  ');
  const sql = `INSERT INTO page (url, is_blog) VALUES\n  ${values}\nON CONFLICT(url) DO UPDATE SET is_blog = 1;\n`;
  const filename = `blogs-${String(fileIndex).padStart(3, '0')}.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Wrote ${filename} (${batch.length} URLs)`);
  fileIndex++;
}

console.log('\nImport into D1 with:');
for (let i = 1; i < fileIndex; i++) {
  const f = `blogs-${String(i).padStart(3, '0')}.sql`;
  console.log(`  npx wrangler d1 execute visitarandomwebsite --file=${f} --remote`);
}
