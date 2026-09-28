/**
 * Sitemap built from content, so thin (noindex) pages stay out until they
 * pass the quality gate. Pages that exist in both languages list each other
 * as alternates (hreflang). When URLs pass ~45k, split into an index.
 */
import type { APIRoute } from 'astro';
import { getContent, hasEn } from '../lib/content';
import { paths } from '../lib/paths';
import { carIsIndexable, cityIsIndexable, routeIsIndexable } from '../lib/quality';

interface Url { id?: string; en?: string; lastmod?: string }

export const GET: APIRoute = async ({ site }) => {
  const id = await getContent('id');
  const en = await getContent('en');
  const base = (site?.toString() || id.settings.siteUrl).replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const enOf = <T extends { _id: string }>(xs: T[], d: { _id: string }) => xs.find((x) => x._id === d._id);

  const groups: Url[] = [
    { id: '/', en: hasEn.home(id.home) ? '/en' : undefined, lastmod: today },
    { id: paths.fleet('id'), en: paths.fleet('en'), lastmod: today },
    { id: paths.cities('id'), en: paths.cities('en'), lastmod: today },
    { id: paths.verify('id'), en: paths.verify('en'), lastmod: today },
    { id: paths.terms('id'), en: paths.terms('en'), lastmod: today },
    ...id.cars.filter(carIsIndexable).map((c) => ({
      id: paths.car(c.slug.current, 'id'),
      en: hasEn.car(c) ? paths.car(c.slug.current, 'en') : undefined,
      lastmod: c._updatedAt?.slice(0, 10),
    })),
    ...id.cities.filter(cityIsIndexable).map((c) => {
      const e = enOf(en.cities, c);
      return { id: paths.city(c, 'id'), en: e ? paths.city(e, 'en') : undefined, lastmod: c._updatedAt?.slice(0, 10) };
    }),
    ...id.services.filter((s) => !s.seo?.noindex).flatMap((s) => {
      const e = enOf(en.services, s);
      const routes = (s.routes || []).filter((r) => r.intro && routeIsIndexable(r)).map((r) => ({
        id: paths.route(s, r, 'id'),
        en: e && hasEn.route(r) ? paths.route(e, r, 'en') : undefined,
        lastmod: s._updatedAt?.slice(0, 10),
      }));
      return [{ id: paths.service(s, 'id'), en: e ? paths.service(e, 'en') : undefined, lastmod: s._updatedAt?.slice(0, 10) }, ...routes];
    }),
    ...(id.posts.length ? [{ id: '/blog', lastmod: id.posts[0].updatedAt || id.posts[0].publishedAt }] : []),
    ...id.posts.filter((p) => !p.seo?.noindex).map((p) => ({ id: `/blog/${p.slug.current}`, lastmod: p.updatedAt || p.publishedAt })),
  ];

  const abs = (p: string) => base + (p === '/' ? '' : p);
  const entry = (loc: string, g: Url) => {
    const alt = g.id && g.en
      ? `\n    <xhtml:link rel="alternate" hreflang="id" href="${abs(g.id)}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${abs(g.en)}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(g.id)}"/>`
      : '';
    return `  <url>\n    <loc>${abs(loc)}</loc>${g.lastmod ? `\n    <lastmod>${g.lastmod}</lastmod>` : ''}${alt}\n  </url>`;
  };
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    groups.flatMap((g) => [g.id && entry(g.id, g), g.en && entry(g.en, g)].filter(Boolean)).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
