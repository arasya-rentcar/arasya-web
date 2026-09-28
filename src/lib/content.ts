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
  rateNotes?: { city?: string; allIn?: string };
  trust: TitledText[];
  testimonials: { quote: string; name: string; context?: string; link?: string }[];
}
export interface Destination { name: string; area?: string; text?: string; image?: any; imagePath?: string; credit?: string; creditUrl?: string }
export interface City {
  _id: string;
  name: string;
  code: string;
  slug: Slug;
  country?: string;
  isHeadquarters?: boolean;
  hero: Hero;
  sections?: string[];
  editorial?: { eyebrow?: string; title?: string; lead?: string; body?: any[] };
  pickupPoints?: string;
  areaServed?: string[];
  destinations?: Destination[];
  routes?: { to: string; duration?: string; note?: string }[];
  faq?: Faq[];
  seo?: Seo;
  _updatedAt?: string;
}
export interface TravelData {
  units: { key: string; name: string; capacity: number; image?: any; imagePath?: string }[];
  origins: { key: string; code: string; name: string }[];
  routes: { origin: string; dest: string; destCode?: string; destName: string; prices: { unit: string; price: number }[] }[];
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
export interface HomePage { seo?: Seo; hero: Hero; featuredCars?: Car[] }

export interface Content {
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

let cache: Promise<Content> | null = null;

export function getContent(): Promise<Content> {
  cache ??= (async () => {
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
      source,
      settings: one<Settings>('siteSettings'),
      home,
      cars: of<Car>('car').sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name)),
      cities: of<City>('city').sort((a, b) => Number(!!b.isHeadquarters) - Number(!!a.isHeadquarters) || a.name.localeCompare(b.name)),
      services,
      posts: of<Post>('post').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    };
  })();
  return cache;
}
