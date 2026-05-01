# Crawler scripts

Scripts for seeding the Cloudflare D1 database with URLs.

Run any script with Node ≥ 18. Each one generates numbered `.sql` batch files, then import with:

```bash
for f in <prefix>-*.sql; do
  npx wrangler d1 execute visitarandomwebsite --file="$f" --remote
done
```

---

## Scripts

### `fetch-blogs.mjs` — indie & personal blogs

Fetches from four sources and generates `blogs-001.sql`, `blogs-002.sql`, …

| Source | URLs |
|---|---|
| [indieblog.page/export](https://indieblog.page/export) | ~6 000 personal blogs |
| [blogroll.org](https://blogroll.org/) | ~1 200 curated blog links |
| [ooh.directory](https://ooh.directory/) | 670+ across 42 categories |
| [indieweb.org/blogroll](https://indieweb.org/blogroll) | IndieWeb member sites |

```bash
node scripts/fetch-blogs.mjs
```

---

### `fetch-indie-lists.mjs` — small personal sites

Fetches [512kb.club](https://512kb.club/) (sites under 512 KB) and generates `indie-001.sql`, …

```bash
node scripts/fetch-indie-lists.mjs
```

---

### `csv-to-d1.mjs` — Tranco/Majestic top sites

Converts a Tranco (or Majestic) CSV to SQL batches.

Download the Tranco top-1M list from [tranco-list.eu](https://tranco-list.eu/) and save as `top-100k.csv`.

```bash
node scripts/csv-to-d1.mjs
node scripts/csv-to-d1.mjs --limit 50000   # first 50 000 only
```

Generates `d1-seed-001.sql`, `d1-seed-002.sql`, …

---

### `opml-to-d1.mjs` — RSS reader export

Converts any OPML file (exported from Feedly, Inoreader, NetNewsWire, etc.) to SQL batches.

```bash
node scripts/opml-to-d1.mjs myfeeds.opml
node scripts/opml-to-d1.mjs myfeeds.opml --out prefix
```
