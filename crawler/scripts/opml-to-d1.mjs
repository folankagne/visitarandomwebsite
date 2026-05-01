/**
 * Converts an OPML file (blog/RSS subscription list) to D1 SQL files.
 *
 * OPML is the standard export format from every RSS reader:
 *   Feedly, Inoreader, NewsBlur, NetNewsWire, etc.
 *
 * Usage:
 *   node scripts/opml-to-d1.mjs myblogs.opml
 *   node scripts/opml-to-d1.mjs myblogs.opml --out blogs
 *
 * Then import:
 *   npx wrangler d1 execute visitarandomwebsite --file=blogs-001.sql --remote
 */

import fs from 'fs';
import path from 'path';

const OPML_FILE = process.argv[2];
const outPrefix = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : 'blogs';

if (!OPML_FILE || !fs.existsSync(OPML_FILE)) {
  console.error('Usage: node scripts/opml-to-d1.mjs <file.opml> [--out prefix]');
  process.exit(1);
}

const xml = fs.readFileSync(OPML_FILE, 'utf8');

// Extract all htmlUrl and xmlUrl attributes from outline elements
const urls = new Set();

// htmlUrl is the blog's homepage — prefer this
for (const m of xml.matchAll(/htmlUrl="([^"]+)"/gi)) {
  try { urls.add(new URL(m[1]).origin); } catch {}
}

// xmlUrl is the feed URL — strip common feed paths to get the site
for (const m of xml.matchAll(/xmlUrl="([^"]+)"/gi)) {
  try {
    const u = new URL(m[1]);
    // Remove feed paths like /feed, /rss, /atom, /feed.xml, etc.
    const cleaned = u.origin;
    urls.add(cleaned);
  } catch {}
}

const SKIP = ['facebook.com', 'twitter.com', 'x.com', 'youtube.com', 'instagram.com', 'linkedin.com'];
const filtered = [...urls].filter(u => !SKIP.some(s => u.includes(s)));

const BATCH = 500;
let fileIndex = 1;

for (let i = 0; i < filtered.length; i += BATCH) {
  const batch = filtered.slice(i, i + BATCH);
  const values = batch.map(u => `('${u.replace(/'/g, "''")}')`).join(',\n  ');
  const sql = `INSERT OR IGNORE INTO page (url) VALUES\n  ${values};\n`;
  const filename = `${outPrefix}-${String(fileIndex).padStart(3, '0')}.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Wrote ${filename} (${batch.length} URLs)`);
  fileIndex++;
}

console.log(`\nDone. ${filtered.length} blogs from OPML.`);
console.log('\nImport with:');
for (let i = 1; i < fileIndex; i++) {
  console.log(`  npx wrangler d1 execute visitarandomwebsite --file=${outPrefix}-${String(i).padStart(3,'0')}.sql --remote`);
}
