/** Sets the GA4 Measurement ID (Pengaturan situs → Analitik). */
export default async function run(client) {
  await client.patch('siteSettings').setIfMissing({ analytics: {} }).set({ 'analytics.ga4Id': 'G-3S9ZDTJ0XE' }).commit({ visibility: 'sync' });
  console.log('analytics.ga4Id set.');
}
