/**
 * Sitemap built from content, so thin (noindex) city pages stay out until
 * they pass the quality gate. When posts pass ~45k, split into an index.
 */
import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { cityIsIndexable } from '../lib/quality';

export const GET: APIRoute = async ({ site }) => {
  const { cities, services, posts, settings } = await getContent();
  const base = (site?.toString() || settings.siteUrl).replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: base, lastmod: today },
    { loc: `${base}/armada`, lastmod: today },
    { loc: `${base}/sewa-mobil`, lastmod: today },
    { loc: `${base}/rekening-resmi`, lastmod: today },
    ...cities.filter(cityIsIndexable).map((c) => ({ loc: `${base}/${c.slug.current}`, lastmod: c._updatedAt?.slice(0, 10) })),
    ...services.filter((s) => !s.seo?.noindex).map((s) => ({ loc: `${base}/${s.slug.current}`, lastmod: s._updatedAt?.slice(0, 10) })),
    ...(posts.length ? [{ loc: `${base}/blog`, lastmod: posts[0].updatedAt || posts[0].publishedAt }] : []),
    ...posts.filter((p) => !p.seo?.noindex).map((p) => ({ loc: `${base}/blog/${p.slug.current}`, lastmod: p.updatedAt || p.publishedAt })),
  ];
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
