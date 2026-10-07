/**
 * Browser test of the booking form's place suggestions and map picker against
 * the built site, per map provider. No request ever reaches a real map
 * service, Google Analytics or the leads API: Google Maps is a fake script,
 * Photon and the OSM tile server are answered by page.route, beacons and
 * window.open are stubbed.
 *
 *   npx astro build && node scripts/test-maps-picker.mjs --provider=osm      (.env.production: osm)
 *   PUBLIC_MAPS_PROVIDER=google PUBLIC_GOOGLE_MAPS_KEY=dummy npx astro build && node scripts/test-maps-picker.mjs --provider=google
 *   PUBLIC_MAPS_PROVIDER=off npx astro build && node scripts/test-maps-picker.mjs --provider=none
 *
 * (--no-key is the old name of --provider=none.) The script first checks that
 * dist/ was built for the provider asked for. Needs Playwright (`npm install
 * --no-save playwright@1 && npx playwright install chromium`, as in
 * verify-analytics.yml). PLAYWRIGHT_MODULE may point at another copy of
 * playwright, CHROMIUM_PATH at a browser binary, SHOTS_DIR at a folder for
 * screenshots. Serves dist/ with `astro preview` on PORT (default 4329) and
 * stops it afterwards.
 */
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, isAbsolute } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const arg = process.argv.find((a) => a.startsWith('--provider='));
const mode = process.argv.includes('--no-key') ? 'none' : arg ? arg.split('=')[1] : 'osm';
if (!['osm', 'google', 'none'].includes(mode)) throw new Error('--provider must be osm, google or none');
const port = Number(process.env.PORT || 4329);
const base = `http://localhost:${port}`;
const shots = join(process.env.SHOTS_DIR || join(tmpdir(), 'arasya-maps-picker'), mode);
mkdirSync(shots, { recursive: true });
const pwSpec = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium, devices } = await import(isAbsolute(pwSpec) ? pathToFileURL(pwSpec).href : pwSpec);

// ---------------------------------------------------------------- results
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ ok: !!ok, name });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  -> ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- the build matches the mode
{
  const chunks = readdirSync(join(root, 'dist/_astro'));
  const has = (name) => chunks.some((f) => f.startsWith(name + '.'));
  const html = readFileSync(join(root, 'dist/sewa-mobil-bogor.html'), 'utf8');
  const provider = /data-maps="\{&quot;provider&quot;:&quot;(\w+)&quot;/.exec(html)?.[1] || 'none';
  check(`build: dist/ built for provider ${mode}`, provider === mode, `dist has ${provider}`);
  check(`build: only the ${mode} code is bundled`, mode === 'osm' ? has('osm') && has('leaflet-src') && !has('google')
    : mode === 'google' ? has('google') && !has('osm') && !has('leaflet-src')
    : !has('osm') && !has('google') && !has('leaflet-src') && !has('mapsPicker'), chunks.filter((f) => /^(osm|google|leaflet|mapsPicker)/.test(f)).join());
  if (provider !== mode) process.exit(1);
}

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

// ---------------------------------------------------------------- fake Photon + OSM tiles (answered in page.route)
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const ID = { countrycode: 'ID', country: 'Indonesia' };
const OSM_PLACES = [
  { name: 'Stasiun Bogor', street: 'Jalan Nyi Raja Permas', district: 'Bogor Tengah', city: 'Kota Bogor', state: 'Jawa Barat', lat: -6.5953451, lon: 106.7905432 },
  // Photon sometimes returns the same place twice (e.g. node + way): shown once.
  { name: 'Stasiun Bogor', street: 'Jalan Nyi Raja Permas', district: 'Bogor Tengah', city: 'Kota Bogor', state: 'Jawa Barat', lat: -6.59536, lon: 106.79056 },
  { name: 'Hotel Salak The Heritage', street: 'Jalan Ir. H. Juanda', housenumber: '8', district: 'Paledang', city: 'Kota Bogor', state: 'Jawa Barat', lat: -6.5944, lon: 106.7956 },
  { name: 'Bandara Internasional Soekarno-Hatta', city: 'Kota Tangerang', state: 'Banten', lat: -6.1256, lon: 106.6559 },
  { name: 'Stasiun Gambir', street: 'Jalan Medan Merdeka Timur', district: 'Gambir', city: 'Jakarta Pusat', state: 'Daerah Khusus Ibukota Jakarta', lat: -6.1766, lon: 106.8306 },
  { name: 'Stasiun Bandung', district: 'Kebon Jeruk', city: 'Kota Bandung', state: 'Jawa Barat', lat: -6.9142, lon: 107.6023 },
  { name: 'Stasiun Depok', district: 'Pancoran Mas', city: 'Kota Depok', state: 'Jawa Barat', lat: -6.3912, lon: 106.8172 },
  { name: 'Stasiun Bekasi', city: 'Kota Bekasi', state: 'Jawa Barat', lat: -6.2362, lon: 106.9994 },
  { name: 'Stasiun Jatinegara', district: 'Jatinegara', city: 'Jakarta Timur', state: 'Daerah Khusus Ibukota Jakarta', lat: -6.215, lon: 106.8703 },
];
const feature = ({ lat, lon, ...props }, extra = ID) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties: { osm_type: 'N', osm_id: 1, osm_key: 'place', osm_value: 'yes', type: 'house', ...extra, ...props } });
const reverseHouse = (lon) => String(Math.abs(Math.round(lon * 1000) % 100));

/**
 * Photon/tile fake for one browser context. osm.status: queue of HTTP statuses
 * for the next Photon answers (then 200); osm.fail: status for every answer;
 * osm.delay(q): ms before answering a search; osm.hang: reverse lookups never answer.
 */
