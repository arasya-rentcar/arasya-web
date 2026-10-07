/**
 * Place suggestions and the map picker for the booking form, independent of
 * the map provider (maps/provider.ts; maps/osm.ts or maps/google.ts, chosen at
 * build time by PUBLIC_MAPS_PROVIDER). BookingBar imports this module and the
 * provider only when the feature is on, and only once the visitor first
 * touches the pick-up or destination field or a map button; nothing loads
 * with the page.
 *
 * Everything here is an extra: free text is always accepted, and if the
 * provider cannot load, rejects us or errors three times in a row, the form
 * keeps working exactly as without it (the map buttons disappear, nothing
 * blocks sending).
 *
 * Location data is personal data: nothing here logs, stores or sends it
 * anywhere except to the provider for the lookup itself; the chosen point
 * stays on the input element (placePoint.ts) until the form is sent.
 */
import type { MapBias } from './geo';
import { labelOf, type LatLng, type MapView, type Provider, type ProviderOptions, type Suggestion } from './maps/provider';
import { pointOf, round6, setPoint, type PlacePoint } from './placePoint';

type Kind = 'pickup' | 'dest';
type Msg = Record<string, string>;
interface Config { provider: string; key?: string; lang: string; bias: MapBias; msg: Msg; dialog: string }
/** A chosen place, plus the text the field shows for it. */
type Picked = PlacePoint & { label: string };
export interface Picker { open(kind: Kind, opener: HTMLElement): void }
export interface ProviderModule { create(opts: ProviderOptions): Provider }

const MAX_TEXT = 300;
let broken = false;
const offHandlers: (() => void)[] = [];
const fail = () => {
  if (broken) return;
  broken = true;
  offHandlers.forEach((f) => f());
};
// Provider errors in a row (network, throttled, down); the third turns the extras off.
let strikes = 0;
const ok = () => { strikes = 0; };
const strike = (e: unknown) => {
  if ((e as Error)?.name === 'AbortError') return;
  if (++strikes >= 3) fail();
};

const clip = (s: string) => s.slice(0, MAX_TEXT);

/**
 * ARIA combobox on a text input: suggestions after 3 characters, 300 ms after
 * the last keystroke, at most 5; newer typing aborts a lookup in flight.
 */
