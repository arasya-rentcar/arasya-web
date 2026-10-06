/**
 * The official price list, as published from the dashboard ("Terbitkan").
 *
 * The API freezes the list into a snapshot (GET /api/v1/public/prices,
 * version 1) and the build reads it once (src/lib/content.ts). Prices are per
 * table ("zone"): a package in an area, e.g. Mobil + Supir Jabodetabek or
 * All-in Jakarta. Every city page shows one car + driver table and one all-in
 * table. A null rate means "tanya admin".
 *
 * Everything here is pure and tolerant of missing data: a car that is not in
 * the snapshot, a table without rates or an empty list all end up as null, so
 * a template shows "Tanya admin" instead of crashing.
 */
import type { City } from './content';
import { ui, type Lang } from './i18n';

export type Duration = '12H' | 'FULLDAY';

export interface PriceCar { slug: string; name: string; price_class: string | null }
export interface PriceSurcharge { area: string; amount: number }
export interface PriceZone {
  code: string;
  name: string;
  /** "XOPS" = car + driver; "ALL-IN X PARKIR" (or another "ALL-IN …") = all-in. */
  service_package: string;
  included: string;
  excluded: string;
  note: string | null;
  /** Used by city pages that are on the site but not in the snapshot. */
  default_for_unlisted: boolean;
  /** { "toyota-avanza": { "12H": 500000, "FULLDAY": 700000 } } */
  rates: Record<string, Record<string, number | null>>;
  surcharges: PriceSurcharge[];
}
export interface PriceCity { slug: string; name: string; driver_zone: string | null; all_in_zone: string | null; quote: boolean }
export interface PriceExtra { label: string; amount: number | null; percent: number | null; unit: string; note: string | null }
export interface PriceSnapshot {
  version: 1;
  published_at: string;
  cars: PriceCar[];
  zones: PriceZone[];
  cities: PriceCity[];
  /** DRIVER_MEAL, DRIVER_LODGING, OVERTIME. */
  extras: Record<string, PriceExtra>;
}

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Minimal shape check of a snapshot (API body `data`, or the bundled fallback). Throws when it isn't one. */
export function parseSnapshot(raw: unknown): PriceSnapshot {
  const fail = (why: string): never => { throw new Error(`bentuk daftar harga tidak valid (${why})`); };
  if (!isObj(raw)) return fail('bukan objek');
  if (raw.version !== 1) fail(`version ${JSON.stringify(raw.version)}, harus 1`);
  if (typeof raw.published_at !== 'string' || Number.isNaN(Date.parse(raw.published_at))) fail('published_at');
  for (const k of ['cars', 'zones', 'cities']) if (!Array.isArray(raw[k])) fail(`${k} bukan array`);
  if (!isObj(raw.extras)) fail('extras bukan objek');
  for (const z of raw.zones) if (!isObj(z) || typeof z.code !== 'string' || !isObj(z.rates)) fail('zone tanpa code/rates');
  for (const c of raw.cities) if (!isObj(c) || typeof c.slug !== 'string') fail('city tanpa slug');
  return raw as PriceSnapshot;
}

// ── Tables ──────────────────────────────────────────────────────────────────
/** Drop tables price one trip ("DROP"); not shown on the website in this phase. */
export const isDropZone = (z: PriceZone) => z.code.startsWith('DROP');
export const isDriverZone = (z: PriceZone) => !isDropZone(z) && z.service_package === 'XOPS';
export const isAllInZone = (z: PriceZone) => !isDropZone(z) && (z.service_package || '').startsWith('ALL-IN');

/** Tables the website shows, in the snapshot's order (car + driver first, then all-in). */
export const siteZones = (p: PriceSnapshot) => p.zones.filter((z) => isDriverZone(z) || isAllInZone(z));
export const driverZones = (p: PriceSnapshot) => p.zones.filter(isDriverZone);
export const allInZones = (p: PriceSnapshot) => p.zones.filter(isAllInZone);

export const zoneByCode = (p: PriceSnapshot, code: string | null | undefined): PriceZone | null =>
  (code && p.zones.find((z) => z.code === code)) || null;

/** One price in rupiah, or null ("tanya admin"). */
export function rate(p: PriceSnapshot, carSlug: string, zone: string | PriceZone | null | undefined, duration: Duration): number | null {
  const z = typeof zone === 'string' ? zoneByCode(p, zone) : zone;
  const v = z?.rates?.[carSlug]?.[duration];
  return typeof v === 'number' && v > 0 ? v : null;
}

// ── City pages ──────────────────────────────────────────────────────────────
export interface CityTables {
  /** Priced per trip (abroad): no tables. */
  quote: boolean;
  driver: PriceZone | null;
  allIn: PriceZone | null;
}

/**
 * The tables of a city page. `city` must be the Indonesian document: the
 * snapshot is keyed by the Indonesian slug. A city that is on the site but not
 * in the snapshot gets the `default_for_unlisted` tables (luar kota + Surabaya
 * today), except abroad, where that rule doesn't apply.
 */