function osmFake() {
  const osm = { search: [], reverse: [], tiles: [], aborted: [], status: [], fail: 0, delay: () => 0, hang: false };
  const photon = async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const referer = (await req.allHeaders()).referer || '';
    const p = Object.fromEntries(u.searchParams);
    const status = osm.status.shift() || osm.fail || 200;
    const headers = { 'access-control-allow-origin': '*' };
    let features;
    if (u.pathname === '/reverse') {
      osm.reverse.push({ ...p, t: Date.now(), referer, status });
      if (osm.hang) return; // never answered
      // The nearest object is a shop: its name must not become the point's address.
      features = [feature({ name: 'Indomaret Pajajaran', street: 'Jalan Pajajaran', housenumber: reverseHouse(Number(p.lon)), district: 'Bogor Timur', city: 'Kota Bogor', state: 'Jawa Barat', lat: Number(p.lat), lon: Number(p.lon) })];
    } else {
      osm.search.push({ ...p, t: Date.now(), referer, status });
      const q = (p.q || '').toLowerCase();
      // Ignores limit on purpose: the page must cap the list itself.
      features = OSM_PLACES.filter((x) => [x.name, x.street, x.district, x.city].join(' ').toLowerCase().includes(q)).map((x) => feature(x));
      const d = osm.delay(p.q);
      if (d) await sleep(d);
    }
    try {
      if (status !== 200) return await route.fulfill({ status, headers, contentType: 'application/json', body: '{"message":"error"}' });
      await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ type: 'FeatureCollection', features }) });
    } catch {} // the page aborted it meanwhile
  };
  const tile = async (route) => {
    const req = route.request();
    osm.tiles.push({ url: req.url(), referer: (await req.allHeaders()).referer || '' });
    await route.fulfill({ status: 200, contentType: 'image/png', body: TINY_PNG });
  };
  return { osm, photon, tile };
}

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

/**
 * New context with stubs and routes. mapsMode (Google): 'fake' | 'fail' | 'auth'.
 * leafletFail (OSM): the map library chunk does not load.
 */
