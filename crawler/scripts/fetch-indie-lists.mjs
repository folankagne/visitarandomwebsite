/**
 * Fetches curated indie/personal website lists and converts to D1 SQL.
 *
 * Sources:
 *  - 512kb.club  — small personal/indie websites (<512KB)
 *  - 250kb.club  — even smaller personal sites
 *
 * Usage:
 *   node scripts/fetch-indie-lists.mjs
 *
 * Import with:
 *   npx wrangler d1 execute visitarandomwebsite --file=indie-001.sql --remote
 */

import fs from 'fs';

const SOURCES = [
  {
    name: '512kb.club',
    url: 'https://raw.githubusercontent.com/kevquirk/512kb.club/main/_data/sites.yml',
    // YAML format: lines like `  url: https://example.com/`
    parse: (text) => [...text.matchAll(/^\s*url:\s*(https?:\/\/\S+)/gm)].map(m => m[1]),
  },
  {
    name: '250kb.club',
    url: 'https://raw.githubusercontent.com/SebastianZimmer/250kb.club/master/sites.json',
    parse: (text) => {
      try {
        return JSON.parse(text).map(s => s.url || `https://${s.domain}`).filter(Boolean);
      } catch {
        // try yaml-style fallback
        return [...text.matchAll(/^\s*url:\s*(https?:\/\/\S+)/gm)].map(m => m[1]);
      }
    },
  },
];

const SKIP = [
  'facebook.com', 'twitter.com', 'x.com', 'youtube.com', 'instagram.com',
  'linkedin.com', 'hotel', 'hostel', 'casino', 'porn', 'booking.com',
];

function shouldSkip(url) {
  const u = url.toLowerCase();
  return SKIP.some(s => u.includes(s));
}

function normalise(url) {
  try {
    const u = new URL(url.trim());
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return null;
  }
}

async function fetchSource(source) {
  console.log(`Fetching ${source.name}...`);
  try {
    const res = await fetch(source.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const urls = source.parse(text);
    console.log(`  → ${urls.length} entries`);
    return urls;
  } catch (e) {
    console.warn(`  ✗ Failed: ${e.message}`);
    return [];
  }
}

const allUrls = new Set();

for (const source of SOURCES) {
  const urls = await fetchSource(source);
  for (const raw of urls) {
    const url = normalise(raw);
    if (url && !shouldSkip(url)) allUrls.add(url);
  }
}

const urls = [...allUrls];
console.log(`\nTotal unique indie sites: ${urls.length}`);

if (urls.length === 0) {
  console.log('No URLs found — check network or source format.');
  process.exit(0);
}

const BATCH = 500;
let fileIndex = 1;

for (let i = 0; i < urls.length; i += BATCH) {
  const batch = urls.slice(i, i + BATCH);
  const values = batch.map(u => `('${u.replace(/'/g, "''")}')`).join(',\n  ');
  const sql = `INSERT OR IGNORE INTO page (url) VALUES\n  ${values};\n`;
  const filename = `indie-${String(fileIndex).padStart(3, '0')}.sql`;
  fs.writeFileSync(filename, sql);
  console.log(`Wrote ${filename} (${batch.length} URLs)`);
  fileIndex++;
}

console.log('\nImport into D1 with:');
for (let i = 1; i < fileIndex; i++) {
  const f = `indie-${String(i).padStart(3, '0')}.sql`;
  console.log(`  npx wrangler d1 execute visitarandomwebsite --file=${f} --remote`);
}
