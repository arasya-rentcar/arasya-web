/**
 * Browser test of the booking form's place suggestions and map picker against
 * the built site, with a fake Google Maps (no request ever reaches Google,
 * Google Analytics or the leads API: beacons, window.open and those hosts are
 * stubbed).
 *
 *   PUBLIC_GOOGLE_MAPS_KEY=dummy npx astro build && node scripts/test-maps-picker.mjs
 *   npx astro build && node scripts/test-maps-picker.mjs --no-key
 *
 * Needs Playwright (`npm install --no-save playwright@1 && npx playwright
 * install chromium`, as in verify-analytics.yml). PLAYWRIGHT_MODULE may point
 * at another copy of playwright, CHROMIUM_PATH at a browser binary, SHOTS_DIR
 * at a folder for screenshots. Serves dist/ with `astro preview` on PORT
 * (default 4329) and stops it afterwards.
 */
import { spawn, execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, isAbsolute } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const noKey = process.argv.includes('--no-key');
const port = Number(process.env.PORT || 4329);
const base = `http://localhost:${port}`;
const shots = process.env.SHOTS_DIR || join(tmpdir(), 'arasya-maps-picker');
mkdirSync(shots, { recursive: true });
const pwSpec = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium, devices } = await import(isAbsolute(pwSpec) ? pathToFileURL(pwSpec).href : pwSpec);

// ---------------------------------------------------------------- results
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ ok: !!ok, name });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  -> ${detail}` : ''}`);
};

// ---------------------------------------------------------------- fake Google Maps
const fakeMaps = ({ authFail = false } = {}) => `(() => {
  const P = [
    { id: 'place-stasiun-bogor', main: 'Stasiun Bogor', sec: 'Jl. Nyi Raja Permas No.1, Cibogor, Kota Bogor', lat: -6.5953451, lng: 106.7905432 },
    { id: 'place-hotel-salak', main: 'Hotel Salak The Heritage', sec: 'Jl. Ir. H. Juanda No.8, Paledang, Kota Bogor', lat: -6.5944, lng: 106.7956 },
    { id: 'place-bandara-cgk', main: 'Bandara Soekarno-Hatta', sec: 'Tangerang, Banten', lat: -6.1256, lng: 106.6559 },
    { id: 'place-stasiun-gambir', main: 'Stasiun Gambir', sec: 'Gambir, Jakarta Pusat', lat: -6.1766, lng: 106.8306 },
    { id: 'place-stasiun-bandung', main: 'Stasiun Bandung', sec: 'Kebon Jeruk, Kota Bandung', lat: -6.9142, lng: 107.6023 },
    { id: 'place-stasiun-depok', main: 'Stasiun Depok', sec: 'Pancoran Mas, Kota Depok', lat: -6.3912, lng: 106.8172 },
    { id: 'place-stasiun-bekasi', main: 'Stasiun Bekasi', sec: 'Kota Bekasi', lat: -6.2362, lng: 106.9994 },
    { id: 'place-stasiun-jatinegara', main: 'Stasiun Jatinegara', sec: 'Jatinegara, Jakarta Timur', lat: -6.215, lng: 106.8703 },
  ];
  const gm = window.__gm = { requests: [], fields: [], geocodes: 0, tokens: 0, maps: [] };
  class AutocompleteSessionToken { constructor() { this.n = ++gm.tokens; } }
  const text = (t) => ({ text: t, matches: [], toString() { return t; } });
  const AutocompleteSuggestion = {
    async fetchAutocompleteSuggestions(req) {
      gm.requests.push({ input: req.input, token: req.sessionToken && req.sessionToken.n, language: req.language, region: req.region, bias: req.locationBias, restriction: req.locationRestriction || null, regions: req.includedRegionCodes || null });
      const q = req.input.toLowerCase();
      const hits = P.filter((p) => (p.main + ' ' + p.sec).toLowerCase().includes(q));
      return { suggestions: hits.map((p) => ({ placePrediction: {
        placeId: p.id, text: text(p.main + ', ' + p.sec), mainText: text(p.main), secondaryText: text(p.sec), types: [],
        toPlace() {
          const place = { id: p.id, async fetchFields(o) {
            gm.fields.push(o.fields);
            Object.assign(place, { displayName: p.main, formattedAddress: p.sec, location: { lat: () => p.lat, lng: () => p.lng } });
            return { place };
          } };
          return place;
        },
      } })) };
    },
  };
  class Map {
    constructor(el, opts) {
      this.el = el; this.opts = opts; this.c = { ...opts.center }; this.z = opts.zoom; this.l = {};
      el.setAttribute('data-fake-map', '1'); el.style.background = 'repeating-linear-gradient(45deg,#e6eef6 0 12px,#f4f8fb 12px 24px)';
      gm.maps.push(this); gm.map = this; this.idleSoon();
    }
    addListener(n, f) { (this.l[n] ||= []).push(f); return { remove() {} }; }
    fire(n) { (this.l[n] || []).forEach((f) => f()); }
    idleSoon() { clearTimeout(this.t); this.t = setTimeout(() => this.fire('idle'), 30); }
    getCenter() { const c = this.c; return { lat: () => c.lat, lng: () => c.lng }; }
    setCenter(c) { this.c = typeof c.lat === 'function' ? { lat: c.lat(), lng: c.lng() } : { lat: c.lat, lng: c.lng }; this.idleSoon(); }
    setZoom(z) { this.z = z; this.idleSoon(); }
    // test helper: a finger drag that ends at lat/lng
    drag(lat, lng) { this.fire('dragstart'); this.c = { lat, lng }; this.idleSoon(); }
  }
  class Geocoder {
    async geocode(req) {
      gm.geocodes++; gm.lastGeocode = req;
      return { results: [{ formatted_address: 'Jl. Pajajaran No.' + Math.abs(Math.round(req.location.lng * 1000) % 100) + ', Kota Bogor', place_id: 'geocode-id' }] };
    }
  }
  google.maps.importLibrary = async (n) => ({ places: { AutocompleteSuggestion, AutocompleteSessionToken }, maps: { Map }, geocoding: { Geocoder }, core: {} })[n];
  google.maps.__ib__();
  ${authFail ? 'setTimeout(() => window.gm_authFailure && window.gm_authFailure(), 0);' : ''}
})();`;

