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
 */
import { createClient } from '@sanity/client';
import seed from '../data/seed.json';
import { localize, type Lang } from './i18n';

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
  priceCity?: number | null;
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
    const { docs, source } = await fetchDocs();
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
