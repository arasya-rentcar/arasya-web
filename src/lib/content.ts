/**
 * Build-time content layer.
 *
 * Every page is prerendered, so Sanity is queried once per build: one GROQ
 * query fetches all published documents, and references are resolved here.
 * Visitors never hit the Sanity API, which keeps the site fast and inside the
 * free plan's request quota no matter how much traffic it gets.
 *
 * If Sanity can't be reached (or the dataset is still empty) the build falls
 * back to src/data/seed.json, which has the same document shape. Set
 * CONTENT_STRICT=1 in production to turn that fallback into a build failure.
 *
 * Prices come from the API instead: the official price list the dashboard
 * publishes ("Terbitkan", which also calls the deploy hook), fetched once per
 * build alongside Sanity. See fetchPrices().
 */
import { createClient } from '@sanity/client';
import seed from '../data/seed.json';
import fallbackPrices from '../data/prices.json';
import { localize, type Lang } from './i18n';
import { parseSnapshot, type PriceSnapshot } from './prices';

export const SANITY_PROJECT_ID = 'w5eya3q9';
export const SANITY_DATASET = 'production';

type Doc = Record<string, any> & { _id: string; _type: string };

export interface Slug { current: string }
export interface Seo { title?: string; description?: string; noindex?: boolean }
export interface Faq { question: string; answer: string }
export interface TitledText { title: string; text?: string }
export interface Car {
  _id: string;
  name: string;
  slug: Slug;
  category: 'mpv' | 'mpv-premium' | 'suv' | 'premium' | 'van';
  capacity?: number;
  /** No longer shown: prices come from the published price list (Content.prices). */
  priceCity?: number | null;
  /** No longer shown: prices come from the published price list (Content.prices). */
  priceAllIn?: number | null;
  badge?: string | null;
  description?: string;
  image?: any;
  imagePath?: string;
  order?: number;
  /** Longer copy for the unit's own page (/armada/{slug}). */
  summary?: string;
  idealFor?: string[];
  features?: TitledText[];
  luggage?: string;
  /** Travel price class this car belongs to (key in the travel page's units). */
  travelUnit?: string;
  faq?: Faq[];
  seo?: Seo;
  en?: any;
  _updatedAt?: string;
}
export interface Hero {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  car?: Car;
  image?: any;
  imagePath?: string;
}
export interface Settings {
  brandName: string;
  legalName: string;
  siteUrl: string;
  waPhone: string;
  phones: string[];
  address: { street: string; locality: string; region: string; postalCode: string; full: string };
  bankAccounts: { bank: string; number: string; owner: string }[];
  instagram?: string;
  paymentTerms?: string;
  fraudWarning?: { title?: string; text?: string; points?: string[] };
  cancellationPolicy?: { title?: string; intro?: string; items?: { when: string; fee: string; text?: string }[]; closing?: string };
  analytics?: { ga4Id?: string; gtmId?: string };
  /** No longer shown: the price list's table texts and extras replace these notes. */
  rateNotes?: { city?: string; allIn?: string };
  trust: TitledText[];
  testimonials: { quote: string; name: string; context?: string; link?: string }[];
  en?: any;
}
export interface Destination { name: string; area?: string; text?: string; image?: any; imagePath?: string; credit?: string; creditUrl?: string }
export interface City {
  _id: string;
  name: string;
  code: string;
  slug: Slug;
  country?: string;
  isHeadquarters?: boolean;
  /** table: fleet rates · reference: fleet rates, final rate confirmed per city · quote: no rates, car classes. */
  pricing?: 'table' | 'reference' | 'quote';
  unitClasses?: { name: string; seats?: string; luggage?: string; useCase?: string }[];
  trust?: TitledText[];
  hero: Hero;
  sections?: string[];
  editorial?: { eyebrow?: string; title?: string; lead?: string; body?: any[] };
  pickupPoints?: string;
  areaServed?: string[];
  destinations?: Destination[];
  routes?: { to: string; duration?: string; note?: string }[];
  faq?: Faq[];
  seo?: Seo;
  en?: any;
  _updatedAt?: string;
}
export interface TravelRoute {
  _key?: string;
  origin: string;
  dest: string;
  destCode?: string;
  destName: string;
  prices: { unit: string; price: number }[];
  /** Route page (/travel/{slug}); built when `intro` is filled in. */
  slug?: string;
  distance?: string;
  duration?: string;
  via?: string;
  intro?: string;
  tips?: string[];
  faq?: Faq[];
  en?: any;
}
export interface TravelData {
  units: { key: string; name: string; capacity: number; image?: any; imagePath?: string }[];
  origins: { key: string; code: string; name: string }[];
  routes: TravelRoute[];
}
export interface ServicePage extends Partial<TravelData> {
  _id: string;
  template: 'wedding' | 'corporate' | 'travel' | 'standard';
  slug: Slug;
  navLabel?: string;
  hero: Hero;
  answer?: string;
  answerQuestion?: string;
  highlights?: TitledText[];
  cars?: Car[];
  steps?: TitledText[];
  faq?: Faq[];
  seo?: Seo;
  en?: any;
  _updatedAt?: string;
}
export interface Post {
  _id: string;
  title: string;
  slug: Slug;
  category?: string;
  city?: City;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  cover?: any;
  coverPath?: string;
  excerpt: string;
  body: any[];
  faq?: Faq[];
  seo?: Seo;
}
export interface HomePage { seo?: Seo; hero: Hero; featuredCars?: Car[]; en?: any }

