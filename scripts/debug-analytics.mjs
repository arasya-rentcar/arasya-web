/** Diagnostics for verify-analytics: what the page queues and what leaves the browser. */
import { chromium } from 'playwright';
const base = process.argv[2] || 'https://arasya-web.vercel.app';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
context.on('request', (r) => { if (/google/.test(r.url())) console.log('REQ', r.method(), r.resourceType(), r.url().slice(0, 160), (r.postData() || '').slice(0, 200).replace(/\n/g, ' | ')); });
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text().slice(0, 200)));
await page.goto(base + '/sewa-mobil-bogor', { waitUntil: 'networkidle' });
await page.mouse.wheel(0, 200);
await page.waitForTimeout(3000);
console.log('STATE', JSON.stringify(await page.evaluate(() => ({ ga4: window.arasyaGa4, gtag: typeof window.gtag, track: typeof window.arasyaTrack, load: typeof window.arasyaLoadTags, dl: (window.dataLayer || []).length, gtagLoaded: !!window.google_tag_manager }))));
// Keep the page alive: block the navigation, then fire the event directly.
await page.evaluate(() => window.arasyaTrack('whatsapp_click', { cta: 'debug' }, () => console.log('callback fired')));
await page.waitForTimeout(6000);
console.log('DATALAYER', JSON.stringify(await page.evaluate(() => (window.dataLayer || []).map((x) => (x && x.length !== undefined && typeof x !== 'string') ? Array.from(x).map((v) => typeof v === 'function' ? 'fn' : v) : x))).slice(0, 1500));
await browser.close();
