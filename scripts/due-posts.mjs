/**
 * Prints how many articles are dated today (WIB). The scheduled-posts
 * workflow redeploys the site only when this is above zero.
 */
import { createClient } from '@sanity/client';

const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const client = createClient({ projectId: 'w5eya3q9', dataset: 'production', apiVersion: '2025-01-01', useCdn: false, perspective: 'published' });
const count = await client.fetch('count(*[_type == "post" && publishedAt == $today])', { today });
console.log(`${count} article(s) scheduled for ${today}`);
if (process.env.GITHUB_OUTPUT) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_OUTPUT, `due=${count}\n`);
}
