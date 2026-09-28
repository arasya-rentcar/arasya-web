/**
 * Every internal URL, per language. Indonesian lives at the root, English
 * under /en with English slugs (city and service slugs come from each
 * document's `en.slug`).
 */
import type { City, ServicePage, TravelRoute } from './content';
import type { Lang } from './i18n';

const en = (lang: Lang) => lang === 'en';

export const paths = {
  home: (lang: Lang) => (en(lang) ? '/en' : '/'),
  fleet: (lang: Lang) => (en(lang) ? '/en/fleet' : '/armada'),
  car: (slug: string, lang: Lang) => `${paths.fleet(lang)}/${slug}`,
  cities: (lang: Lang) => (en(lang) ? '/en/cities' : '/sewa-mobil'),
  verify: (lang: Lang) => (en(lang) ? '/en/official-contacts' : '/rekening-resmi'),
  terms: (lang: Lang) => (en(lang) ? '/en/booking-terms' : '/ketentuan-pemesanan'),
  blog: () => '/blog',
  /** `city` must already be localized when lang is 'en' (its slug is then the English one). */
  city: (c: City, lang: Lang) => (en(lang) ? `/en/${c.slug.current}` : `/${c.slug.current}`),
  service: (s: ServicePage, lang: Lang) => (en(lang) ? `/en/${s.slug.current}` : `/${s.slug.current}`),
  route: (s: ServicePage, r: TravelRoute, lang: Lang) => `${paths.service(s, lang)}/${routeSlug(r)}`,
};

export const routeSlug = (r: TravelRoute) =>
  r.slug || `${r.origin}-${r.destName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Language alternates for hreflang and the switcher: Indonesian path ↔ English path. */
export interface Alternates { id?: string; en?: string }
