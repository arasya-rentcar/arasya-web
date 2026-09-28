/** Adds the fraud warning to site settings (only if the Studio hasn't set one). */
export default async function run(client, seed) {
  const settings = seed.find((d) => d._id === 'siteSettings');
  await client.patch('siteSettings').setIfMissing({ fraudWarning: settings.fraudWarning }).commit({ visibility: 'sync' });
  console.log('fraudWarning ensured on siteSettings.');
}