export function cityTables(p: PriceSnapshot, city: Pick<City, 'slug' | 'pricing' | 'country'>): CityTables {
  const listed = p.cities.find((c) => c.slug === city.slug?.current);
  const sanityQuote = city.pricing === 'quote';
  if (listed) {
    const quote = !!listed.quote || sanityQuote;
    // Only a car + driver table as `driver` and an all-in table as `allIn` (never a drop table).
    const driver = zoneByCode(p, listed.driver_zone);
    const allIn = zoneByCode(p, listed.all_in_zone);
    return {
      quote,
      driver: !quote && driver && isDriverZone(driver) ? driver : null,
      allIn: !quote && allIn && isAllInZone(allIn) ? allIn : null,
    };
  }
  if (sanityQuote || city.country === 'INTL') return { quote: sanityQuote, driver: null, allIn: null };
  return {
    quote: false,
    driver: driverZones(p).find((z) => z.default_for_unlisted) || null,
    allIn: allInZones(p).find((z) => z.default_for_unlisted) || null,
  };
}

/**
 * Area surcharges show only on the page of the city the all-in table is named
 * after. Convention: the zone code is that city's name upper-cased (JAKARTA,
 * BANDUNG, SURABAYA). They apply when a rental of that city is extended to the
 * listed areas, not to other cities that borrow the table (Bogor uses the
 * Surabaya all-in table without Surabaya's surcharges).
 */
export const surchargesFor = (zone: PriceZone | null, cityName: string): PriceSurcharge[] =>
  zone && zone.code === cityName.trim().toUpperCase() ? (zone.surcharges || []).filter((s) => s.amount > 0) : [];

// ── "Mulai" prices ──────────────────────────────────────────────────────────
/** A price with where it comes from: which table and which car. */
export interface RatePick { amount: number; zone: PriceZone; slug: string }

function extreme(p: PriceSnapshot, zones: PriceZone[], slugs: string[], duration: Duration, beats: (a: number, b: number) => boolean): RatePick | null {
  let best: RatePick | null = null;
  for (const zone of zones) {
    for (const slug of slugs) {
      const amount = rate(p, slug, zone, duration);
      if (amount != null && (!best || beats(amount, best.amount))) best = { amount, zone, slug };
    }
  }
  return best;
}

/** The lowest rate over these tables and cars (the first table and car win a tie). */
export const cheapest = (p: PriceSnapshot, zones: PriceZone[], slugs: string[], duration: Duration = '12H') =>
  extreme(p, zones, slugs, duration, (a, b) => a < b);

/** The highest rate over these tables and cars. */
export const dearest = (p: PriceSnapshot, zones: PriceZone[], slugs: string[], duration: Duration = '12H') =>
  extreme(p, zones, slugs, duration, (a, b) => a > b);

export interface From { driver: RatePick | null; allIn: RatePick | null }

/**
 * "Mulai" prices per 12 hours: the cheapest car + driver table (Jabodetabek
 * in practice) and the cheapest all-in table (Jakarta). Pass one slug for a
 * car, or every car on the site for site-wide prices.
 */
export const fromPrices = (p: PriceSnapshot, slugs: string[]): From => ({
  driver: cheapest(p, driverZones(p), slugs),
  allIn: cheapest(p, allInZones(p), slugs),
});

/** Lowest and highest rate the website shows (12 hours and Fullday, every table), for JSON-LD. */
export function priceSpan(p: PriceSnapshot, slugs: string[]): { min: number; max: number } | null {
  const zones = siteZones(p);
  const lo = [cheapest(p, zones, slugs, '12H'), cheapest(p, zones, slugs, 'FULLDAY')].filter(Boolean) as RatePick[];
  const hi = [dearest(p, zones, slugs, '12H'), dearest(p, zones, slugs, 'FULLDAY')].filter(Boolean) as RatePick[];
  if (!lo.length || !hi.length) return null;
  return { min: Math.min(...lo.map((x) => x.amount)), max: Math.max(...hi.map((x) => x.amount)) };
}

// ── Labels ──────────────────────────────────────────────────────────────────
/** "Jabodetabek", "Jakarta", "Surabaya & kota lain"; the table name for a table the site doesn't know. */
export const zoneArea = (z: PriceZone, lang: Lang) => ui(lang).zoneArea[z.code] || z.name;

/** "Mobil + Supir Jabodetabek", "All-in Jakarta". */
export function zoneLabel(z: PriceZone, lang: Lang): string {
  const t = ui(lang);
  const area = t.zoneArea[z.code];
  if (!area) return z.name;
  return t.zoneTitle(isAllInZone(z) ? t.allIn : t.pkgDriverTitle, area);
}

/** Publication date in WIB, e.g. "6 Oktober 2026". */
export const publishedDate = (p: PriceSnapshot, lang: Lang) =>
  new Date(p.published_at).toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' });
