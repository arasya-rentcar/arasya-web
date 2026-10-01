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
// A regular desktop Chrome user agent: GA4 drops hits from "HeadlessChrome"
// as bot traffic, so without it the test would never show in Realtime.
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'id-ID', timezoneId: 'Asia/Jakarta', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
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
const statuses = [];
// Booking-form lead sent to the admin dashboard API (sendBeacon).
const leads = [];
context.on('request', (r) => { if (r.url().includes('/api/v1/public/leads')) leads.push({ url: r.url(), body: r.postData() || '' }); });
context.on('response', (r) => { if (r.url().includes('/api/v1/public/leads')) leads.push({ status: r.status() }); });
context.on('response', (r) => { if (/google-analytics\.com\/g\/collect/.test(r.url())) statuses.push(r.status()); });
// Stand in for WhatsApp (it opens in a new tab).
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
console.log('Google responses:', statuses.join(', ') || 'none');
for (const l of leads) console.log('Lead to dashboard API:', l.status ? `response ${l.status}` : `${l.url} ${JSON.parse(l.body || '{}').lead_code || ''}`);
if (!leads.length) console.log('Lead to dashboard API: none sent');
const got = (en) => hits.some((h) => h.en === en);
const ok = got('page_view') && got('whatsapp_click') && got('generate_lead');
console.log(ok ? 'OK: page_view, whatsapp_click and generate_lead all reached GA4.' : 'MISSING: not every event reached GA4.');
process.exit(ok ? 0 : 1);
