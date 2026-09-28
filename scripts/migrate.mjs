/**
 * Run one content migration against Sanity.
 *
 *   SANITY_API_TOKEN=… node scripts/migrate.mjs 2026-09-28-multi-city
 *
 * Migrations live in scripts/migrations/{name}.mjs and export
 * `default async (client, seed) => void`. They should patch only the fields
 * they mean to change, so edits made in the Studio survive.
 */
import { readFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';

const name = process.argv[2];
const token = process.env.SANITY_API_TOKEN;
if (!name) throw new Error('Usage: node scripts/migrate.mjs <migration-name>');
if (!token) throw new Error('SANITY_API_TOKEN belum di-set.');

const client = createClient({ projectId: 'w5eya3q9', dataset: 'production', apiVersion: '2025-01-01', token, useCdn: false });
const seed = JSON.parse(await readFile(new URL('../src/data/seed.json', import.meta.url), 'utf8'));
const { default: run } = await import(`./migrations/${name}.mjs`);
await run(client, seed);
console.log(`Migration ${name} done.`);
