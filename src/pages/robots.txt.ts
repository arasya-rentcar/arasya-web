/**
 * Indexing is off unless ALLOW_INDEXING=1, so a preview or staging deploy can
 * never get into Google. Turn it on only for the production domain.
 * AI crawlers are allowed on purpose: being quoted by answer engines is a goal.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || '').replace(/\/$/, '');
  const open = process.env.ALLOW_INDEXING === '1';
  const body = open
    ? `User-agent: *\nAllow: /\nDisallow: /studio\n\nSitemap: ${base}/sitemap.xml\n`
    : `# Indexing disabled on this deployment (set ALLOW_INDEXING=1 on production)\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
