# visit a random website

Sends you to a random personal website, indie blog, or forgotten corner of the internet.

Fork of [longergrass/visitarandomwebsite](https://github.com/longergrass/visitarandomwebsite) — retro redesign, expanded URL database, hotel filtering.

## Stack

- **Astro** (SSR, `output: server`)
- **React** (client-side components)
- **TypeScript**
- **Tailwind CSS** + **GSAP** (animations)
- **Cloudflare Pages** (hosting)
- **Cloudflare D1** (SQLite database)

## URL sources

The database is seeded from multiple curated lists of small, personal, and indie websites:

| Source | Description |
|---|---|
| [Tranco top-1M](https://tranco-list.eu/) | Top 50 000 websites by traffic (via `crawler/scripts/csv-to-d1.mjs`) |
| [512kb.club](https://512kb.club/) | Personal sites under 512 KB |
| [indieblog.page](https://indieblog.page/) | ~6 000 personal blogs |
| [blogroll.org](https://blogroll.org/) | ~1 200 human-curated blog links |
| [ooh.directory](https://ooh.directory/) | 670+ blogs across 42 topic categories |
| [indieweb.org/blogroll](https://indieweb.org/blogroll) | IndieWeb member sites |

Hotel, booking, and social-media domains are filtered at both the SQL and TypeScript level.

## Crawler scripts

All scripts are in `crawler/scripts/`. Run them with Node ≥ 18.

```bash
# Fetch indie/personal site lists (512kb.club)
node scripts/fetch-indie-lists.mjs

# Fetch all blog sources (indieblog.page, ooh.directory, blogroll.org, indieweb.org)
node scripts/fetch-blogs.mjs

# Convert a Tranco/Majestic CSV to SQL batches
node scripts/csv-to-d1.mjs [--limit 50000]

# Convert any OPML (RSS reader export) to SQL batches
node scripts/opml-to-d1.mjs myfeeds.opml [--out prefix]
```

Each script generates numbered `.sql` files. Import them with:

```bash
for f in blogs-*.sql; do
  npx wrangler d1 execute visitarandomwebsite --file="$f" --remote
done
```

## Development

```bash
cd website
npm install
npm run dev
```

Requires a `wrangler.toml` with a D1 binding named `DB`.

## Credits

- Original project: [longergrass](https://github.com/longergrass/visitarandomwebsite)
- Fork & redesign: [folankagne](https://github.com/folankagne/visitarandomwebsite)
