/** Adds the cancellation policy (Indonesian and English) unless the Studio already has one. */
import { readFile } from 'node:fs/promises';

export default async function run(client) {
  const data = JSON.parse(await readFile(new URL('./data/2026-09-29-cities.json', import.meta.url), 'utf8'));
  await client
    .patch('siteSettings')
    .setIfMissing({ cancellationPolicy: data.policy, en: {} })
    .setIfMissing({ 'en.cancellationPolicy': data.policyEn })
    .commit({ visibility: 'sync' });
  console.log('cancellationPolicy ensured on siteSettings.');
}
