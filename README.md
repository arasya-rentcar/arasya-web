# Arasya Rent Car — website

Marketing site for Arasya Rent Car (PT Ayomi Raya Karsa, Bogor): car rental with driver.

**Stack:** Astro (static HTML) · Sanity (CMS, Studio at `/studio`) · Vercel.

## How it works

- Every page is prerendered at build time. Sanity is queried once per build
  (`src/lib/content.ts`), so visitors never hit the Sanity API: fast pages and
  no request quota to worry about.
- Pushes to `main` deploy through the Vercel Git integration. Publishing in the
  Studio triggers a rebuild through a Vercel deploy hook
  (Sanity → API → Webhooks). New content is live a few minutes later.
- If Sanity can't be reached or the dataset is empty, the build falls back to
  `src/data/seed.json`. Set `CONTENT_STRICT=1` on production to fail instead.

## Pages and templates

| Route | Source | Template |
|---|---|---|
| `/` | `homePage` | Showroom home |
| `/{slug}` city, e.g. `/sewa-mobil-bogor` | `city` | `src/templates/CityPage.astro` |
| `/wedding`, `/korporat`, `/travel` | `servicePage` (`template` field) | Wedding / Corporate / Travel |
| `/armada` | `car` | fleet catalogue |
| `/blog`, `/blog/{slug}` | `post` | article |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | generated | |

Each page type has its own structure, and city pages can reorder their
sections (`sections` field), so pages built from the same data don't come out
as identical copies.

## Rules that keep hundreds of pages out of spam territory

- A city page is indexable only once it has local content: at least 2
  editorial paragraphs, 3 destinations, 2 routes and 4 FAQs
  (`src/lib/quality.ts`). Until then it ships `noindex` and stays out of the
  sitemap. The Studio shows the same warning.
- Prices, fleet and routes come from data, not copy, so each city's numbers
  are real.
- Internal links follow meaning: city ↔ its articles, city → travel routes,
  article → its city. No keyword-stuffed footer link lists.

## SEO, GEO, AEO

- JSON-LD on every page: `AutoRental` (address, hours, price range),
  `Service` + `OfferCatalog` with real prices, `FAQPage`, `BreadcrumbList`,
  `BlogPosting`.
- A short factual answer near the top of each page (`AnswerBox`), written to
  be quoted by search snippets and AI answer engines.
- `/llms.txt` gives AI assistants the core facts (address, fleet, prices).
- `robots.txt` blocks everything unless `ALLOW_INDEXING=1`. Set it only on the
  production domain.

## Setup

```bash
npm install
npm run dev      # http://localhost:4321, Studio at /studio
npm run build
```

Environment variables: see `.env.example`.

### Sanity (one-time)

1. Sanity manage → API → CORS origins: add `http://localhost:4321` and the
   production domain (with credentials allowed), so the embedded Studio can
   log in.
2. Import the starting content: Actions → **Seed Sanity** → Run workflow
   (needs the `SANITY_API_TOKEN` repo secret with Editor permission).
3. Sanity manage → API → Webhooks: POST to the Vercel deploy hook URL on
   create/update/delete, so publishing rebuilds the site.

## Adding a city

Studio → Halaman kota → new document. Fill in the local content until the
warning disappears, publish. The page, sitemap entry, footer link and
`llms.txt` line appear on the next build.