function attachSuggest(input: HTMLInputElement, box: HTMLElement, cfg: Config, provider: Provider, onPick: (p: Picked) => void) {
  const pop = box.querySelector<HTMLElement>('.place-pop')!;
  const list = pop.querySelector<HTMLUListElement>('[role=listbox]')!;
  const live = box.querySelector<HTMLElement>('[data-place-live]');
  const suggester = provider.suggester();
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', list.id);
  // The browser's own address autofill list would cover ours.
  input.setAttribute('autocomplete', 'off');
  let items: Suggestion[] = [];
  let active = -1;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;
  let inflight: AbortController | null = null;

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
        name.textContent = p.main;
        const sub = document.createElement('span');
        sub.textContent = p.sub;
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
  // Drop a pending or in-flight lookup: its answer is for older text.
  const cancel = () => {
    clearTimeout(timer);
    seq++;
    inflight?.abort();
    inflight = null;
  };
  const query = async () => {
    const text = input.value.trim();
    const my = ++seq;
    if (text.length < 3 || broken) return close();
    const ctl = (inflight = new AbortController());
    try {
      const found = await suggester.suggest(text, ctl.signal);
      ok();
      if (my !== seq || document.activeElement !== input) return;
      items = found.slice(0, 5);
      render();
    } catch (e) {
      strike(e);
      if (my === seq) close();
    } finally {
      if (inflight === ctl) inflight = null;
    }
  };
  const pick = async (i: number) => {
    const s = items[i];
    if (!s) return;
    // Its answer would reopen the list (and could put another place's text next to this point).
    cancel();
    close();
    input.value = clip(s.text || s.main);
    const shown = input.value;
    try {
      const place = await suggester.resolve(s);
      ok();
      // The visitor kept typing meanwhile: their text wins.
      if (input.value !== shown || !place) return;
      const name = place.name || s.main;
      onPick({
        lat: place.lat,
        lng: place.lng,
        placeId: place.placeId || undefined,
        name: clip(name),
        label: clip(labelOf(name, place.address)),
      });
    } catch (e) {
      strike(e);
    }
  };

  input.addEventListener('input', () => {
    cancel();
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
  // Keep focus in the field while tapping a suggestion (the attribution link still works).
  const keep = (e: Event) => { if (!(e.target as Element).closest('a')) e.preventDefault(); };
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
function mapDialog(dialog: HTMLDialogElement, cfg: Config, provider: Provider) {
  const $ = <T extends Element = HTMLElement>(s: string) => dialog.querySelector(s) as T;
  const title = $('[data-mp-title]');
  const canvas = $('[data-mp-canvas]');
  const addr = $('[data-mp-addr]');
  const err = $('[data-mp-err]');
  const use = $<HTMLButtonElement>('[data-mp-use]');
  const mine = $<HTMLButtonElement>('[data-mp-mine]');
  const search = $<HTMLInputElement>('[data-mp-search]');
  const canLocate = 'geolocation' in navigator;
  let view: MapView | null = null;
  let viewReady: Promise<MapView> | null = null;
  let target: { input: HTMLInputElement; apply: (p: Picked) => void } | null = null;
  let opener: HTMLElement | null = null;
  // A suggested place the map was moved to (keeps its name and id while the map stays there).
  let candidate: Picked | null = null;
  // The last reverse-geocoded centre.
  let found: { key: string; name: string; done: Promise<void> } | null = null;
  let geoSeq = 0;
  let geoCtl: AbortController | null = null;

  const say = (text: string) => { addr.textContent = text; };
  const showErr = (text: string) => { err.textContent = text; err.hidden = !text; };
  const keyOf = (lat: number, lng: number) => `${round6(lat)},${round6(lng)}`;
  const near = (a: LatLng, b: LatLng) => Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lng - b.lng) < 1e-5;

  // Reverse geocode once per stop (idle), never while the map moves; a newer stop aborts an older lookup.
  const lookup = (lat: number, lng: number) => {
    const key = keyOf(lat, lng);
    if (found?.key === key) return found.done;
    const my = ++geoSeq;
    geoCtl?.abort();
    const ctl = (geoCtl = new AbortController());
    const entry = { key, name: '', done: Promise.resolve() };
    found = entry;
    say(cfg.msg.finding);
    entry.done = (async () => {
      try {
        entry.name = clip(await provider.reverse({ lat, lng }, ctl.signal));
        ok();
      } catch (e) {
        strike(e);
      }
      if (my === geoSeq) say(entry.name || cfg.msg.noAddr);
    })();
    return entry.done;
  };
  const onIdle = () => {
    if (!view) return;
    const c = view.getCenter();
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

  attachSuggest(search, $('.place'), cfg, provider, (p) => {
    if (!view) return;
    candidate = p;
    search.value = p.label;
    view.setCenter(p, 17);
    say(p.label);
  });

  mine.addEventListener('click', () => {
    showErr('');
    mine.disabled = true;
    say(cfg.msg.locating);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mine.disabled = false;
        if (!view) return;
        candidate = null;
        view.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 17);
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
    if (!view || !target) return;
    const t = target;
    const c = view.getCenter();
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
      const p = pointOf(input);
      const start = p ? { lat: p.lat, lng: p.lng } : { lat: cfg.bias.lat, lng: cfg.bias.lng };
      const zoom = p ? 17 : cfg.bias.zoom;
      candidate = p ? { ...p, label: input.value } : null;
      try {
        // The first open creates the map at the start point; later opens move it there.
        const fresh = !viewReady;
        viewReady ||= provider.createMap(canvas, start, zoom, { dragStart: () => { candidate = null; }, idle: onIdle });
        view = await viewReady;
        if (target?.input !== input) return;
        if (!fresh) view.setCenter(start, zoom);
        if (candidate) say(candidate.label);
      } catch {
        viewReady = null;
        // No map at all: the same as a provider that cannot load.
        fail();
        if (target?.input === input) {
          showErr(cfg.msg.fail);
          use.hidden = mine.hidden = true;
        }
      }
    },
  };
}

/** Wires one booking form with the configured provider. Returns null when the feature is off. */
export function enhance(form: HTMLFormElement, mod: ProviderModule): Picker | null {
  let cfg: Config;
  try {
    cfg = JSON.parse(form.dataset.maps || '');
  } catch {
    return null;
  }
  if (!cfg?.provider) return null;
  offHandlers.push(() => form.classList.add('maps-off'));
  let provider: Provider;
  try {
    provider = mod.create({ lang: cfg.lang, bias: cfg.bias, msg: cfg.msg, key: cfg.key, onFail: fail });
  } catch {
    fail();
    return null;
  }
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
    attachSuggest(input, box, cfg, provider, apply);
    fields.set(kind, { input, label: form.querySelector(`label[for="${input.id}"]`)?.textContent?.trim() || '', apply });
  }

  const dialogEl = document.getElementById(cfg.dialog) as HTMLDialogElement | null;
  const dlg = dialogEl && typeof dialogEl.showModal === 'function' ? mapDialog(dialogEl, cfg, provider) : null;
  if (!dlg) form.classList.add('maps-off');
  return {
    open(kind, opener) {
      const f = fields.get(kind);
      if (!f || !dlg || broken) return;
      dlg.open(f.input, f.label, kind, opener, f.apply);
    },
  };
}
