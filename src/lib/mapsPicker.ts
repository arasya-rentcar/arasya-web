/**
 * Place suggestions and the map picker for the booking form (Google Maps
 * Platform). BookingBar imports this module only when PUBLIC_GOOGLE_MAPS_KEY
 * is set, and only once the visitor first touches the pick-up or destination
 * field or a map button; the Google script loads at that moment, never with
 * the page.
 *
 * Everything here is an extra: free text is always accepted, and if the
 * script fails, the key is rejected or a request errors, the form keeps
 * working exactly as without it (the map buttons disappear, nothing blocks
 * sending).
 *
 * APIs used (restrict the key to exactly these): Maps JavaScript API (loader,
 * Map), Places API (New) (AutocompleteSuggestion, Place.fetchFields with
 * displayName/formattedAddress/location only) and Geocoding API (Geocoder,
 * reverse geocoding when the map stops moving).
 *
 * Location data is personal data: nothing here logs, stores or sends it
 * anywhere except to Google for the lookup itself; the chosen point stays on
 * the input element (placePoint.ts) until the form is sent.
 */
import type { MapBias } from './geo';
import { pointOf, round6, setPoint, type PlacePoint } from './placePoint';

type Kind = 'pickup' | 'dest';
type Msg = Record<string, string>;
interface Config { key: string; lang: string; bias: MapBias; msg: Msg; dialog: string }
/** A chosen place, plus the text the field shows for it. */
type Picked = PlacePoint & { label: string };
export interface Picker { open(kind: Kind, opener: HTMLElement): void }

const MAX_TEXT = 300;
let broken = false;
const offHandlers: (() => void)[] = [];
const fail = () => {
  if (broken) return;
  broken = true;
  offHandlers.forEach((f) => f());
};

/**
 * Google's dynamic library import bootstrap
 * (developers.google.com/maps/documentation/javascript/load-maps-js-api),
 * unminified: defines google.maps.importLibrary, which adds the <script> on
 * its first call and then hands over to the real implementation. Added: a
 * timeout, and a guard against a script that loads without installing it.
 */
function installLoader(params: Record<string, string>) {
  const w = window as any;
  const maps = ((w.google ||= {}).maps ||= {});
  if (maps.importLibrary) return;
  const libraries = new Set<string>();
  let loading: Promise<void> | undefined;
  const load = () =>
    (loading ||= new Promise<void>((resolve, reject) => {
      const q = new URLSearchParams();
      q.set('libraries', [...libraries].join(','));
      for (const k in params) q.set(k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()), params[k]);
      q.set('callback', 'google.maps.__ib__');
      maps.__ib__ = resolve;
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?' + q;
      s.async = true;
      s.nonce = (document.querySelector('script[nonce]') as HTMLScriptElement | null)?.nonce || '';
      s.onerror = () => reject(new Error('maps script'));
      setTimeout(() => reject(new Error('maps timeout')), 20000);
      document.head.append(s);
    }));
  const bootstrap = (name: string, ...rest: unknown[]): Promise<any> => {
    libraries.add(name);
    return load().then(() => {
      if (maps.importLibrary === bootstrap) throw new Error('maps not installed');
      return maps.importLibrary(name, ...rest);
    });
  };
  maps.importLibrary = bootstrap;
}

const lib = (name: string): Promise<any> => {
  if (broken) return Promise.reject(new Error('maps off'));
  return (window as any).google.maps.importLibrary(name).catch((e: unknown) => {
    fail();
    throw e;
  });
};

const labelOf = (name: string, address: string) => {
  if (!name) return address;
  if (!address || address.toLowerCase().startsWith(name.toLowerCase())) return address || name;
  return `${name}, ${address}`;
};
const clip = (s: string) => s.slice(0, MAX_TEXT);

/**
 * ARIA combobox on a text input: suggestions after 3 characters, 300 ms after
 * the last keystroke, at most 5, one session token per typing + choosing
 * session (the session ends with the fetchFields call on the chosen place).
 */