export interface Content {
  lang: Lang;
  source: 'sanity' | 'seed';
  /** The published price list (same for both languages). */
  prices: PriceSnapshot;
  pricesSource: 'api' | 'fallback';
  settings: Settings;
  home: HomePage;
  cars: Car[];
  cities: City[];
  services: ServicePage[];
  posts: Post[];
}

const TYPES = ['siteSettings', 'homePage', 'car', 'city', 'servicePage', 'post'];

async function fetchDocs(): Promise<{ docs: Doc[]; source: Content['source'] }> {
  const strict = process.env.CONTENT_STRICT === '1';
  try {
    const client = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: '2025-01-01',
      useCdn: false,
      perspective: 'published',
      token: process.env.SANITY_READ_TOKEN || undefined,
    });
    const docs = await client.fetch<Doc[]>(`*[_type in $types]`, { types: TYPES });
    if (docs.some((d) => d._type === 'siteSettings')) {
      console.log(`[content] ${docs.length} dokumen dari Sanity (${SANITY_PROJECT_ID}/${SANITY_DATASET})`);
      return { docs, source: 'sanity' };
    }
    const msg = '[content] Dataset Sanity masih kosong';
    if (strict) throw new Error(msg);
    console.warn(`${msg}; memakai src/data/seed.json`);
  } catch (err) {
    if (strict) throw err;
    console.warn(`[content] Sanity tidak bisa dihubungi (${(err as Error).message}); memakai src/data/seed.json`);
  }
  return { docs: seed as Doc[], source: 'seed' };
}

const PRICES_TIMEOUT_MS = 15_000;

/**
 * The last price list published from the dashboard: GET
 * {API}/api/v1/public/prices (404 until the first publication). The API base
 * is PRICES_API_URL (local testing) or PUBLIC_LEADS_API (.env.production).
 *
 * Strict on Vercel production (VERCEL_ENV=production) and with
 * CONTENT_STRICT=1: any failure fails the build, so the previous deployment
 * stays live instead of shipping stale prices. Elsewhere (CI, previews, local)
 * it falls back to src/data/prices.json, the seed list of 6 Oct 2026.
 */
