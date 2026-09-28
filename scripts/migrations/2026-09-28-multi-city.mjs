/**
 * Home and topic pages become city-neutral; Bogor's label becomes "Kota
 * Bogor"; Jakarta and Bandung city pages are added. Values come from
 * seed.json so the fallback and Sanity stay identical.
 */
const pick = (obj, paths) => Object.fromEntries(paths.map((p) => [p, p.split('.').reduce((o, k) => o?.[k], obj)]));

export default async function run(client, seed) {
  const byId = Object.fromEntries(seed.map((d) => [d._id, d]));
  const tx = client.transaction();

  tx.patch('homePage', (p) => p.set(pick(byId.homePage, ['seo.title', 'seo.description', 'hero.eyebrow', 'hero.title'])));
  tx.patch('city-bogor', (p) => p.set(pick(byId['city-bogor'], ['hero.eyebrow'])));

  const serviceFields = ['seo.title', 'seo.description', 'hero.eyebrow', 'hero.lead', 'answer', 'answerQuestion'];
  for (const id of ['service-wedding', 'service-korporat', 'service-travel']) {
    tx.patch(id, (p) => p.set(pick(byId[id], serviceFields)));
  }
  // Wedding "Driver rapi" highlight and travel "Rute apa saja" FAQ mentioned Bogor only.
  tx.patch('service-wedding', (p) => p.set({ highlights: byId['service-wedding'].highlights }));
  tx.patch('service-travel', (p) => p.set({ faq: byId['service-travel'].faq }));

  tx.createIfNotExists(byId['city-jakarta']);
  tx.createIfNotExists(byId['city-bandung']);

  const res = await tx.commit({ visibility: 'sync' });
  console.log(`${res.results.length} mutations applied.`);
}
