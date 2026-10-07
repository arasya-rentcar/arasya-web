/**
 * OpenStreetMap provider for the booking form's map picker
 * (PUBLIC_MAPS_PROVIDER=osm). No key, no account. Services and their rules:
 *
 * - Suggestions and the address of a map point: Photon public API
 *   (photon.komoot.io, OSM data, ODbL). Fair use only ("extensive usage will
 *   be throttled"): 3 characters and a 300 ms pause before a lookup (in
 *   mapsPicker.ts), stale requests aborted, answers kept in memory so the same
 *   text or point is never asked twice, no retries, and reverse lookups only
 *   when the map stops, at most one per second. Nominatim is not used: its
 *   public server forbids autocomplete.
 * - Map: Leaflet (bundled, loaded only when the map opens) with
 *   tile.openstreetmap.org tiles: the "© OpenStreetMap contributors"
 *   attribution on the map, max zoom 19, nothing fetched outside the view,
 *   browser caching untouched and the page's Referer sent (the site sets no
 *   restrictive Referrer-Policy), as the OSMF tile usage policy requires.
 *
 * OSM has no Google place id: places from here carry placeId null.
 */
import { round6 } from '../placePoint';
import { labelOf, type LatLng, type Place, type Provider, type ProviderOptions, type Suggestion } from './provider';

const PHOTON = 'https://photon.komoot.io';
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

type Props = Record<string, string | undefined>;
interface Feature { geometry?: { coordinates?: [number, number] }; properties?: Props }
type OsmSuggestion = Suggestion & { place: Place };

/** Name and short address from Photon's GeoJSON properties, without repeated parts. */
function describe(p: Props) {
  const indonesia = (p.countrycode || '').toUpperCase() === 'ID';
  const street = p.street && p.housenumber ? (indonesia ? `${p.street} No. ${p.housenumber}` : `${p.housenumber} ${p.street}`) : p.street || '';
  const name = p.name || street || p.district || p.city || p.county || p.state || p.country || '';
  const seen = new Set([name.toLowerCase()]);
  // Within Indonesia the country name is noise; abroad it helps.
  const address = [street, p.district, p.city || p.county, p.state, indonesia ? '' : p.country]
    .filter((x): x is string => !!x && !seen.has(x.toLowerCase()) && !!seen.add(x.toLowerCase()))
    .join(', ');
  return { name, address };
}

function toPlace(f: Feature, props = f.properties || {}): Place | null {
  const [lng, lat] = f.geometry?.coordinates || [];
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const { name, address } = describe(props);
  return { lat: round6(lat), lng: round6(lng), name, address, placeId: null };
}

/** A hung request would keep "Pakai titik ini" waiting; Photon usually answers in a few seconds. */
const TIMEOUT = 10000;

async function photon(path: string, params: Record<string, string>, signal: AbortSignal): Promise<Feature[]> {
  const ctl = new AbortController();
  const stop = () => ctl.abort();
  if (signal.aborted) stop();
  signal.addEventListener('abort', stop, { once: true });
  let late = false;
  const timer = setTimeout(() => { late = true; ctl.abort(); }, TIMEOUT);
  try {
    const res = await fetch(`${PHOTON}${path}?${new URLSearchParams(params)}`, { signal: ctl.signal, credentials: 'omit' });
    // 429 (throttled), 5xx and timeouts count as errors for the caller; three in a row turn the extras off.
    if (!res.ok) throw new Error(`photon ${res.status}`);
    const json = await res.json();
    return Array.isArray(json?.features) ? json.features : [];
  } catch (e) {
    throw late ? new Error('photon timeout') : e;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
  }
}

/** Small in-memory cache (never storage): the same text or point is not looked up twice. */
function memo<T>() {
  const m = new Map<string, T>();
  return {
    get: (k: string) => m.get(k),
    set(k: string, v: T) {
      if (m.size >= 50) m.delete(m.keys().next().value!);
      m.set(k, v);
    },
  };
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(signal.reason); }, { once: true });
  });

