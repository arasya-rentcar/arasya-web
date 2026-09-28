/**
 * Opens the live site in a real browser, clicks a WhatsApp button and sends
 * the booking form, and prints every hit that reaches Google Analytics.
 * WhatsApp itself is never opened. The hits are real: they show up in GA4
 * Realtime (and count as one test visit).
 *
 *   node scripts/verify-analytics.mjs https://arasya-web.vercel.app
 */
import { chromium } from 'playwright';

const base = process.argv[2] || 'https://arasya-web.vercel.app';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'id-ID' });
const page = await context.newPage();
const hits = [];
// GA4 batches events into one POST a few seconds later (or flushes them as
// the page unloads), with the event names in the request body. Routing lets
// us read that body, including for beacons sent while a page is unloading.
await context.route(/google-analytics\.com\/g\/collect/, (route) => {
  const r = route.request();
  const u = new URL(r.url());
  const lines = [u.search.slice(1), ...(r.postData() || '').split('\n')];
  for (const line of lines) {
    const q = new URLSearchParams(line);
    if (q.get('en')) hits.push({ tid: u.searchParams.get('tid'), en: q.get('en'), lead_id: q.get('ep.lead_id') || '', cta: q.get('ep.cta') || '' });
  }
  route.continue();
});
// Stand in for WhatsApp so the site page really unloads, as it does for a visitor.
await context.route('https://wa.me/**', (r) => { hits.push({ en: '→ navigated to wa.me' }); r.fulfill({ contentType: 'text/html', body: '<p>WhatsApp</p>' }); });

await page.goto(base + '/sewa-mobil-bogor', { waitUntil: 'networkidle' });
await page.mouse.wheel(0, 200);
await page.waitForTimeout(2500);
await page.click('a[data-cta=nav-wa]');
await page.waitForTimeout(7000);

await page.goto(base + '/sewa-mobil-bogor', { waitUntil: 'networkidle' });
await page.fill('input[name=name]', 'Tes Analytics');
await page.fill('input[name=pickup]', 'Tes (abaikan)');
await page.click('button[data-cta=booking]');
await page.waitForTimeout(7000);
await browser.close();

console.table(hits);
const got = (en) => hits.some((h) => h.en === en);
const ok = got('page_view') && got('whatsapp_click') && got('generate_lead');
console.log(ok ? 'OK: page_view, whatsapp_click and generate_lead all reached GA4.' : 'MISSING: not every event reached GA4.');
process.exit(ok ? 0 : 1);
