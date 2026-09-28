/**
 * Push src/data/seed.json into Sanity.
 *
 *   SANITY_API_TOKEN=… node scripts/seed-sanity.mjs            # create missing docs only
 *   SANITY_API_TOKEN=… node scripts/seed-sanity.mjs --replace  # overwrite existing docs
 *
 * Default is createIfNotExists, so running it again never clobbers edits made
 * in the Studio. Runs from GitHub Actions ("Seed Sanity" workflow) because the
 * token lives in the repo secrets.
 */
import { readFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('SANITY_API_TOKEN belum di-set.');
  process.exit(1);
}
const replace = process.argv.includes('--replace');
const client = createClient({ projectId: 'w5eya3q9', dataset: 'production', apiVersion: '2025-01-01', token, useCdn: false });
const docs = JSON.parse(await readFile(new URL('../src/data/seed.json', import.meta.url), 'utf8'));

const tx = client.transaction();
for (const doc of docs) (replace ? tx.createOrReplace(doc) : tx.createIfNotExists(doc));
const res = await tx.commit({ visibility: 'sync' });
console.log(`${replace ? 'Replaced' : 'Ensured'} ${docs.length} documents (${res.results.length} mutations).`);