async function open(path, { mapsMode = 'fake', device, geo, leafletFail = false } = {}) {
  const context = await browser.newContext({
    ...(device || { viewport: { width: 1280, height: 900 } }),
    locale: path.startsWith('/en') ? 'en-GB' : 'id-ID',
    timezoneId: 'Asia/Jakarta',
    ...(geo ? { geolocation: geo, permissions: ['geolocation'] } : {}),
  });
  const mapsRequests = [];
  const { osm, photon, tile } = osmFake();
  await context.addInitScript(initStubs);
  await context.route(/google-analytics\.com|googletagmanager\.com|doubleclick\.net/, (r) => r.abort());
  await context.route(/\/api\/v1\/public\/leads/, (r) => r.fulfill({ status: 204, body: '' }));
  await context.route(/maps\.googleapis\.com|maps\.gstatic\.com/, (r) => {
    mapsRequests.push(r.request().url());
    if (mapsMode === 'fail') return r.abort();
    return r.fulfill({ contentType: 'text/javascript', body: fakeMaps({ authFail: mapsMode === 'auth' }) });
  });
  // Anything OSM-related not answered below is refused and recorded (registered
  // first: Playwright tries the most recently registered route first).
  await context.route(/openstreetmap\.org|nominatim|komoot/, (r) => { osm.aborted.push(r.request().url()); r.abort(); });
  await context.route(/^https:\/\/photon\.komoot\.io\//, photon);
  await context.route(/^https:\/\/tile\.openstreetmap\.org\//, tile);
  if (leafletFail) await context.route(/\/_astro\/leaflet[^/]*\.js/, (r) => r.abort());
  const page = await context.newPage();
  const errors = [];
  const chunks = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => { const m = /\/_astro\/([A-Za-z-]+)[^/]*\.js/.exec(r.url()); if (m) chunks.push(m[1]); });
  page.on('requestfailed', (r) => { if (/photon\.komoot\.io/.test(r.url())) osm.aborted.push(r.url()); });
  await page.goto(base + path, { waitUntil: 'load' });
  return { context, page, mapsRequests, errors, osm, chunks };
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
const waitFor = async (fn, ms = 5000) => {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(50)) if (await fn()) return true;
  return false;
};
// OSM: the real Leaflet map, moved like a visitor would (mouse, or one finger via CDP touch events).
const mapCentre = async (page) => {
  const b = await page.locator('dialog.mp [data-mp-canvas]').boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};
const mouseDrag = async (page, dx, dy) => {
  const { x, y } = await mapCentre(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 6 });
  await page.mouse.up();
};
const fingerDrag = async (page, dx, dy) => {
  const { x, y } = await mapCentre(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 8, y: y + (dy * i) / 8 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
};
const tileZooms = (osm, from = 0) => [...new Set(osm.tiles.slice(from).map((t) => Number(/\/(\d+)\/\d+\/\d+\.png$/.exec(t.url)?.[1])))];
const point = (page, sel) => page.$eval(sel, (el) => el.arasyaPoint || null);

try {
  if (mode === 'none') {
    // ------------------------------------------------------------ provider unset/unknown
    const { page, mapsRequests, context, errors, osm, chunks } = await open('/sewa-mobil-bogor');
    check('no provider: no data-maps on the form', !(await page.locator('form[data-booking][data-maps]').count()));
    check('no provider: no map button, chip or dialog', !(await page.locator('.place-map, .place-chip, dialog.mp').count()));
    check('no provider: pick-up keeps street-address autofill', (await page.getAttribute(pickup, 'autocomplete')) === 'street-address');
    await page.fill('input[name=name]', 'Tes');
    await page.click(pickup);
    await typeSlow(page, pickup, 'Stasiun Bogor');
    await page.waitForTimeout(700);
    check('no provider: no Google, Photon or tile request after typing', mapsRequests.length === 0 && !osm.search.length && !osm.tiles.length && !osm.aborted.length, mapsRequests.concat(osm.aborted).join());
    check('no provider: no maps code loaded', !chunks.some((c) => /^(mapsPicker|osm|google|leaflet)/.test(c)), chunks.join());
    await page.click('button[data-cta=booking]');
    await page.waitForTimeout(200);
    const opened = await page.evaluate(() => window.__opened);
    const body = await lastBeacon(page);
    check('no provider: WhatsApp opens with the typed text', opened.length === 1 && decodeURIComponent(opened[0]).includes('Jemput di: Stasiun Bogor\n'), opened[0]);
    check('no provider: lead beacon sent without coordinates', body && body.pickup_location === 'Stasiun Bogor' && !('pickup_lat' in body), JSON.stringify(body));
    // A session from before the fingerprint (full text as the key) still reuses its code.
    const text = new URL(opened[0]).searchParams.get('text').replace(/\n\[Ref: [^\]]*\]$/, '').split('\n');
    text.splice(1, 1);
    await page.evaluate((old) => {
      for (const k of Object.keys(sessionStorage)) if (k.startsWith('arasya-lead:')) sessionStorage.removeItem(k);
      sessionStorage.setItem(old, 'ARS-OLD22');
    }, 'arasya-lead:' + text.join('|'));
    await page.click('button[data-cta=booking]');
    await page.waitForTimeout(200);
    const again = await page.evaluate(() => ({ url: window.__opened[1] || '', beacons: window.__beacons.length, keys: Object.keys(sessionStorage).filter((k) => k.startsWith('arasya-lead:')) }));
    check('no provider: identical resend in a pre-fingerprint session reuses the code', decodeURIComponent(again.url).includes('ARS-OLD22') && again.beacons === 1 && again.keys.length === 1 && !again.keys[0].includes('Stasiun'), JSON.stringify(again));
    check('no provider: no page errors', !errors.length, errors.join(' | '));
    await context.close();
  } else if (mode === 'google') {
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
      // A point without an address (sea): Google rejects with ZERO_RESULTS. Three in a row must not turn the map off.
      await page.evaluate(async () => {
        const { Geocoder } = await google.maps.importLibrary('geocoding');
        Geocoder.prototype.geocode = async () => { throw Object.assign(new Error('GEOCODER_GEOCODE: ZERO_RESULTS'), { code: 'ZERO_RESULTS' }); };
      });
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open]');
      for (const ll of [[-5.9, 106.5], [-5.8, 106.6], [-5.7, 106.7]]) { await page.evaluate(([a, b]) => window.__gm.map.drag(a, b), ll); await page.waitForTimeout(150); }
      check('no address (ZERO_RESULTS) three times: map stays usable', (await page.locator('dialog.mp [data-mp-use]').isVisible()) && /tidak ditemukan/.test(await page.locator('dialog.mp [data-mp-addr]').textContent()), await page.locator('dialog.mp [data-mp-addr]').textContent());
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(150);
      check('no address: the bare point is used, map buttons stay', (await page.inputValue(dest)) === 'Titik di peta (-5.7, 106.7)' && (await page.locator('form[data-booking] .place-map:visible').count()) === 2, await page.inputValue(dest));
      check('no page errors (map dialog)', !errors.length, errors.join(' | '));
      void id;
      await context.close();
    }
    // ------------------------------------------------------------ races
    {
      const { page, context, errors } = await open('/sewa-mobil-bogor');
      const id = await page.getAttribute(pickup, 'id');
      await page.click(pickup);
      await typeSlow(page, pickup, 'Stasiun');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      // Slow suggestions: the lookup for newer text is still in flight when a suggestion is chosen.
      await page.evaluate(async () => {
        const lib = await google.maps.importLibrary('places');
        const orig = lib.AutocompleteSuggestion.fetchAutocompleteSuggestions;
        lib.AutocompleteSuggestion.fetchAutocompleteSuggestions = async (r) => { await new Promise((ok) => setTimeout(ok, 600)); return orig(r); };
      });
      await page.keyboard.type(' B');
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      await page.waitForTimeout(900);
      check('race: a lookup in flight does not reopen the list after a choice', !(await page.locator(listOf(id)).isVisible()));
      // A choice while the debounce is pending: the chosen text is not looked up again.
      await page.fill(pickup, '');
      await typeSlow(page, pickup, 'Hotel');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      const before = (await gm(page)).requests.length;
      await page.keyboard.type(' ');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      const after = (await gm(page)).requests.slice(before).map((r) => r.input);
      check('race: a choice drops the pending debounce', after.length === 0 && !(await page.locator(listOf(id)).isVisible()), JSON.stringify(after));
      // Esc while "Pakai titik ini" waits for the address: nothing is applied.
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open] [data-fake-map]');
      await page.waitForTimeout(200);
      await page.evaluate(async () => {
        const { Geocoder } = await google.maps.importLibrary('geocoding');
        const orig = Geocoder.prototype.geocode;
        Geocoder.prototype.geocode = async function (r) { await new Promise((ok) => setTimeout(ok, 800)); return orig.call(this, r); };
      });
      await page.evaluate(() => window.__gm.map.drag(-6.61, 106.81));
      await page.waitForTimeout(80);
      await page.click('dialog.mp [data-mp-use]');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1200);
      check('race: closing the dialog while the address loads cancels "use"', (await page.inputValue(dest)) === '' && (await page.$eval(dest, (el) => !el.arasyaPoint)), await page.inputValue(dest));
      // A text selection released over the backdrop keeps the dialog open; a backdrop click closes it.
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open]');
      await page.fill('dialog.mp [data-mp-search]', 'Stasiun Bogor');
      const s = await page.locator('dialog.mp [data-mp-search]').boundingBox();
      await page.mouse.move(s.x + s.width - 10, s.y + s.height / 2);
      await page.mouse.down();
      await page.mouse.move(5, s.y + s.height / 2, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(100);
      check('dialog: a drag released on the backdrop does not close it', (await page.locator('dialog.mp[open]').count()) === 1);
      await page.mouse.click(5, 5);
      await page.waitForTimeout(100);
      check('dialog: a backdrop click closes it', !(await page.locator('dialog.mp[open]').count()));
      check('no page errors (races)', !errors.length, errors.join(' | '));
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
    // ------------------------------------------------------------ Google build never talks to OSM services
    {
      const { page, context, osm, chunks } = await open('/sewa-mobil-bogor');
      await page.click(pickup);
      await typeSlow(page, pickup, 'Stasiun');
      await page.waitForTimeout(500);
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open] [data-fake-map]');
      await page.waitForTimeout(300);
      check('google: no Photon, Nominatim or OSM tile request, no Leaflet', !osm.search.length && !osm.reverse.length && !osm.tiles.length && !osm.aborted.length && !chunks.some((c) => /^(osm|leaflet)/.test(c)), JSON.stringify({ osm, chunks }));
      await context.close();
    }
  } else {
    // ------------------------------------------------------------ OSM: suggestions, desktop, id
    {
      const { page, mapsRequests, context, errors, osm, chunks } = await open('/sewa-mobil-bogor');
      const id = await page.getAttribute(pickup, 'id');
      const destId = await page.getAttribute(dest, 'id');
      await page.waitForTimeout(800);
      check('osm lazy: nothing on page load (no Photon, tiles or maps code)', !osm.search.length && !osm.tiles.length && !chunks.some((c) => /^(mapsPicker|osm|leaflet|google)/.test(c)), chunks.join());
      check('osm: map buttons visible for pick-up and destination', (await page.locator('form[data-booking] .place-map:visible').count()) === 2);
      await page.fill('input[name=name]', 'Tes Peta');
      await page.click(pickup);
      await typeSlow(page, pickup, 'St');
      await page.waitForTimeout(600);
      check('osm lazy: first focus loads the picker + OSM provider, not Leaflet', chunks.includes('mapsPicker') && chunks.includes('osm') && !chunks.some((c) => c.startsWith('leaflet')), chunks.join());
      check('osm: no suggestions before 3 characters', osm.search.length === 0 && !(await page.locator(listOf(id)).isVisible()));
      await typeSlow(page, pickup, 'a');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      check('osm: one request after typing pauses (debounce)', osm.search.length === 1, JSON.stringify(osm.search.map((r) => r.q)));
      const req = osm.search[0];
      check('osm request: q, limit 5, lang default (id page), Bogor bias, no restriction', req.q === 'Sta' && req.limit === '5' && req.lang === 'default' && req.lat === '-6.5971' && req.lon === '106.806' && req.zoom === '12' && !req.bbox && !req.countrycode && !req.osm_tag, JSON.stringify(req));
      check('osm request: page Referer sent to Photon', req.referer.startsWith(base), req.referer);
      const n = await page.locator(`${listOf(id)} li`).count();
      check('osm: at most 5 suggestions (duplicates merged)', n === 5, String(n));
      const rows = await page.locator(`${listOf(id)} li`).allTextContents();
      check('osm: no duplicate rows', new Set(rows).size === rows.length, rows.join(' | '));
      check('osm: row = name + short address', /^Stasiun BogorJalan Nyi Raja Permas, Bogor Tengah, Kota Bogor, Jawa Barat$/.test(rows[0]), rows[0]);
      check('osm: combobox aria-expanded=true', (await page.getAttribute(pickup, 'aria-expanded')) === 'true');
      check('osm: live region announces the count', /5 saran/.test(await page.locator(`#${id} ~ [data-place-live]`).textContent()));
      const attr = page.locator(`${listOf(id)} + .place-attr`);
      check('osm: "© OpenStreetMap" attribution under the list, linked', (await attr.isVisible()) && /© OpenStreetMap/.test(await attr.textContent()) && (await attr.locator('a').getAttribute('href')) === 'https://www.openstreetmap.org/copyright');
      await page.screenshot({ path: join(shots, 'desktop-suggestions.png') });
      await page.keyboard.press('ArrowDown');
      check('osm: arrow down highlights first option', (await page.getAttribute(pickup, 'aria-activedescendant')) === `${id}-list-0`);
      await page.keyboard.press('Enter');
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      check('osm: Enter selects (field = name + address)', (await page.inputValue(pickup)) === 'Stasiun Bogor, Jalan Nyi Raja Permas, Bogor Tengah, Kota Bogor, Jawa Barat', await page.inputValue(pickup));
      check('osm: Enter on a suggestion does not submit', (await page.evaluate(() => window.__opened.length)) === 0);
      check('osm: chip "Titik dipilih" shown', /Titik dipilih/.test(await page.locator('[data-place-chip=pickup]').textContent()));
      const p0 = await point(page, pickup);
      check('osm: point from the suggestion, no place id', p0 && p0.lat === -6.595345 && p0.lng === 106.790543 && p0.name === 'Stasiun Bogor' && !('placeId' in p0 && p0.placeId), JSON.stringify(p0));
      check('osm: choosing needs no extra request', osm.search.length === 1 && !osm.reverse.length, String(osm.search.length));
      // retyping clears the point
      await page.press(pickup, 'End');
      await typeSlow(page, pickup, ' 2');
      check('osm: retyping clears the point (chip hidden)', await page.locator('[data-place-chip=pickup]').isHidden());
      check('osm: retyping clears the point (no point on input)', !(await point(page, pickup)));
      // Esc closes the list
      await page.fill(pickup, '');
      await typeSlow(page, pickup, 'Hotel');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      await page.keyboard.press('Escape');
      check('osm: Esc closes the list', !(await page.locator(listOf(id)).isVisible()) && (await page.getAttribute(pickup, 'aria-expanded')) === 'false');
      // click select (a repeated text is answered from memory, not asked again)
      const before = osm.search.length;
      await typeSlow(page, pickup, ' ');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible' });
      check('osm: same text again answered from memory (no request)', osm.search.length === before, JSON.stringify(osm.search.slice(before).map((r) => r.q)));
      await page.click(`${listOf(id)} li >> nth=0`);
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      check('osm: click selects; house number in Indonesian style', (await page.inputValue(pickup)) === 'Hotel Salak The Heritage, Jalan Ir. H. Juanda No. 8, Paledang, Kota Bogor, Jawa Barat', await page.inputValue(pickup));
      // destination
      await page.click(dest);
      await typeSlow(page, dest, 'Bandara');
      await page.waitForSelector(`${listOf(destId)} li`, { state: 'visible' });
      await page.click(`${listOf(destId)} li >> nth=0`);
      await page.waitForSelector(`[data-place-chip=dest]:not([hidden])`);
      check('osm: destination selects too', (await page.inputValue(dest)) === 'Bandara Internasional Soekarno-Hatta, Kota Tangerang, Banten', await page.inputValue(dest));
      // submit
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const opened = await page.evaluate(() => window.__opened);
      const text = opened[0] ? new URL(opened[0]).searchParams.get('text') : '';
      check('osm: WhatsApp pick-up line has the map link (coordinates only)', text.includes('Jemput di: Hotel Salak The Heritage, Jalan Ir. H. Juanda No. 8, Paledang, Kota Bogor, Jawa Barat (https://www.google.com/maps/search/?api=1&query=-6.5944%2C106.7956)'), text);
      check('osm: WhatsApp destination line has the map link', text.includes('Tujuan: Bandara Internasional Soekarno-Hatta, Kota Tangerang, Banten (https://www.google.com/maps/search/?api=1&query=-6.1256%2C106.6559)') && !text.includes('query_place_id'), text);
      const body = await lastBeacon(page);
      check('osm beacon: pickup lat/lng/name, no place id', body && body.pickup_lat === -6.5944 && body.pickup_lng === 106.7956 && body.pickup_place_name === 'Hotel Salak The Heritage' && !('pickup_place_id' in body), JSON.stringify(body));
      check('osm beacon: destination lat/lng/name, no place id', body && body.destination_lat === -6.1256 && body.destination_lng === 106.6559 && body.destination_place_name === 'Bandara Internasional Soekarno-Hatta' && !('destination_place_id' in body), JSON.stringify(body));
      check('osm beacon: text fields unchanged', body && body.pickup_location.startsWith('Hotel Salak') && body.destination.startsWith('Bandara') && body.lead_code?.startsWith('ARS-'));
      const store = await page.evaluate(() => JSON.stringify({ s: Object.entries(sessionStorage), l: Object.entries(localStorage) }));
      check('osm: no coordinates or place names in session/localStorage', !/-6\.59|106\.79|Hotel Salak|Bandara/.test(store), store);
      const dl = await page.evaluate(() => JSON.stringify(window.dataLayer || []));
      check('osm: no coordinates or place names in dataLayer', !/-6\.59|106\.79|Hotel Salak|Bandara|place_/.test(dl), dl);
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const beacons1 = await page.evaluate(() => window.__beacons.length);
      const codes = (await page.evaluate(() => window.__opened)).map((u) => /(ARS-[A-Z0-9]{5})/.exec(decodeURIComponent(u))?.[1]);
      check('osm: identical resend reuses the code, no second beacon', beacons1 === 1 && codes[0] === codes[1], JSON.stringify({ beacons1, codes }));
      check('osm: no Google request, nothing else leaves for OSM hosts', mapsRequests.length === 0 && !osm.aborted.length, mapsRequests.concat(osm.aborted).join());
      check('osm: no page errors (suggestions)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: free text + analytics flow (verify-analytics.yml)
    {
      const { page, context } = await open('/sewa-mobil-bogor');
      await page.fill('input[name=name]', 'Tes Analytics');
      await page.fill(pickup, 'Tes (abaikan)');
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(400);
      const opened = await page.evaluate(() => window.__opened);
      const body = await lastBeacon(page);
      const dl = await page.evaluate(() => (window.dataLayer || []).filter((e) => e.event === 'generate_lead').length);
      check('osm: free text submits (verify-analytics flow)', opened.length === 1 && body?.pickup_location === 'Tes (abaikan)' && !('pickup_lat' in body) && !opened[0].includes('google.com%2Fmaps'), JSON.stringify(body));
      check('osm: generate_lead still pushed', dl === 1);
      await context.close();
    }
    // ------------------------------------------------------------ OSM: stale answers, errors, throttling
    {
      const { page, context, errors, osm } = await open('/sewa-mobil-bogor');
      const id = await page.getAttribute(pickup, 'id');
      // A slow answer for older text is aborted and never shown.
      osm.delay = (q) => (q === 'Stasiun' ? 1200 : 0);
      await page.fill('input[name=name]', 'Tes');
      await page.click(pickup);
      await typeSlow(page, pickup, 'Stasiun');
      await page.waitForTimeout(450);
      await typeSlow(page, pickup, ' Bo');
      await page.waitForTimeout(1600);
      const rows = await page.locator(`${listOf(id)} li b`).allTextContents();
      check('osm stale: list shows only the answer for the latest text', rows.length === 1 && rows[0] === 'Stasiun Bogor', rows.join(' | '));
      check('osm stale: the older request was aborted', osm.aborted.some((u) => /q=Stasiun&/.test(u)), osm.aborted.join());
      osm.delay = () => 0;
      // One throttled answer (429): no list, but the next lookup works again.
      osm.status.push(429);
      await page.fill(pickup, '');
      await typeSlow(page, pickup, 'Gambir');
      await page.waitForTimeout(700);
      check('osm 429: no list, map buttons stay', !(await page.locator(listOf(id)).isVisible()) && (await page.locator('form[data-booking] .place-map:visible').count()) === 2);
      check('osm 429: the failed lookup is not retried by itself', osm.search.filter((r) => r.q === 'Gambir').length === 1, JSON.stringify(osm.search.map((r) => [r.q, r.status])));
      await typeSlow(page, pickup, ' ');
      await page.waitForSelector(`${listOf(id)} li`, { state: 'visible', timeout: 3000 }).catch(() => {});
      check('osm 429: the next lookup (new keystroke) works', (await page.locator(`${listOf(id)} li`).count()) === 1, JSON.stringify(osm.search.map((r) => [r.q, r.status])));
      // Provider down: three errors in a row turn the extras off.
      osm.fail = 503;
      for (const more of ['x', 'y', 'z']) { await typeSlow(page, pickup, more); await page.waitForTimeout(650); }
      check('osm down: three errors in a row hide the map buttons', (await page.locator('form[data-booking] .place-map:visible').count()) === 0, String(osm.search.length));
      const n = osm.search.length;
      await typeSlow(page, pickup, ' lagi');
      await page.waitForTimeout(700);
      check('osm down: no further requests, no list', osm.search.length === n && !(await page.locator(listOf(id)).isVisible()), String(osm.search.length - n));
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const body = await lastBeacon(page);
      check('osm down: form still sends (WhatsApp + lead, free text)', (await page.evaluate(() => window.__opened.length)) === 1 && body?.pickup_location === 'Gambir xyz lagi' && !('pickup_lat' in body), JSON.stringify(body));
      check('osm: no page errors (errors)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: map library fails to load
    {
      const { page, context, errors } = await open('/sewa-mobil-bogor', { leafletFail: true });
      await page.fill('input[name=name]', 'Tes');
      await page.click(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] [data-mp-err]:not([hidden])', { timeout: 8000 }).catch(() => {});
      check('osm map fails: message in the dialog, no "use" button', /Peta tidak bisa dimuat/.test(await page.locator('dialog.mp [data-mp-err]').textContent()) && (await page.locator('dialog.mp [data-mp-use]').isHidden()));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      check('osm map fails: map buttons hidden', (await page.locator('form[data-booking] .place-map:visible').count()) === 0);
      await page.fill(pickup, 'Stasiun Bogor');
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const body = await lastBeacon(page);
      check('osm map fails: form still sends', (await page.evaluate(() => window.__opened.length)) === 1 && body?.pickup_location === 'Stasiun Bogor');
      check('osm map fails: no page errors', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: map dialog, desktop
    {
      const { page, context, errors, osm, chunks } = await open('/sewa-mobil-bogor');
      await page.click(pickup);
      await page.waitForTimeout(300);
      check('osm lazy: Leaflet not loaded before the map opens', !chunks.some((c) => c.startsWith('leaflet')), chunks.join());
      await page.click(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] .leaflet-container');
      await waitFor(() => osm.reverse.length >= 1);
      await page.waitForTimeout(300);
      check('osm: Leaflet (JS + CSS) loads when the map opens', chunks.includes('leaflet-src') && chunks.includes('leaflet') && (await page.locator('style#leaflet-css').count()) === 1, chunks.join());
      const r0 = osm.reverse[0];
      check('osm: map opens at the page city, one reverse lookup', osm.reverse.length === 1 && r0.lat === '-6.5971' && r0.lon === '106.806' && r0.lang === 'default' && r0.limit === '1', JSON.stringify(osm.reverse));
      check('osm: address of the point shown', /Jalan Pajajaran No\. \d+, Bogor Timur, Kota Bogor/.test(await page.locator('dialog.mp [data-mp-addr]').textContent()));
      const tiles = osm.tiles.map((t) => t.url);
      check('osm tiles: tile.openstreetmap.org/{z}/{x}/{y}.png at the city zoom (12)', tiles.length > 0 && tiles.every((u) => /^https:\/\/tile\.openstreetmap\.org\/12\/\d+\/\d+\.png$/.test(u)), tiles.slice(0, 3).join());
      check('osm tiles: only the visible area (no prefetch)', tiles.length <= 20, String(tiles.length));
      check('osm tiles: Referer sent', osm.tiles.every((t) => t.referer.startsWith(base)), osm.tiles[0]?.referer);
      const mapAttr = page.locator('dialog.mp .leaflet-control-attribution');
      check('osm: "© OpenStreetMap contributors" on the map, linked to /copyright', (await mapAttr.isVisible()) && /© OpenStreetMap contributors/.test(await mapAttr.textContent()) && (await mapAttr.locator('a[href="https://www.openstreetmap.org/copyright"]').count()) === 1);
      check('osm: zoom buttons labelled in Indonesian', (await page.getAttribute('dialog.mp .leaflet-control-zoom-in', 'title')) === 'Perbesar peta' && (await page.getAttribute('dialog.mp .leaflet-control-zoom-out', 'title')) === 'Perkecil peta');
      const pin = await page.locator('dialog.mp .mp-pin').boundingBox();
      const c = await mapCentre(page);
      check('osm: pin tip at the map centre, map panes isolated below it', pin && Math.abs(pin.x + pin.width / 2 - c.x) < 2 && Math.abs(pin.y + pin.height - c.y) < 2 && (await page.$eval('dialog.mp .mp-canvas', (el) => getComputedStyle(el).isolation === 'isolate')), JSON.stringify({ pin, c }));
      check('osm: "Pakai lokasi saya" offered for pick-up', await page.locator('dialog.mp [data-mp-mine]').isVisible());
      check('osm: search box focused (desktop)', await page.$eval('dialog.mp [data-mp-search]', (el) => document.activeElement === el));
      await mouseDrag(page, -160, 80);
      await waitFor(() => osm.reverse.length >= 2, 4000);
      await page.waitForTimeout(150);
      const r1 = osm.reverse[1];
      check('osm: drag -> one more reverse lookup at the new centre', osm.reverse.length === 2 && r1 && (r1.lat !== r0.lat || r1.lon !== r0.lon), JSON.stringify(osm.reverse.map((r) => [r.lat, r.lon])));
      check('osm: reverse lookups at least 1 s apart', r1 && r1.t - r0.t >= 950, String(r1 && r1.t - r0.t));
      await page.screenshot({ path: join(shots, 'desktop-map-dialog.png') });
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(150);
      check('osm: dialog closes after "Pakai titik ini"', !(await page.locator('dialog.mp[open]').count()));
      const p1 = await point(page, pickup);
      check('osm: map point = the looked-up centre, no place id', p1 && String(p1.lat) === String(Number(r1.lat)) && String(p1.lng) === String(Number(r1.lon)) && !p1.placeId && /Jalan Pajajaran/.test(p1.name), JSON.stringify({ p1, r1 }));
      check('osm: field shows the found address', (await page.inputValue(pickup)) === `Jalan Pajajaran No. ${reverseHouse(Number(r1.lon))}, Bogor Timur, Kota Bogor, Jawa Barat`, await page.inputValue(pickup));
      check('osm: focus returns to the map button', await page.evaluate(() => document.activeElement?.matches('[data-place-map][data-kind=pickup]')));
      // reopen from the chip, search inside the dialog
      const tilesBefore = osm.tiles.length;
      const revBefore = osm.reverse.length;
      await page.click('[data-place-chip=pickup] [data-place-edit]');
      await page.waitForSelector('dialog.mp[open]');
      await page.waitForTimeout(600);
      check('osm: reopen starts at the chosen point (zoom 17), no new lookup', tileZooms(osm, tilesBefore).join() === '17' && osm.reverse.length === revBefore, JSON.stringify({ z: tileZooms(osm, tilesBefore), rev: osm.reverse.length - revBefore }));
      await typeSlow(page, 'dialog.mp [data-mp-search]', 'Stasiun Bo');
      await page.waitForSelector('dialog.mp .place-list li', { state: 'visible' });
      check('osm: "© OpenStreetMap" under the dialog list too', await page.locator('dialog.mp .place-attr').isVisible());
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
      check('osm: a searched place needs no reverse lookup', osm.reverse.length === revBefore, String(osm.reverse.length - revBefore));
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(150);
      const p2 = await point(page, pickup);
      check('osm: searched place used (exact point, no place id)', p2?.lat === -6.595345 && p2?.lng === 106.790543 && !p2.placeId && (await page.inputValue(pickup)).startsWith('Stasiun Bogor, '), JSON.stringify(p2));
      // Window resized while the dialog is closed (phone rotated, desktop window): reopening keeps the chosen place.
      const label2 = await page.inputValue(pickup);
      const revResize = osm.reverse.length;
      await page.setViewportSize({ width: 900, height: 800 });
      await page.waitForTimeout(500);
      await page.click('[data-place-chip=pickup] [data-place-edit]');
      await page.waitForSelector('dialog.mp[open]');
      await page.waitForTimeout(1500);
      check('osm: resized while closed -> reopen keeps the chosen place, no lookup', (await page.locator('dialog.mp [data-mp-addr]').textContent()) === label2 && osm.reverse.length === revResize, JSON.stringify({ addr: await page.locator('dialog.mp [data-mp-addr]').textContent(), rev: osm.reverse.slice(revResize) }));
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(150);
      check('osm: ... and "Pakai titik ini" keeps it', (await page.inputValue(pickup)) === label2 && (await point(page, pickup))?.name === 'Stasiun Bogor', await page.inputValue(pickup));
      await page.setViewportSize({ width: 1280, height: 900 });
      // destination: no "my location"; Esc closes
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open]');
      check('osm: no "Pakai lokasi saya" for destination', await page.locator('dialog.mp [data-mp-mine]').isHidden());
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      check('osm: Esc closes the dialog', !(await page.locator('dialog.mp[open]').count()));
      check('osm: max zoom 19 (no tile above 19)', osm.tiles.every((t) => Number(/\/(\d+)\/\d+\/\d+\.png$/.exec(t.url)?.[1]) <= 19));
      check('osm: no page errors (map dialog)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: reverse lookups spaced >= 1 s, zoom capped at 19
    {
      const { page, context, errors, osm } = await open('/sewa-mobil-bogor');
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open] .leaflet-container');
      await waitFor(() => osm.reverse.length >= 1);
      // Three quick drags: only the last stop is looked up, and not before 1 s after the previous lookup.
      await mouseDrag(page, 120, 0);
      await mouseDrag(page, 0, 120);
      await mouseDrag(page, -60, -60);
      await page.waitForTimeout(2500);
      const gaps = osm.reverse.slice(1).map((r, i) => r.t - osm.reverse[i].t);
      check('osm rate limit: three quick drags -> one lookup for the final stop', osm.reverse.length === 2, JSON.stringify(osm.reverse.map((r) => [r.lat, r.lon])));
      check('osm rate limit: every reverse lookup >= 1 s after the previous', gaps.every((g) => g >= 950), JSON.stringify(gaps));
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(150);
      const p = await point(page, dest);
      const last = osm.reverse[osm.reverse.length - 1];
      check('osm rate limit: the used point is the final stop', p && String(p.lat) === String(Number(last.lat)) && String(p.lng) === String(Number(last.lon)), JSON.stringify({ p, last }));
      // Zooming all the way in never asks for tiles above 19.
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open]');
      for (let i = 0; i < 10 && !(await page.locator('dialog.mp .leaflet-control-zoom-in.leaflet-disabled').count()); i++) { await page.click('dialog.mp .leaflet-control-zoom-in', { timeout: 1000 }).catch(() => {}); await page.waitForTimeout(150); }
      await page.waitForTimeout(400);
      const zooms = tileZooms(osm);
      check('osm: zoom stops at 19 (tile policy)', Math.max(...zooms) === 19 && (await page.locator('dialog.mp .leaflet-control-zoom-in.leaflet-disabled').count()) === 1, zooms.join());
      check('osm: no page errors (rate limit)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: a reverse lookup that never answers
    {
      const { page, context, errors, osm } = await open('/sewa-mobil-bogor');
      osm.hang = true;
      await page.click(`[data-place-map][data-kind=dest]`);
      await page.waitForSelector('dialog.mp[open] .leaflet-container');
      await waitFor(() => osm.reverse.length >= 1);
      await page.click('dialog.mp [data-mp-use]');
      await page.waitForTimeout(500);
      check('osm hung lookup: "use" waits for the address', (await page.locator('dialog.mp[open]').count()) === 1);
      await page.waitForSelector('dialog.mp:not([open])', { state: 'attached', timeout: 13000 }).catch(() => {});
      const p = await point(page, dest);
      check('osm hung lookup: gives up after the timeout, the bare point is used', !(await page.locator('dialog.mp[open]').count()) && p?.lat === -6.5971 && p?.lng === 106.806 && !p.name && (await page.inputValue(dest)) === 'Titik di peta (-6.5971, 106.806)', JSON.stringify(p) + ' ' + (await page.inputValue(dest)));
      check('osm: no page errors (hung lookup)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: phone, full-screen sheet, one-finger drag, my location
    {
      const device = devices['Pixel 7'];
      const { page, context, errors, osm } = await open('/sewa-mobil-bogor', { device, geo: { latitude: -6.5812, longitude: 106.7998 } });
      await page.tap(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] .leaflet-container');
      await waitFor(() => osm.reverse.length >= 1);
      await page.waitForTimeout(300);
      const box = await page.locator('dialog.mp').boundingBox();
      const vp = page.viewportSize();
      check('osm phone: map opens full screen', box && Math.round(box.width) === vp.width && Math.round(box.height) === vp.height, JSON.stringify({ box, vp }));
      check('osm phone: search box not auto-focused (keyboard stays down)', await page.$eval('dialog.mp [data-mp-search]', (el) => document.activeElement !== el));
      await page.screenshot({ path: join(shots, 'phone-map-sheet.png') });
      const scrollY = await page.evaluate(() => window.scrollY);
      await fingerDrag(page, -100, -140);
      await waitFor(() => osm.reverse.length >= 2, 4000);
      const r1 = osm.reverse[1];
      check('osm phone: one finger moves the map (new lookup at a new centre)', r1 && (r1.lat !== osm.reverse[0].lat || r1.lon !== osm.reverse[0].lon), JSON.stringify(osm.reverse.map((r) => [r.lat, r.lon])));
      check('osm phone: the page behind does not scroll', (await page.evaluate(() => window.scrollY)) === scrollY);
      await page.tap('dialog.mp [data-mp-mine]');
      await waitFor(() => osm.reverse.some((r) => r.lat === '-6.5812' && r.lon === '106.7998'), 4000);
      check('osm phone: "Pakai lokasi saya" centres on the device location', osm.reverse.some((r) => r.lat === '-6.5812' && r.lon === '106.7998'), JSON.stringify(osm.reverse.map((r) => [r.lat, r.lon])));
      await page.tap('dialog.mp [data-mp-use]');
      await page.waitForTimeout(200);
      const p = await point(page, pickup);
      check('osm phone: my location becomes the pick-up point', p?.lat === -6.5812 && p?.lng === 106.7998 && !p.placeId, JSON.stringify(p));
      await page.tap(dest);
      await typeSlow(page, dest, 'Bandara');
      await page.waitForSelector('form[data-booking] [data-place=dest] .place-list li', { state: 'visible' });
      await page.screenshot({ path: join(shots, 'phone-suggestions.png') });
      await page.tap('form[data-booking] [data-place=dest] .place-list li >> nth=0');
      await page.waitForSelector(`[data-place-chip=dest]:not([hidden])`);
      check('osm phone: tap selects a suggestion', (await page.inputValue(dest)).startsWith('Bandara Internasional Soekarno-Hatta'));
      check('osm: no page errors (phone)', !errors.length, errors.join(' | '));
      await context.close();
    }
    // ------------------------------------------------------------ OSM: phone, location denied
    {
      const { page, context } = await open('/sewa-mobil-bogor', { device: devices['Pixel 7'] });
      await page.tap(`[data-place-map][data-kind=pickup]`);
      await page.waitForSelector('dialog.mp[open] .leaflet-container');
      await page.tap('dialog.mp [data-mp-mine]');
      await page.waitForSelector('dialog.mp [data-mp-err]:not([hidden])', { timeout: 20000 }).catch(() => {});
      const msg = await page.locator('dialog.mp [data-mp-err]').textContent();
      check('osm location denied: friendly message, map still usable', /Izin lokasi|Lokasi Anda/.test(msg) && (await page.locator('dialog.mp [data-mp-use]').isVisible()), msg);
      await context.close();
    }
    // ------------------------------------------------------------ OSM: English home page
    {
      const { page, context, osm } = await open('/en');
      await page.fill('input[name=name]', 'Test');
      await page.click(pickup);
      await typeSlow(page, pickup, 'Gambir');
      await page.waitForSelector('form[data-booking] [data-place=pickup] .place-list li', { state: 'visible' });
      const r = osm.search[0];
      check('osm en: lang=en, Jabodetabek bias', r.lang === 'en' && r.lat === '-6.35' && r.lon === '106.82' && r.zoom === '10', JSON.stringify(r));
      check('osm en: live region in English', /suggestions/.test(await page.locator('form[data-booking] [data-place=pickup] [data-place-live]').textContent()));
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForSelector(`[data-place-chip=pickup]:not([hidden])`);
      check('osm en: chip "Point set"', /Point set/.test(await page.locator('[data-place-chip=pickup]').textContent()));
      await page.click('[data-place-map][data-kind=dest]');
      await page.waitForSelector('dialog.mp[open] .leaflet-container');
      check('osm en: zoom buttons in English', (await page.getAttribute('dialog.mp .leaflet-control-zoom-in', 'title')) === 'Zoom in');
      await page.keyboard.press('Escape');
      await page.click('button[data-cta=booking]');
      await page.waitForTimeout(200);
      const text = new URL((await page.evaluate(() => window.__opened))[0]).searchParams.get('text');
      check('osm en: WhatsApp "Pick-up:" line with map link', text.includes('Pick-up: Stasiun Gambir, Jalan Medan Merdeka Timur, Gambir, Jakarta Pusat, Daerah Khusus Ibukota Jakarta (https://www.google.com/maps/search/?api=1&query=-6.1766%2C106.8306)'), text);
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
console.log(`\n${results.length - failed.length}/${results.length} passed (provider: ${mode}). Screenshots: ${mode === 'none' ? '-' : shots}`);
process.exit(failed.length ? 1 : 0);