function attachSuggest(input: HTMLInputElement, box: HTMLElement, cfg: Config, onPick: (p: Picked) => void) {
  const pop = box.querySelector<HTMLElement>('.place-pop')!;
  const list = pop.querySelector<HTMLUListElement>('[role=listbox]')!;
  const live = box.querySelector<HTMLElement>('[data-place-live]');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  // The browser's own address autofill list would cover ours.
  input.setAttribute('autocomplete', 'off');
  let items: any[] = [];
  let active = -1;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;
  let token: any = null;
  let errors = 0;

  const close = () => {
    pop.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  offHandlers.push(close);
  const highlight = (i: number) => {
    active = i;
    list.querySelectorAll('li').forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    if (i >= 0) input.setAttribute('aria-activedescendant', `${list.id}-${i}`);
    else input.removeAttribute('aria-activedescendant');
  };
  // Keep the list above the on-screen keyboard on phones.
  const reveal = () => {
    const vh = window.visualViewport?.height || window.innerHeight;
    const over = pop.getBoundingClientRect().bottom - vh + 8;
    const room = input.getBoundingClientRect().top - 80;
    if (over > 0 && room > 0 && !box.closest('dialog')) window.scrollBy({ top: Math.min(over, room) });
  };
  const render = () => {
    list.replaceChildren(
      ...items.map((p, i) => {
        const li = document.createElement('li');
        li.id = `${list.id}-${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        const name = document.createElement('b');
        name.textContent = p.mainText?.text || p.text?.text || '';
        const sub = document.createElement('span');
        sub.textContent = p.secondaryText?.text || '';
        li.append(name, sub);
        return li;
      }),
    );
    if (live) live.textContent = items.length ? cfg.msg.count.replace('{n}', String(items.length)) : cfg.msg.none;
    if (!items.length) return close();
    pop.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    highlight(-1);
    reveal();
  };
  const query = async () => {
    const text = input.value.trim();
    const my = ++seq;
    if (text.length < 3 || broken || errors >= 3) return close();
    try {
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await lib('places');
      token ||= new AutocompleteSessionToken();
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: text,
        sessionToken: token,
        language: cfg.lang,
        region: 'id',
        // Bias, never restrict: the site also serves other cities and countries.
        locationBias: { center: { lat: cfg.bias.lat, lng: cfg.bias.lng }, radius: cfg.bias.radius },
      });
      if (my !== seq || document.activeElement !== input) return;
      errors = 0;
      items = (suggestions || []).map((s: any) => s.placePrediction).filter(Boolean).slice(0, 5);
      render();
    } catch {
      errors++;
      if (my === seq) close();
    }
  };
  const pick = async (i: number) => {
    const pred = items[i];
    if (!pred) return;
    // Drop a pending or in-flight lookup for the text typed before this choice:
    // its answer would reopen the list (and could put another place's text
    // next to this point).
    clearTimeout(timer);
    seq++;
    close();
    input.value = clip(String(pred.text?.text || pred.mainText?.text || ''));
    const shown = input.value;
    token = null; // fetchFields below closes this session
    try {
      const place = pred.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
      // The visitor kept typing meanwhile: their text wins.
      if (input.value !== shown || !place.location) return;
      const name = String(place.displayName || pred.mainText?.text || '');
      onPick({
        lat: round6(place.location.lat()),
        lng: round6(place.location.lng()),
        placeId: place.id || pred.placeId || undefined,
        name: clip(name),
        label: clip(labelOf(name, String(place.formattedAddress || ''))),
      });
    } catch {}
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    seq++;
    if (input.value.trim().length < 3) close();
    else timer = setTimeout(query, 300);
  });
  input.addEventListener('keydown', (e) => {
    const open = !pop.hidden && items.length > 0;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!open) return;
      e.preventDefault();
      const n = items.length;
      highlight(e.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1);
    } else if (e.key === 'Enter') {
      if (open && active >= 0) {
        e.preventDefault();
        pick(active);
      } else close();
    } else if (e.key === 'Escape') {
      if (!open) return;
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') close();
  });
  input.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== input) close(); }, 200));
  // Keep focus in the field while tapping a suggestion.
  const keep = (e: Event) => e.preventDefault();
  pop.addEventListener('mousedown', keep);
  pop.addEventListener('pointerdown', keep);
  list.addEventListener('click', (e) => {
    const li = (e.target as Element).closest('li');
    if (li) pick([...list.children].indexOf(li));
  });
  list.addEventListener('mousemove', (e) => {
    const li = (e.target as Element).closest('li');
    if (li) highlight([...list.children].indexOf(li));
  });
}

/** Map dialog (desktop) / full-screen sheet (phones), one per form. */
function mapDialog(dialog: HTMLDialogElement, cfg: Config) {
  const $ = <T extends Element = HTMLElement>(s: string) => dialog.querySelector(s) as T;
  const title = $('[data-mp-title]');
  const canvas = $('[data-mp-canvas]');
  const addr = $('[data-mp-addr]');
  const err = $('[data-mp-err]');
  const use = $<HTMLButtonElement>('[data-mp-use]');
  const mine = $<HTMLButtonElement>('[data-mp-mine]');
  const search = $<HTMLInputElement>('[data-mp-search]');
  const canLocate = 'geolocation' in navigator;
  let map: any = null;
  let geocoder: any = null;
  let target: { input: HTMLInputElement; apply: (p: Picked) => void } | null = null;
  let opener: HTMLElement | null = null;
  // A suggested place the map was moved to (keeps its name and id while the map stays there).
  let candidate: Picked | null = null;
  // The last reverse-geocoded centre.
  let found: { key: string; name: string; done: Promise<void> } | null = null;
  let geoSeq = 0;

  const say = (text: string) => { addr.textContent = text; };
  const showErr = (text: string) => { err.textContent = text; err.hidden = !text; };
  const keyOf = (lat: number, lng: number) => `${round6(lat)},${round6(lng)}`;
  const center = () => { const c = map.getCenter(); return { lat: round6(c.lat()), lng: round6(c.lng()) }; };
  const near = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lng - b.lng) < 1e-5;

  // Reverse geocode once per stop (idle), never while the map moves.
  const lookup = (lat: number, lng: number) => {
    const key = keyOf(lat, lng);
    if (found?.key === key) return found.done;
    const my = ++geoSeq;
    const entry = { key, name: '', done: Promise.resolve() };
    found = entry;
    say(cfg.msg.finding);
    entry.done = (async () => {
      try {
        const { results } = await geocoder.geocode({ location: { lat, lng }, language: cfg.lang });
        entry.name = clip(String(results?.[0]?.formatted_address || ''));
      } catch {}
      if (my === geoSeq) say(entry.name || cfg.msg.noAddr);
    })();
    return entry.done;
  };
  const onIdle = () => {
    const c = center();
    if (candidate && near(candidate, c)) return say(candidate.label);
    candidate = null;
    lookup(c.lat, c.lng);
  };

  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('mp-lock');
    showErr('');
    (opener?.getClientRects().length ? opener : target?.input)?.focus();
    target = null;
  });
  // Click on the backdrop closes, like Esc. Only a press that started there:
  // a map drag or text selection released outside also clicks the dialog.
  let downOutside = false;
  dialog.addEventListener('pointerdown', (e) => { downOutside = e.target === dialog; });
  dialog.addEventListener('click', (e) => {
    const outside = downOutside;
    downOutside = false;
    if (e.target === dialog && outside) close();
  });
  $('[data-mp-close]').addEventListener('click', close);
  offHandlers.push(() => {
    if (!dialog.open) return;
    showErr(cfg.msg.fail);
    use.hidden = mine.hidden = true;
  });

  attachSuggest(search, $('.place'), cfg, (p) => {
    if (!map) return;
    candidate = p;
    search.value = p.label;
    map.setCenter({ lat: p.lat, lng: p.lng });
    map.setZoom(17);
    say(p.label);
  });

  mine.addEventListener('click', () => {
    showErr('');
    mine.disabled = true;
    say(cfg.msg.locating);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mine.disabled = false;
        if (!map) return;
        candidate = null;
        map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        map.setZoom(17);
      },
      (e) => {
        mine.disabled = false;
        say(cfg.msg.hint);
        showErr(e.code === 1 ? cfg.msg.denied : cfg.msg.locErr);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });

  use.addEventListener('click', async () => {
    if (!map || !target) return;
    const t = target;
    const c = center();
    let p: Picked;
    if (candidate && near(candidate, c)) p = candidate;
    else {
      use.disabled = true;
      await lookup(c.lat, c.lng);
      use.disabled = false;
      // Closed (cancelled) or reopened for another field while the address loaded.
      if (target !== t) return;
      const name = found?.key === keyOf(c.lat, c.lng) ? found.name : '';
      // A dragged pin is the exact spot: no place id, so links open the pin, not the nearest address.
      p = { lat: c.lat, lng: c.lng, name: name || undefined, label: name || `${cfg.msg.point} (${c.lat}, ${c.lng})` };
    }
    t.apply(p);
    close();
  });

  return {
    async open(input: HTMLInputElement, label: string, kind: Kind, from: HTMLElement, apply: (p: Picked) => void) {
      target = { input, apply };
      opener = from;
      title.textContent = `${cfg.msg.title} · ${label}`;
      search.value = '';
      showErr('');
      use.hidden = false;
      use.disabled = false;
      mine.hidden = kind !== 'pickup' || !canLocate;
      say(cfg.msg.hint);
      document.documentElement.classList.add('mp-lock');
      if (!dialog.open) dialog.showModal();
      // Typing straight away is natural with a mouse; on phones the keyboard would cover the map.
      if (matchMedia('(pointer: fine)').matches) search.focus();
      else $<HTMLButtonElement>('[data-mp-close]').focus();
      try {
        const [{ Map }, { Geocoder }] = await Promise.all([lib('maps'), lib('geocoding')]);
        if (target?.input !== input) return;
        const p = pointOf(input);
        const start = p ? { lat: p.lat, lng: p.lng } : { lat: cfg.bias.lat, lng: cfg.bias.lng };
        candidate = p ? { ...p, label: input.value } : null;
        geocoder ||= new Geocoder();
        if (!map) {
          map = new Map(canvas, {
            center: start,
            zoom: p ? 17 : cfg.bias.zoom,
            // One finger pans the map inside the sheet (the page behind does not scroll).
            gestureHandling: 'greedy',
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: false,
          });
          map.addListener('dragstart', () => { candidate = null; });
          map.addListener('idle', onIdle);
        } else {
          map.setCenter(start);
          map.setZoom(p ? 17 : cfg.bias.zoom);
        }
        if (candidate) say(candidate.label);
      } catch {
        if (target?.input === input) {
          showErr(cfg.msg.fail);
          use.hidden = mine.hidden = true;
        }
      }
    },
  };
}

/** Wires one booking form. Returns null when the feature is off. */
export function enhance(form: HTMLFormElement): Picker | null {
  let cfg: Config;
  try {
    cfg = JSON.parse(form.dataset.maps || '');
  } catch {
    return null;
  }
  if (!cfg?.key) return null;
  offHandlers.push(() => form.classList.add('maps-off'));
  installLoader({ key: cfg.key, v: 'weekly', language: cfg.lang, region: 'ID' });
  // An invalid or restricted key: Google calls this once the script has loaded.
  const w = window as any;
  const prevAuth = w.gm_authFailure;
  w.gm_authFailure = () => {
    fail();
    if (typeof prevAuth === 'function') prevAuth();
  };
  // Start loading now (first touch of a field), so suggestions are ready by the third letter.
  lib('places').catch(() => {});
  if (broken) form.classList.add('maps-off');

  const fields = new Map<Kind, { input: HTMLInputElement; label: string; apply: (p: Picked | null) => void }>();
  for (const box of form.querySelectorAll<HTMLElement>('.place[data-place]')) {
    const kind = box.dataset.place as Kind;
    const input = box.querySelector<HTMLInputElement>('input')!;
    const chip = form.querySelector<HTMLElement>(`[data-place-chip=${kind}]`);
    const btn = box.querySelector<HTMLElement>('[data-place-map]');
    const apply = (p: Picked | null) => {
      if (p) input.value = p.label;
      setPoint(input, p && { lat: p.lat, lng: p.lng, placeId: p.placeId, name: p.name });
      if (chip) chip.hidden = !p;
      btn?.classList.toggle('on', !!p);
    };
    // Editing the text drops the point: text and point always match.
    input.addEventListener('input', () => { if (pointOf(input)) apply(null); });
    attachSuggest(input, box, cfg, apply);
    fields.set(kind, { input, label: form.querySelector(`label[for="${input.id}"]`)?.textContent?.trim() || '', apply });
  }

  const dialogEl = document.getElementById(cfg.dialog) as HTMLDialogElement | null;
  const dlg = dialogEl && typeof dialogEl.showModal === 'function' ? mapDialog(dialogEl, cfg) : null;
  if (!dlg) form.classList.add('maps-off');
  return {
    open(kind, opener) {
      const f = fields.get(kind);
      if (!f || !dlg || broken) return;
      dlg.open(f.input, f.label, kind, opener, f.apply);
    },
  };
}
