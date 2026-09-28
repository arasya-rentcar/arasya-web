/**
 * JSON-LD builders. Structured data is what lets Google, and AI answer
 * engines that read it, state facts about Arasya (address, prices, hours)
 * with confidence.
 */
import type { Car, City, Faq, Post, Settings } from './content';

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

export function offerCatalog(cars: Car[], site: string, name: string) {
  return {
    '@type': 'OfferCatalog',
    name,
    itemListElement: cars
      .filter((c) => c.priceCity)
      .map((c) => ({
        '@type': 'Offer',
        name: `Sewa ${c.name} dengan driver, 12 jam dalam kota`,
        price: c.priceCity,
        priceCurrency: 'IDR',
        url: `${site}/armada#${c.slug.current}`,
      })),
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
  };
}

export function cityService(c: City, cars: Car[], site: string, s: Settings) {
  return {
    '@type': 'Service',
    name: `Sewa mobil dengan driver di ${c.name}`,
    serviceType: 'Car rental with driver',
    provider: { '@id': `${site}/#business` },
    areaServed: (c.areaServed || [c.name]).map((n) => ({ '@type': 'Place', name: n })),
    hasOfferCatalog: offerCatalog(cars, site, `Tarif sewa mobil ${c.name}`),
    url: `${site}/${c.slug.current}`,
    brand: s.brandName,
  };
}

export const graph = (...nodes: (object | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
});
