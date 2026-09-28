import type { Car, City, TravelRoute } from './content';

/**
 * A city page is indexable only when it has content that belongs to that city
 * alone. Thin pages still build (so links work and editors can preview them)
 * but ship with noindex and stay out of the sitemap until they're filled in.
 * Keep in sync with the validation in src/sanity/schemas/city.ts.
 */
export function cityIsIndexable(c: City): boolean {
  if (c.seo?.noindex) return false;
  return (
    (c.editorial?.body?.length ?? 0) >= 2 &&
    (c.destinations?.length ?? 0) >= 3 &&
    (c.routes?.length ?? 0) >= 2 &&
    (c.faq?.length ?? 0) >= 4
  );
}

/** A unit page needs its own copy, not just the name and price. */
export function carIsIndexable(c: Car): boolean {
  if (c.seo?.noindex) return false;
  return !!c.summary && (c.idealFor?.length ?? 0) >= 3 && (c.faq?.length ?? 0) >= 2;
}

/** A route page needs a real description of the trip, not just the tariff row. */
export function routeIsIndexable(r: TravelRoute): boolean {
  return !!r.intro && !!r.duration && (r.faq?.length ?? 0) >= 2;
}

/** Busiest cities first, for places that only show a few (home cards, footer). */
const FEATURED = ['Bogor', 'Jakarta', 'Bandung', 'Jogja', 'Surabaya', 'Bali', 'Semarang', 'Malang'];
export function byPopularity<T extends { name: string }>(cities: T[]): T[] {
  const rank = (n: string) => { const i = FEATURED.indexOf(n); return i < 0 ? 99 : i; };
  return [...cities].sort((a, b) => rank(a.name) - rank(b.name));
}