async function fetchPrices(): Promise<{ prices: PriceSnapshot; source: Content['pricesSource'] }> {
  const strict = process.env.VERCEL_ENV === 'production' || process.env.CONTENT_STRICT === '1';
  const base = String(process.env.PRICES_API_URL || import.meta.env.PUBLIC_LEADS_API || '').trim().replace(/\/+$/, '');
  const url = base ? `${base}/api/v1/public/prices` : '';
  try {
    if (!url) throw new Error('PRICES_API_URL dan PUBLIC_LEADS_API kosong');
    const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(PRICES_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}${res.status === 404 ? ' (daftar harga belum pernah diterbitkan, atau URL API salah)' : ''}`);
    const body = await res.json().catch(() => null);
    const prices = parseSnapshot(body?.data);
    console.log(`[content] Daftar harga dari API (${url}), diterbitkan ${prices.published_at}`);
    return { prices, source: 'api' };
  } catch (err) {
    const e = err as Error & { cause?: { code?: string; message?: string } };
    const cause = e.cause?.code || e.cause?.message;
    const why = e.name === 'TimeoutError' ? `tidak menjawab dalam ${PRICES_TIMEOUT_MS / 1000} detik` : cause ? `${e.message} (${cause})` : e.message;
    const msg = `[content] Daftar harga tidak bisa diambil dari ${url || 'API'}: ${why}`;
    if (strict) throw new Error(`${msg}. Build dihentikan (VERCEL_ENV=production / CONTENT_STRICT=1) supaya deployment sebelumnya tetap tayang.`);
    console.warn(`${msg}; memakai src/data/prices.json`);
  }
  const prices = parseSnapshot(fallbackPrices);
  console.warn(`[content] PERINGATAN: harga dari src/data/prices.json (diterbitkan ${prices.published_at}), bukan dari daftar harga terbaru di dashboard`);
  return { prices, source: 'fallback' };
}

/** Replace {_ref} objects with the referenced document, recursively. */
function resolve(value: any, byId: Map<string, Doc>, depth = 0): any {
  if (depth > 4 || value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => resolve(v, byId, depth));
  if (value._type === 'reference' && value._ref) {
    const target = byId.get(value._ref);
    return target ? resolve(target, byId, depth + 1) : null;
  }
  const out: any = {};
  for (const [k, v] of Object.entries(value)) out[k] = resolve(v, byId, depth);
  return out;
}

/** Has this document been translated? English pages exist only for these. */
export const hasEn = {
  city: (c: City) => !!(c.en?.slug?.current && c.en?.hero?.title),
  service: (s: ServicePage) => !!(s.en?.slug?.current && s.en?.hero?.title),
  car: (c: Car) => !!c.en?.summary,
  route: (r: TravelRoute) => !!r.en?.intro,
  home: (h: HomePage) => !!h.en?.hero?.title,
};

/** Today in Indonesia (WIB), so a post dated tomorrow appears at local midnight, not 07:00. */
const todayWib = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

/** Posts dated in the future are scheduled: they appear on the first build on or after that date. */
const isPublished = (p: Post, today = todayWib()) => p.publishedAt <= today;

let raw: Promise<Content> | null = null;
const cache = new Map<Lang, Promise<Content>>();

function load(): Promise<Content> {
  raw ??= (async () => {
    // Both at once; in strict mode every failure is reported, not just the first.
    const [docsResult, pricesResult] = await Promise.allSettled([fetchDocs(), fetchPrices()]);
    if (docsResult.status === 'rejected' || pricesResult.status === 'rejected') {
      const reasons = [docsResult, pricesResult].flatMap((r) => (r.status === 'rejected' ? [(r.reason as Error)?.message || String(r.reason)] : []));
      throw new Error(reasons.join('\n'));
    }
    const { docs, source } = docsResult.value;
    const { prices, source: pricesSource } = pricesResult.value;
    const byId = new Map(docs.map((d) => [d._id, d]));
    const of = <T>(type: string): T[] =>
      docs.filter((d) => d._type === type).map((d) => resolve(d, byId) as T);
    const one = <T>(type: string): T => {
      const found = of<T>(type)[0];
      if (!found) throw new Error(`[content] Dokumen ${type} tidak ditemukan`);
      return found;
    };
    const cleanList = <T>(xs: (T | null)[] | undefined) => (xs || []).filter(Boolean) as T[];

    const home = one<HomePage>('homePage');
    home.featuredCars = cleanList(home.featuredCars);
    const services = of<ServicePage>('servicePage').map((s) => ({ ...s, cars: cleanList(s.cars) }));

    return {
      lang: 'id' as Lang,
      source,
      prices,
      pricesSource,
      settings: one<Settings>('siteSettings'),
      home,
      cars: of<Car>('car').sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name)),
      // Headquarters first, then Indonesian cities, then abroad; alphabetical within each.
      cities: of<City>('city').sort((a, b) =>
        Number(!!b.isHeadquarters) - Number(!!a.isHeadquarters) ||
        Number(a.country === 'INTL') - Number(b.country === 'INTL') ||
        a.name.localeCompare(b.name)),
      services,
      posts: of<Post>('post').filter((p) => isPublished(p)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    };
  })();
  return raw;
}

/**
 * All content, in one language. English drops what hasn't been translated
 * (cities, service pages, travel routes) and has no blog.
 */
export function getContent(lang: Lang = 'id'): Promise<Content> {
  if (!cache.has(lang)) {
    cache.set(lang, (async () => {
      const c = await load();
      if (lang === 'id') return c;
      const car = (x: Car) => localize(x, lang);
      const service = (s: ServicePage): ServicePage => {
        const l = localize(s, lang);
        return { ...l, hero: { ...l.hero, car: l.hero.car && car(l.hero.car) }, cars: (l.cars || []).map(car), routes: (s.routes || []).filter(hasEn.route).map((r) => localize(r, lang)) };
      };
      const city = (x: City): City => {
        const l = localize(x, lang);
        return { ...l, hero: { ...l.hero, car: l.hero.car && car(l.hero.car) } };
      };
      const home = localize(c.home, lang);
      return {
        ...c,
        lang,
        settings: localize(c.settings, lang),
        home: { ...home, hero: { ...home.hero, car: home.hero.car && car(home.hero.car) }, featuredCars: (home.featuredCars || []).map(car) },
        cars: c.cars.map(car),
        cities: c.cities.filter(hasEn.city).map(city),
        // Wedding and plain pages have a local audience and stay Indonesian-only.
        services: c.services.filter((s) => hasEn.service(s) && (s.template === 'corporate' || s.template === 'travel')).map(service),
        posts: [],
      };
    })());
  }
  return cache.get(lang)!;
}
