/**
 * JSON-LD builders. Structured data is what lets Google, and AI answer
 * engines that read it, state facts about Arasya (address, prices, hours)
 * with confidence.
 */
import type { Car, City, Faq, Post, Settings } from './content';
import { ui, type Lang } from './i18n';
import { paths } from './paths';
import { fromPrices, isAllInZone, priceSpan, rate, siteZones, zoneArea, zoneLabel, type Duration, type PriceSnapshot, type PriceZone } from './prices';

export function organization(s: Settings, site: string, areas: string[] = []) {
  return {
    '@type': 'AutoRental',
    '@id': `${site}/#business`,
    name: s.brandName,
    legalName: s.legalName,
    url: site,
    logo: `${site}/brand/logo-dark.png`,
    image: `${site}/og-default.png`,
    telephone: '+' + s.waPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address.street,
      addressLocality: s.address.locality,
      addressRegion: s.address.region,
      postalCode: s.address.postalCode,
      addressCountry: 'ID',
    },
    areaServed: areas.map((name) => ({ '@type': 'City', name })),
    sameAs: [s.instagram].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+' + s.waPhone,
      contactType: 'customer service',
      availableLanguage: ['id', 'en'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    },
  };
}

/** Lowest to highest rate on the site (12 hours and Fullday, every table), from the price list. */
export function priceRange(prices: PriceSnapshot, cars: Car[]): string | undefined {
  const span = priceSpan(prices, cars.map((c) => c.slug.current));
  return span ? `IDR ${span.min} - ${span.max}` : undefined;
}

const DURATIONS: Duration[] = ['12H', 'FULLDAY'];
const durationLabel = (d: Duration, lang: Lang) => (d === '12H' ? ui(lang).col12h : ui(lang).colFullday);

/** Fleet catalogue: each car's "mulai" prices per 12 hours (car + driver, all-in), with the area. */
export function offerCatalog(cars: Car[], prices: PriceSnapshot, site: string, name: string, lang: Lang = 'id') {
  const t = ui(lang);
  return {
    '@type': 'OfferCatalog',
    name,
    itemListElement: cars.flatMap((c) => {
      const from = fromPrices(prices, [c.slug.current]);
      const url = site + paths.car(c.slug.current, lang);
      const base = lang === 'en' ? `${c.name} with driver` : `Sewa ${c.name} dengan driver`;
      return [
        from.driver && { '@type': 'Offer', name: `${base}, ${t.pkgDriver} ${t.col12h} (${zoneArea(from.driver.zone, lang)})`, price: from.driver.amount, priceCurrency: 'IDR', url },
        from.allIn && { '@type': 'Offer', name: `${base}, ${t.allIn} ${t.col12h} (${zoneArea(from.allIn.zone, lang)})`, price: from.allIn.amount, priceCurrency: 'IDR', url },
      ].filter(Boolean);
    }),
  };
}

/** Every price of one car in these tables, one offer per table and duration. */
function rateOffers(c: Car, zones: PriceZone[], prices: PriceSnapshot, lang: Lang, label: (z: PriceZone) => string) {
  return zones.flatMap((zone) =>
    DURATIONS.flatMap((d) => {
      const price = rate(prices, c.slug.current, zone, d);
      return price ? [{ '@type': 'Offer', name: `${label(zone)}, ${durationLabel(d, lang)}`, price, priceCurrency: 'IDR' }] : [];
    }));
}

/** A unit page: the car as a rentable product, priced per table (car + driver and all-in areas). */
export function carProduct(c: Car, prices: PriceSnapshot, site: string, lang: Lang, image?: string) {
  const offers = rateOffers(c, siteZones(prices), prices, lang, (z) => zoneLabel(z, lang));
  return {
    '@type': 'Product',
    name: lang === 'en' ? `${c.name} with driver` : `Sewa ${c.name} dengan driver`,
    description: c.summary || c.description,
    image,
    brand: { '@type': 'Brand', name: c.name.split(' ')[0] },
    category: lang === 'en' ? 'Car rental with driver' : 'Sewa mobil dengan driver',
    url: site + paths.car(c.slug.current, lang),
    ...(offers.length ? { offers: offers.map((o: any) => ({ ...o, seller: { '@id': `${site}/#business` }, availability: 'https://schema.org/InStock' })) } : {}),
  };
}

export function faqPage(faq: Faq[] | undefined) {
  if (!faq?.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbs(site: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: site + it.path,
    })),
  };
}

export function article(p: Post, site: string, s: Settings) {
  return {
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt || p.publishedAt,
    author: { '@type': 'Organization', name: p.author || s.brandName },
    publisher: { '@id': `${site}/#business` },
    mainEntityOfPage: `${site}/blog/${p.slug.current}`,
    inLanguage: 'id-ID',
    ...(p.city ? { about: { '@type': 'City', name: p.city.name } } : {}),
  };
}

/** A city page; `tables` are the city's price tables (null when it is quoted per trip). */
export function cityService(c: City, tables: { driver: PriceZone | null; allIn: PriceZone | null } | null, prices: PriceSnapshot, cars: Car[], site: string, s: Settings, lang: Lang = 'id') {
  const t = ui(lang);
  const zones = tables ? [tables.driver, tables.allIn].filter((z): z is PriceZone => !!z) : [];
  const offers = cars.flatMap((car) =>
    rateOffers(car, zones, prices, lang, (z) => `${lang === 'en' ? `${car.name} with driver in ${c.name}` : `Sewa ${car.name} dengan driver di ${c.name}`}, ${isAllInZone(z) ? t.pkgAllInTitle : t.pkgDriverTitle}`)
      .map((o) => ({ ...o, url: site + paths.car(car.slug.current, lang) })));
  return {
    '@type': 'Service',
    name: lang === 'en' ? `Car rental with driver in ${c.name}` : `Sewa mobil dengan driver di ${c.name}`,
    serviceType: 'Car rental with driver',
    provider: { '@id': `${site}/#business` },
    areaServed: (c.areaServed || [c.name]).map((n) => ({ '@type': 'Place', name: n })),
    ...(offers.length ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: lang === 'en' ? `Car rental rates in ${c.name}` : `Tarif sewa mobil ${c.name}`, itemListElement: offers } } : {}),
    url: site + paths.city(c, lang),
    brand: s.brandName,
  };
}

export const graph = (...nodes: (object | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
});