export function create(opts: ProviderOptions): Provider {
  // The public Photon server knows only default (local names: Indonesian in
  // Indonesia), de, en and fr; it rejects any other value.
  const lang = opts.lang === 'en' ? 'en' : 'default';
  const found = memo<OsmSuggestion[]>();
  const addresses = memo<string>();
  let lastReverse = 0;

  return {
    suggester() {
      return {
        async suggest(text, signal) {
          const hit = found.get(text);
          if (hit) return hit;
          // Bias, never restrict: the site also serves other cities and countries.
          const features = await photon('/api/', { q: text, limit: '5', lang, lat: String(opts.bias.lat), lon: String(opts.bias.lng), zoom: String(opts.bias.zoom) }, signal);
          const list: OsmSuggestion[] = [];
          for (const f of features) {
            const place = toPlace(f);
            if (!place || !place.name) continue;
            // OSM often maps one place several times (area, building, entrance): the
            // same name within ~300 m is the same pick-up spot, keep Photon's first.
            const name = place.name.toLowerCase();
            if (list.some((s) => s.place.name.toLowerCase() === name && Math.abs(s.place.lat - place.lat) < 0.003 && Math.abs(s.place.lng - place.lng) < 0.003)) continue;
            list.push({ main: place.name, sub: place.address, text: labelOf(place.name, place.address), place });
          }
          found.set(text, list.slice(0, 5));
          return list.slice(0, 5);
        },
        async resolve(s) {
          return (s as OsmSuggestion).place;
        },
      };
    },
    async reverse(p: LatLng, signal: AbortSignal) {
      const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
      const hit = addresses.get(key);
      if (hit !== undefined) return hit;
      // At most one reverse lookup per second (a newer stop aborts this one while it waits).
      for (let wait; (wait = lastReverse + 1000 - Date.now()) > 0; ) await sleep(wait, signal);
      lastReverse = Date.now();
      const [f] = await photon('/reverse', { lat: String(p.lat), lon: String(p.lng), lang, limit: '1' }, signal);
      // The nearest object may be a shop or building next to the pin: like Google's
      // reverse geocoding, describe the point by its street address, not that name.
      const props = f?.properties || {};
      const place = f && toPlace(f, props.type === 'street' || !props.street ? props : { ...props, name: undefined });
      const text = place ? labelOf(place.name, place.address) : '';
      addresses.set(key, text);
      return text;
    },
    async createMap(el, center, zoom, on) {
      const [L, css] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css?inline')]);
      if (!document.getElementById('leaflet-css')) {
        const style = document.createElement('style');
        style.id = 'leaflet-css';
        style.textContent = css.default;
        document.head.append(style);
      }
      const map = L.map(el, { center: [center.lat, center.lng], zoom, maxZoom: 19, zoomControl: false });
      // Leaflet makes the map focusable (arrow keys pan it) but gives it no name.
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', opts.msg.title);
      L.control.zoom({ position: 'topright', zoomInTitle: opts.msg.zoomIn, zoomOutTitle: opts.msg.zoomOut }).addTo(map);
      L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
      map.on('dragstart', on.dragStart);
      map.on('moveend', on.idle);
      // The first view was set before the listener existed: report it once the caller has the view.
      setTimeout(on.idle, 0);
      return {
        getCenter() {
          // Leaflet does not wrap: panned past 180° the longitude would leave -180..180.
          const c = map.getCenter().wrap();
          return { lat: round6(c.lat), lng: round6(c.lng) };
        },
        setCenter(c, z) {
          // The dialog was closed (no size) since the last view. If the size changed
          // (map made while hidden, window resized meanwhile), Leaflet reports it as a
          // stop at a shifted old centre, which would drop the chosen place: not an idle.
          map.off('moveend', on.idle);
          map.invalidateSize({ pan: false });
          map.on('moveend', on.idle);
          map.setView([c.lat, c.lng], z, { animate: false });
        },
      };
    },
  };
}
