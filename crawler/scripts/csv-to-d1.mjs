/**
 * Reads top-100k.csv (or top-1m.csv) and writes batched SQL INSERT files
 * that can be imported into Cloudflare D1 with:
 *   wrangler d1 execute visitarandomwebsite --file=d1-seed-001.sql
 *
 * Usage:
 *   node scripts/csv-to-d1.mjs [--file top-1m.csv] [--limit 50000]
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const args = process.argv.slice(2);
const fileArg = args.indexOf('--file');
const limitArg = args.indexOf('--limit');

const CSV_FILE = fileArg !== -1 ? args[fileArg + 1] : 'top-100k.csv';
const LIMIT = limitArg !== -1 ? parseInt(args[limitArg + 1]) : 50000;
const BATCH_SIZE = 500; // D1 has limits on statement size

const SKIP_DOMAINS = [
  'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com',
  'youtube.com', 'tiktok.com', 'reddit.com', 'wikipedia.org', 'amazon.com',
  'booking.com', 'hotels.com', 'expedia.com', 'airbnb.com', 'tripadvisor.com',
];

const SKIP_KEYWORDS = ['hotel', 'hostel', 'motel', 'casino', 'porn', 'xxx', 'adult'];

function shouldSkip(domain) {
  const d = domain.toLowerCase();
  if (SKIP_DOMAINS.some(s => d === s || d.endsWith('.' + s))) return true;
  if (SKIP_KEYWORDS.some(k => d.includes(k))) return true;
  return false;
}

const csvPath = path.join(process.cwd(), CSV_FILE);
if (!fs.existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

const rl = readline.createInterface({ input: fs.createReadStream(csvPath) });

let lineNum = 0;
let kept = 0;
let fileIndex = 1;
let batch = [];
let streams = [];

function writeBatch(rows, index) {
  const filename = `d1-seed-${String(index).padStart(3, '0')}.sql`;
  const values = rows.map(url => `('${url.replace(/'/g, "''")}')`).join(',\n  ');
  const sql = `INSERT OR IGNORE INTO page (url) VALUES\n  ${values};\n`;
  fs.writeFileSync(filename, sql);
  console.log(`Wrote ${filename} (${rows.length} rows)`);
}

for await (const line of rl) {
  if (lineNum === 0) { lineNum++; continue; } // skip header
  if (kept >= LIMIT) break;

  const domain = line.trim();
  if (!domain || shouldSkip(domain)) { lineNum++; continue; }

  const url = `https://${domain}`;
  batch.push(url);
  kept++;
  lineNum++;

  if (batch.length >= BATCH_SIZE) {
    writeBatch(batch, fileIndex++);
    batch = [];
  }
}

if (batch.length > 0) writeBatch(batch, fileIndex);

console.log(`\nDone. ${kept} URLs across ${fileIndex} files.`);
console.log('\nImport into D1 with:');
for (let i = 1; i <= fileIndex; i++) {
  const f = `d1-seed-${String(i).padStart(3, '0')}.sql`;
  console.log(`  wrangler d1 execute visitarandomwebsite --file=${f}`);
}
