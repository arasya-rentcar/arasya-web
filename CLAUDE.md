# CLAUDE.md — arasya-web

Marketing website: Astro 7 static output (`build.format: 'file'`), content from Sanity (project `w5eya3q9`, dataset `production`) at build time with `src/data/seed.json` as fallback. Deployed by Vercel on every push to `main` (arasya-web.vercel.app; custom domain switch to arasyarentcar.com not done yet).

## Commands
- `npm ci`, `npx astro build` (must pass), `npx astro preview --port 4321` (detaches; stop by PID from its log)
- Python content generators: `scripts/content/*.py` → `apply.py` writes `src/data/seed.json` and `scripts/migrations/data/*.json`.

## Content changes (important)
Never change live content by editing Studio from code. Pattern: update the generator/seed, add an idempotent migration `scripts/migrations/<date>-<name>.mjs` (+ data JSON), push, then run the GitHub workflow **"Migrate Sanity"** with input `name=<date>-<name>`, then redeploy (workflow "Deploy to Vercel (manual)" or a push) because the site is built from Sanity. Tokens live only in GitHub secrets (`SANITY_API_TOKEN`, `VERCEL_TOKEN_NEW`); never print the deploy hook URL (public repo).

## Structure
- `src/lib/content.ts` types + `getContent(lang)`; `i18n.ts` (`ui(lang)`, `localize` overlays `doc.en`; EN pages exist only when en fields are filled); `paths.ts`; `quality.ts` (indexability gates); `faq.ts` (`withPolicy` appends cancellation FAQ from settings); `schema.ts` (JSON-LD).
- `src/templates/*Page.astro`, pages in `src/pages` (ID at root, EN under `/en`). City pricing modes: table / reference / quote.
- Booking form `src/components/BookingBar.astro`: builds the WhatsApp message, code `ARS-XXXXX`, GA4 `generate_lead`, and (when `PUBLIC_LEADS_API` is set; public value in committed `.env.production`) a sendBeacon to `/api/v1/public/leads` with `duration_key`, campaign, gclid, GA ids and a honeypot. Same-session identical resend reuses the code.
- Place suggestions + map picker on pick-up/destination: `src/lib/mapsPicker.ts` (provider-neutral UI) + `src/lib/maps/{osm,google}.ts`, both loaded only on first touch. Build-time `PUBLIC_MAPS_PROVIDER`: `osm` (Photon + Leaflet/OSM tiles, no key, no place id; turned off 7 Oct 2026 as too inaccurate, `.env.production` commits `off`) or `google` (+ `PUBLIC_GOOGLE_MAPS_KEY`, sends `*_place_id`); empty/unknown = off. Switch to Google: set both in Vercel env (overrides `.env.production`) and redeploy. Test: `scripts/test-maps-picker.mjs` (header).
- Analytics in `src/layouts/Base.astro` (GA4 id from Sanity `siteSettings.analytics.ga4Id`; WhatsApp links open in a new tab so GA4 batches are sent).
- Branded unit brochures `public/cars/brochure/*`, catalogue PDF via `scripts/build-catalog.py`.

## Workflows
`ci.yml`, `deploy.yml` (manual/dispatch), `migrate-sanity.yml`, `seed-sanity.yml`, `scheduled-posts.yml` (daily, deploys when a post goes live), `verify-analytics.yml` (live Playwright check of GA4 + lead beacon), `check-setup.yml`.

## Copy
Indonesian first, natural tone; English is localisation, not literal translation. Official account and cancellation text must match the system map above.

## Arasya system map (same section in all four repos)

Arasya Rent Car: car rental **with driver**, Bogor HQ, Indonesia. Legal entity **PT Ayomi Raya Karsa**. Brand name "Arasya Rent Car". Official WhatsApp 0821-2402-4281.

| Repo | What | Deploys to |
|---|---|---|
| `arasya-rentcar/arasya-web` | Marketing website (Astro + Sanity), booking form → lead | Vercel (push to `main`), arasya-web.vercel.app |
| `arasya-rentcar/api-arasya-rentcar` | Express + Prisma API, source of truth (Postgres + Storage on Supabase) | VPS via `deploy-local.sh api`, https://api.haikuy.com |
| `arasya-rentcar/dashboard-arasya-rentcar` | Admin dashboard (Next.js) | Vercel (push to `main`) **and** VPS `deploy-local.sh dashboard` → dashboard.haikuy.com |
| `arasya-rentcar/mobile-arasya-rentcar` | Driver app (Expo, Android first) | EAS build (APK) |
| `arasya-rentcar/wa-bot-arasya` (branch `development`) | Old WhatsApp bot (whatsapp-web.js) | **Being retired**, do not extend |

Flow: website form → `POST /api/v1/public/leads` (code `ARS-XXXXX`, also sent in the WhatsApp message and GA4 `generate_lead`) → dashboard "Lead Website" → order (order_code = lead code) → schedule lines assigned to drivers → driver app (accept / start / arrive / finish / reports) → invoices (DP ≥ 20%) → first PAID invoice sends GA4 `purchase` (Measurement Protocol).

Rules that apply everywhere:
- **Time is WIB (Asia/Jakarta, +07:00).** Never derive dates from `toISOString()` or the browser timezone; build `…T00:00:00+07:00` / `…:00+07:00` explicitly.
- **Payments only to BCA 0954840782 a.n. PT Ayomi Raya Karsa.** No personal accounts anywhere (captions, PDFs, site).
- **Cancellation (per rental day, from that day's own price; every day of an order is judged by its own date):** until 23:59 WIB the day before 20%; on the rental day before 10:00 WIB and the driver has not yet arrived at the pickup address 50%; from 10:00 WIB (10:00:00 itself is already 100%) or once the driver has arrived 100%. Extra charges already incurred are paid in full; overpayment is deducted from the next bill or refunded on request. Website text, captions and PDFs must say the same.
- **Personal data:** NIK and KTP/document files are sensitive (UU PDP). Lists show masked NIK only; documents live in the private bucket and are served by 5-minute signed URLs; never return a full customer object from endpoints that don't need it.
- **Idempotency:** client-generated `client_ref` (uuid) + guarded conditional updates; resends must be no-ops.
- **WhatsApp:** default is manual mode (`WA_DELIVERY` unset/manual): the API returns `wa_url` links the admin opens; driver messages go to the app as push. `WA_DELIVERY=bot` only while the old bot still runs.
- Commits end with the trailers given by the session; never put model names in code or commits. Secrets never in chat or git.
- Deferred work lives in `dashboard-arasya-rentcar/docs/BACKLOG.md`; the latest handoff in `dashboard-arasya-rentcar/docs/HANDOFF.md`.
