/**
 * JSON-LD builders. Structured data is what lets Google, and AI answer
 * engines that read it, state facts about Arasya (address, prices, hours)
 * with confidence.
 */
import type { Car, City, Faq, Post, Settings } from './content';
import type { Lang } from './i18n';
import { paths } from './paths';

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

export function priceRange(cars: Car[]): string | undefined {
  const prices = cars.map((c) => c.priceCity).filter((p): p is number => !!p);
  if (!prices.length) return undefined;
  return `IDR ${Math.min(...prices)} - ${Math.max(...prices)}`;
}

export function offerCatalog(cars: Car[], site: string, name: string, lang: Lang = 'id') {
  return {
    '@type': 'OfferCatalog',
    name,
    itemListElement: cars
      .filter((c) => c.priceCity)
      .map((c) => ({
        '@type': 'Offer',
        name: lang === 'en' ? `${c.name} with driver, 12 hours in town` : `Sewa ${c.name} dengan driver, 12 jam dalam kota`,
        price: c.priceCity,
        priceCurrency: 'IDR',
        url: site + paths.car(c.slug.current, lang),
      })),
  };
}

/** A unit page: the car as a rentable product with its two tariffs. */
export function carProduct(c: Car, site: string, lang: Lang, image?: string) {
  const offers = [
    c.priceCity && { '@type': 'Offer', name: lang === 'en' ? '12 hours in town, with driver' : '12 jam dalam kota, dengan driver', price: c.priceCity, priceCurrency: 'IDR' },
    c.priceAllIn && { '@type': 'Offer', name: lang === 'en' ? 'All-in (fuel, tolls, driver meals)' : 'All-in (BBM, tol, makan driver)', price: c.priceAllIn, priceCurrency: 'IDR' },
  ].filter(Boolean);
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

export function cityService(c: City, cars: Car[], site: string, s: Settings, lang: Lang = 'id') {
  return {
    '@type': 'Service',
    name: lang === 'en' ? `Car rental with driver in ${c.name}` : `Sewa mobil dengan driver di ${c.name}`,
    serviceType: 'Car rental with driver',
    provider: { '@id': `${site}/#business` },
    areaServed: (c.areaServed || [c.name]).map((n) => ({ '@type': 'Place', name: n })),
    ...(c.pricing === 'quote' ? {} : { hasOfferCatalog: offerCatalog(cars, site, lang === 'en' ? `Car rental rates in ${c.name}` : `Tarif sewa mobil ${c.name}`, lang) }),
    url: site + paths.city(c, lang),
    brand: s.brandName,
  };
}

export const graph = (...nodes: (object | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
});