// Stubs: WhatsApp tab, lead beacon (no network at all).
const initStubs = () => {
  window.__opened = [];
  window.open = (u) => { window.__opened.push(String(u)); return { closed: false, opener: null }; };
  window.__beacons = [];
  Object.defineProperty(Navigator.prototype, 'sendBeacon', {
    configurable: true,
    value(url, data) { Promise.resolve(data && data.text ? data.text() : String(data)).then((t) => window.__beacons.push({ url: String(url), body: t })); return true; },
  });
};

// ---------------------------------------------------------------- server
const server = spawn(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'preview', '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));
const stopServer = () => {
  try {
    if (process.platform === 'win32') execSync(`taskkill /PID ${server.pid} /T /F`, { stdio: 'ignore' });
    else server.kill('SIGTERM');
  } catch {}
};
for (let i = 0; ; i++) {
  try { if ((await fetch(base + '/')).ok) break; } catch {}
  if (i > 60) { console.error('preview did not start:\n' + serverLog); stopServer(); process.exit(1); }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

/** New context with stubs and routes; mapsMode: 'fake' | 'fail' | 'auth'. */
async function open(path, { mapsMode = 'fake', device, geo } = {}) {
  const context = await browser.newContext({
    ...(device || { viewport: { width: 1280, height: 900 } }),
    locale: path.startsWith('/en') ? 'en-GB' : 'id-ID',
    timezoneId: 'Asia/Jakarta',
    ...(geo ? { geolocation: geo, permissions: ['geolocation'] } : {}),
  });
  const mapsRequests = [];
  await context.addInitScript(initStubs);
  await context.route(/google-analytics\.com|googletagmanager\.com|doubleclick\.net/, (r) => r.abort());
  await context.route(/\/api\/v1\/public\/leads/, (r) => r.fulfill({ status: 204, body: '' }));
  await context.route(/maps\.googleapis\.com|maps\.gstatic\.com/, (r) => {
    mapsRequests.push(r.request().url());
    if (mapsMode === 'fail') return r.abort();
    return r.fulfill({ contentType: 'text/javascript', body: fakeMaps({ authFail: mapsMode === 'auth' }) });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + path, { waitUntil: 'load' });
  return { context, page, mapsRequests, errors };
}

const pickup = 'form[data-booking] input[name=pickup]';
const dest = 'form[data-booking] input[name=dest]';
const listOf = (input) => `#${input}-list`;
const gm = (page) => page.evaluate(() => window.__gm);
const lastBeacon = async (page) => {
  await page.waitForTimeout(150);
  const b = await page.evaluate(() => window.__beacons);
  return b.length ? JSON.parse(b[b.length - 1].body) : null;
};
const typeSlow = (page, sel, text) => page.locator(sel).pressSequentially(text, { delay: 40 });

try {
  if (noKey) {
    // ------------------------------------------------------------ key unset
    const { page, mapsRequests, context, errors } = await open('/sewa-mobil-bogor');
    check('no key: no data-maps on the form', !(await page.locator('form[data-booking][data-maps]').count()));
    check('no key: no map button, chip or dialog', !(await page.locator('.place-map, .place-chip, dialog.mp').count()));
    check('no key: pick-up keeps street-address autofill', (await page.getAttribute(pickup, 'autocomplete')) === 'street-address');
    await page.fill('input[name=name]', 'Tes');
    await page.click(pickup);
    await typeSlow(page, pickup, 'Stasiun Bogor');
    await page.waitForTimeout(700);
    check('no key: no Google request after typing', mapsRequests.length === 0, mapsRequests.join());
    await page.click('button[data-cta=booking]');
    await page.waitForTimeout(200);
    const opened = await page.evaluate(() => window.__opened);
    const body = await lastBeacon(page);
    check('no key: WhatsApp opens with the typed text', opened.length === 1 && decodeURIComponent(opened[0]).includes('Jemput di: Stasiun Bogor\n'), opened[0]);
    check('no key: lead beacon sent without coordinates', body && body.pickup_location === 'Stasiun Bogor' && !('pickup_lat' in body), JSON.stringify(body));
    check('no key: no page errors', !errors.length, errors.join(' | '));
    await context.close();
  } else {
    // ------------------------------------------------------------ suggestions, desktop, id
    {
      const { page, mapsRequests, context, errors } = await open('/sewa-mobil-bogor');
      const id = await page.getAttribute(pickup, 'id');
      const destId = await page.getAttribute(dest, 'id');
      await page.waitForTimeout(800);
      check('lazy: no Google request on page load', mapsRequests.length === 0, mapsRequests.join());
      check('map buttons visible for pick-up and destination', (await page.locator('form[data-booking] .place-map:visible').count()) === 2);
      await page.fill('input[name=name]', 'Tes Peta');
      await page.click(pickup);
      await typeSlow(page, pickup, 'St');
      await page.waitForTimeout(600);
      check('lazy: Google script loads on first focus', mapsRequests.length === 1, String(mapsRequests.length));
      const u = new URL(mapsRequests[0] || base);
      check('loader: key, region=ID, callback, places library', !!u.searchParams.get('key') && u.searchParams.get('region') === 'ID' && u.searchParams.get('callback') === 'google.maps.__ib__' && u.searchParams.get('libraries') === 'places', u.search);
      check('loader: language follows page (id)', u.searchParams.get('language') === 'id', u.search);
      check('no suggestions before 3 characters', (await gm(page)).requests.length === 0 && !(await page.locator(listOf(id)).isVisible()));
      await typeSlow(page, pickup, 'a');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      let g = await gm(page);
      check('one request after typing pauses (debounce)', g.requests.length === 1, JSON.stringify(g.requests.map((r) => r.input)));
      const req = g.requests[0];
      check('request: session token, language id, Bogor bias, no restriction', req.token && req.language === 'id' && req.bias?.center?.lat === -6.5971 && req.bias?.radius === 25000 && !req.restriction && !req.regions, JSON.stringify(req));
      const n = await page.locator(`${listOf(id)} li`).count();
      check('at most 5 suggestions', n === 5, String(n));
      check('combobox aria-expanded=true', (await page.getAttribute(pickup, 'aria-expanded')) === 'true');
      check('live region announces the count', /5 saran/.test(await page.locator(`#${id} ~ [data-place-live]`).textContent()));
      check('"Google Maps" attribution under the list', await page.locator(`${listOf(id)} + .place-attr`).isVisible());
      await page.screenshot({ path: join(shots, 'desktop-suggestions.png') });
      // keyboard select
      await page.keyboard.press('ArrowDown');
      check('arrow down highlights first option', (await page.getAttribute(pickup, 'aria-activedescendant')) === `${id}-list-0`);
      await page.keyboard.press('Enter');
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      check('Enter selects (field = name + address)', (await page.inputValue(pickup)) === 'Stasiun Bogor, Jl. Nyi Raja Permas No.1, Cibogor, Kota Bogor', await page.inputValue(pickup));
      check('Enter on a suggestion does not submit', (await page.evaluate(() => window.__opened.length)) === 0);
      check('chip "Titik dipilih" shown', /Titik dipilih/.test(await page.locator('[data-place-chip=pickup]').textContent()));
      g = await gm(page);
      check('Place details: only displayName, formattedAddress, location', JSON.stringify(g.fields[0]) === JSON.stringify(['displayName', 'formattedAddress', 'location']), JSON.stringify(g.fields));
      // retyping clears the point
      await page.press(pickup, 'End');
      await typeSlow(page, pickup, ' 2');
      check('retyping clears the point (chip hidden)', await page.locator('[data-place-chip=pickup]').isHidden());
      check('retyping clears the point (no point on input)', await page.$eval(pickup, (el) => !el.arasyaPoint));
      // Esc closes the list
      await page.fill(pickup, '');
      await typeSlow(page, pickup, 'Hotel');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      await page.keyboard.press('Escape');
      check('Esc closes the list', !(await page.locator(listOf(id)).isVisible()) && (await page.getAttribute(pickup, 'aria-expanded')) === 'false');
      // click select
      await typeSlow(page, pickup, ' ');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      await page.click(`${listOf(id)} li >> nth=0`);
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      check('click selects a suggestion', (await page.inputValue(pickup)).startsWith('Hotel Salak The Heritage, Jl. Ir. H. Juanda No.8'));
      g = await gm(page);
      check('new session token after a selection', g.requests[g.requests.length - 1].token !== req.token, JSON.stringify(g.requests.map((r) => r.token)));
      // destination
      await page.click(dest);
      await typeSlow(page, dest, 'Bandara');
      await page.waitForSelector(`${listOf(destId)} li`, { state: 'visible' });
      await page.click(`${listOf(destId)} li >> nth=0`);
      await page.waitForSelector(`[data-place-chip=dest]:not([hidden])`);
      check('destination selects too', (await page.inputValue(dest)) === 'Bandara Soekarno-Hatta, Tangerang, Banten');
      // submit
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const opened = await page.evaluate(() => window.__opened);
      const text = opened[0] ? new URL(opened[0]).searchParams.get('text') : '';
      check('WhatsApp pick-up line has the map link', text.includes('Jemput di: Hotel Salak The Heritage, Jl. Ir. H. Juanda No.8, Paledang, Kota Bogor (https://www.google.com/maps/search/?api=1&query=-6.5944%2C106.7956&query_place_id=place-hotel-salak)'), text);
      check('WhatsApp destination line has the map link', text.includes('Tujuan: Bandara Soekarno-Hatta, Tangerang, Banten (https://www.google.com/maps/search/?api=1&query=-6.1256%2C106.6559&query_place_id=place-bandara-cgk)'), text);
      const body = await lastBeacon(page);
      check('beacon: pickup point fields (numbers)', body && body.pickup_lat === -6.5944 && body.pickup_lng === 106.7956 && body.pickup_place_id === 'place-hotel-salak' && body.pickup_place_name === 'Hotel Salak The Heritage', JSON.stringify(body));
      check('beacon: destination point fields', body && body.destination_lat === -6.1256 && body.destination_lng === 106.6559 && body.destination_place_id === 'place-bandara-cgk' && body.destination_place_name === 'Bandara Soekarno-Hatta', JSON.stringify(body));
      check('beacon: text fields unchanged', body && body.pickup_location.startsWith('Hotel Salak') && body.destination.startsWith('Bandara') && body.lead_code?.startsWith('ARS-'));
      // privacy: nothing location-ish in storage or dataLayer
      const store = await page.evaluate(() => JSON.stringify({ s: Object.entries(sessionStorage), l: Object.entries(localStorage) }));
      check('no coordinates or place names in session/localStorage', !/-6\.59|106\.79|Hotel Salak|Bandara/.test(store), store);
      const dl = await page.evaluate(() => JSON.stringify(window.dataLayer || []));
      check('no coordinates or place names in dataLayer', !/-6\.59|106\.79|Hotel Salak|Bandara|place_/.test(dl), dl);
      // resend identical = same code, no second beacon; a different point = new lead
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const beacons1 = await page.evaluate(() => window.__beacons.length);
      const codes = (await page.evaluate(() => window.__opened)).map((u) => /(ARS-[A-Z0-9]{5})/.exec(decodeURIComponent(u))?.[1]);
      check('identical resend reuses the code, no second beacon', beacons1 === 1 && codes[0] === codes[1], JSON.stringify({ beacons1, codes }));
      await page.click(dest);
      await page.fill(dest, '');
      await typeSlow(page, dest, 'Gambir');
      await page.waitForSelector(`${listOf(destId)} li`, { state: 'visible' });
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForSelector(`[data-place-chip=dest]:not([hidden])`);
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const beacons2 = await page.evaluate(() => window.__beacons.length);
      check('a different chosen point counts as a new request', beacons2 === 2);
      check('no page errors (suggestions)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ free text + analytics flow (verify-analytics.yml)
    {
      const { page, context } = await open('/sewa-mobil-bogor');
      await page.fill('input[name=name]', 'Tes Analytics');
      await page.fill(pickup, 'Tes (abaikan)');
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(400);
      const opened = await page.evaluate(() => window.__opened);
      const body = await lastBeacon(page);
      const dl = await page.evaluate(() => (window.dataLayer || []).filter((e) => e.event === 'generate_lead').length);
      check('free text submits (verify-analytics flow)', opened.length === 1 && body?.pickup_location === 'Tes (abaikan)' && !('pickup_lat' in body) && !opened[0].includes('google.com%2Fmaps'), JSON.stringify(body));
      check('generate_lead still pushed', dl === 1);
      await context.close();
    }
    // ------------------------------------------------------------ loader fails
    {
      const { page, context, errors } = await open('/sewa-mobil-bogor', { mapsMode: 'fail' });
      await page.fill('input[name=name]', 'Tes');
      await page.click(pickup);
      await typeSlow(page, pickup, 'Stasiun Bogor');
      await page.waitForTimeout(800);
      check('loader failure: map buttons hidden', (await page.locator('form[data-booking] .place-map:visible').count()) === 0);
      check('loader failure: no suggestion list', (await page.locator('form[data-booking] .place-pop:visible').count()) === 0);
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const body = await lastBeacon(page);
      check('loader failure: form still sends (WhatsApp + lead)', (await page.evaluate(() => window.__opened.length)) === 1 && body?.pickup_location === 'Stasiun Bogor');
      check('loader failure: no page errors', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ key rejected (gm_authFailure)
    {
      const { page, context } = await open('/sewa-mobil-bogor', { mapsMode: 'auth' });
      await page.click(pickup);
      await page.waitForTimeout(500);
      check('rejected key: map buttons hidden', (await page.locator('form[data-booking] .place-map:visible').count()) === 0);
      await context.close();
    }
    // ------------------------------------------------------------ map dialog, desktop
    {
      const { page, context, errors } = await open('/sewa-mobil-bogor');
      const id = await page.getAttribute(pickup, 'id');
      await page.click(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] [data-fake-map]');
      await page.waitForTimeout(200);
      let g = await gm(page);
      const map = g.maps[0];
      check('dialog opens with a map at the page city', map && map.c.lat === -6.5971 && map.c.lng === 106.806 && map.z === 12, JSON.stringify(map && map.c));
      check('map: greedy gestures', map?.opts?.gestureHandling === 'greedy');
      check('reverse geocode once when the map stops', g.geocodes === 1, String(g.geocodes));
      check('address of the point shown', /Jl\. Pajajaran/.test(await page.locator('dialog.mp [data-mp-addr]').textContent()));
      check('"Pakai lokasi saya" offered for pick-up', await page.locator('dialog.mp [data-mp-mine]').isVisible());
      check('search box focused (desktop)', await page.$eval('dialog.mp [data-mp-search]', (el) => document.activeElement === el));
      await page.evaluate(() => window.__gm.map.drag(-6.60123, 106.80456));
      await page.waitForTimeout(200);
      g = await gm(page);
      check('drag -> one more reverse geocode', g.geocodes === 2, String(g.geocodes));
      await page.screenshot({ path: join(shots, 'desktop-map-dialog.png') });
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(100);
      check('dialog closes after "Pakai titik ini"', !(await page.locator('dialog.mp[open]').count()));
      const point = await page.$eval(pickup, (el) => el.arasyaPoint);
      check('map point set on pick-up (no place id)', point && point.lat === -6.60123 && point.lng === 106.80456 && !point.placeId && /Pajajaran/.test(point.name), JSON.stringify(point));
      check('field shows the found address', /Jl\. Pajajaran/.test(await page.inputValue(pickup)));
      check('focus returns to the map button', await page.evaluate(() => document.activeElement?.matches('[data-place-map][data-kind=pickup]')));
      // reopen from chip, search inside the dialog
      await page.click('[data-place-chip=pickup] [data-place-edit]');
      await page.waitForSelector('dialog.mp[open]');
      await page.waitForTimeout(150);
      g = await gm(page);
      check('reopen starts at the chosen point', g.map.c.lat === -6.60123 && g.map.z === 17, JSON.stringify(g.map.c));
      await typeSlow(page, 'dialog.mp [data-mp-search]', 'Stasiun Bo');
      await page.waitForSelector('dialog.mp .place-list li', { state: 'visible' });
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      g = await gm(page);
      check('search moves the map to the place', Math.abs(g.map.c.lat - -6.595345) < 1e-6, JSON.stringify(g.map.c));
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(100);
      const p2 = await page.$eval(pickup, (el) => el.arasyaPoint);
      check('searched place used (with place id)', p2?.placeId === 'place-stasiun-bogor' && (await page.inputValue(pickup)).startsWith('Stasiun Bogor, '), JSON.stringify(p2));
      // destination: no "my location"; Esc closes
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open]');
      check('no "Pakai lokasi saya" for destination', await page.locator('dialog.mp [data-mp-mine]').isHidden());
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      check('Esc closes the dialog', !(await page.locator('dialog.mp[open]').count()));
      check('no page errors (map dialog)', !errors.length, errors.join(' | '));
      void id;
      await context.close();
    }
    // ------------------------------------------------------------ phone: full-screen sheet, my location
    {
      const device = devices['Pixel 7'];
      const { page, context, errors } = await open('/sewa-mobil-bogor', { device, geo: { latitude: -6.5812, longitude: 106.7998 } });
      await page.tap(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] [data-fake-map]');
      await page.waitForTimeout(200);
      const box = await page.locator('dialog.mp').boundingBox();
      const vp = page.viewportSize();
      check('phone: map opens full screen', box && Math.round(box.width) === vp.width && Math.round(box.height) === vp.height, JSON.stringify({ box, vp }));
      check('phone: search box not auto-focused (keyboard stays down)', await page.$eval('dialog.mp [data-mp-search]', (el) => document.activeElement !== el));
      await page.screenshot({ path: join(shots, 'phone-map-sheet.png') });
      await page.tap('dialog.mp [data-mp-mine]');
      await page.waitForTimeout(300);
      const g = await gm(page);
      check('phone: "Pakai lokasi saya" centres on the device location', g.map.c.lat === -6.5812 && g.map.c.lng === 106.7998, JSON.stringify(g.map.c));
      await page.tap('dialog.mp [data-mp-use]');
      await page.waitForTimeout(150);
      const point = await page.$eval(pickup, (el) => el.arasyaPoint);
      check('phone: my location becomes the pick-up point', point?.lat === -6.5812 && point?.lng === 106.7998, JSON.stringify(point));
      // suggestions by tap
      await page.tap(dest);
      await typeSlow(page, dest, 'Bandara');
      await page.waitForSelector('form[data-booking] [data-place=dest] .place-list li', { state: 'visible' });
      await page.screenshot({ path: join(shots, 'phone-suggestions.png') });
      await page.tap('form[data-booking] [data-place=dest] .place-list li >> nth=0');
      await page.waitForSelector(`[data-place-chip=dest]:not([hidden])`);
      check('phone: tap selects a suggestion', (await page.inputValue(dest)).startsWith('Bandara Soekarno-Hatta'));
      check('no page errors (phone)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ phone: location denied
    {
      const { page, context } = await open('/sewa-mobil-bogor', { device: devices['Pixel 7'] });
      await page.tap(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] [data-fake-map]');
      await page.tap('dialog.mp [data-mp-mine]');
      await page.waitForSelector('dialog.mp [data-mp-err]:not([hidden])', { timeout: 20000 }).catch(() => {});
      const msg = await page.locator('dialog.mp [data-mp-err]').textContent();
      check('location denied: friendly message, map still usable', /Izin lokasi|Lokasi Anda/.test(msg) && (await page.locator('dialog.mp [data-mp-use]').isVisible()), msg);
      await context.close();
    }
    // ------------------------------------------------------------ English home page
    {
      const { page, context, mapsRequests } = await open('/en');
      await page.fill('input[name=name]', 'Test');
      await page.click(pickup);
      await typeSlow(page, pickup, 'Gambir');
      await page.waitForSelector('form[data-booking] [data-place=pickup] .place-list li', { state: 'visible' });
      const g = await gm(page);
      check('en: loader language=en', new URL(mapsRequests[0]).searchParams.get('language') === 'en');
      check('en: request language en, Jabodetabek bias', g.requests[0].language === 'en' && g.requests[0].bias.center.lat === -6.35 && g.requests[0].bias.radius === 50000, JSON.stringify(g.requests[0]));
      check('en: live region in English', /suggestions/.test(await page.locator('form[data-booking] [data-place=pickup] [data-place-live]').textContent()));
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      check('en: chip "Point set"', /Point set/.test(await page.locator('[data-place-chip=pickup]').textContent()));
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const text = new URL((await page.evaluate(() => window.__opened))[0]).searchParams.get('text');
      check('en: WhatsApp "Pick-up:" line with map link', text.includes('Pick-up: Stasiun Gambir, Gambir, Jakarta Pusat (https://www.google.com/maps/search/?api=1&query=-6.1766%2C106.8306&query_place_id=place-stasiun-gambir)'), text);
      await context.close();
    }
  }
} catch (e) {
  check('test run finished without exceptions', false, e?.stack || String(e));
} finally {
  await browser.close();
  stopServer();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed${noKey ? ' (no key)' : ''}. Screenshots: ${noKey ? '-' : shots}`);
process.exit(failed.length ? 1 : 0);
