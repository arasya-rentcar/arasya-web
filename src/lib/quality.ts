import type { City } from './content';

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
