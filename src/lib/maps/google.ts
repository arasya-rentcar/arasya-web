/**
 * Google Maps Platform provider for the booking form's map picker
 * (PUBLIC_MAPS_PROVIDER=google + PUBLIC_GOOGLE_MAPS_KEY). Google's script is
 * added on the first use, never with the page.
 *
 * APIs used (restrict the key to exactly these): Maps JavaScript API (loader,
 * Map), Places API (New) (AutocompleteSuggestion, Place.fetchFields with
 * displayName/formattedAddress/location only) and Geocoding API (Geocoder,
 * reverse geocoding when the map stops moving).
 */
import { round6 } from '../placePoint';
import type { Place, Provider, ProviderOptions, Suggester, Suggestion } from './provider';

type GoogleSuggestion = Suggestion & { pred: any };

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

export function create(opts: ProviderOptions): Provider {
  installLoader({ key: opts.key || '', v: 'weekly', language: opts.lang, region: 'ID' });
  let failed = false;
  const fail = () => {
    if (failed) return;
    failed = true;
    opts.onFail();
  };
  // An invalid or restricted key: Google calls this once the script has loaded.
  const w = window as any;
  const prevAuth = w.gm_authFailure;
  w.gm_authFailure = () => {
    fail();
    if (typeof prevAuth === 'function') prevAuth();
  };
  const lib = (name: string): Promise<any> => {
    if (failed) return Promise.reject(new Error('maps off'));
    return w.google.maps.importLibrary(name).catch((e: unknown) => {
      fail();
      throw e;
    });
  };
  // Start loading now (first touch of a field), so suggestions are ready by the third letter.
  lib('places').catch(() => {});
  let geocoder: any = null;

  return {
    /** One session token per typing + choosing session (it ends with fetchFields on the chosen place). */
    suggester(): Suggester {
      let token: any = null;
      return {
        async suggest(text) {
          const { AutocompleteSuggestion, AutocompleteSessionToken } = await lib('places');
          token ||= new AutocompleteSessionToken();
          const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: text,
            sessionToken: token,
            language: opts.lang,
            region: 'id',
            // Bias, never restrict: the site also serves other cities and countries.
            locationBias: { center: { lat: opts.bias.lat, lng: opts.bias.lng }, radius: opts.bias.radius },
          });
          return (suggestions || [])
            .map((s: any) => s.placePrediction)
            .filter(Boolean)
            .slice(0, 5)
            .map((pred: any): GoogleSuggestion => ({
              main: pred.mainText?.text || pred.text?.text || '',
              sub: pred.secondaryText?.text || '',
              text: String(pred.text?.text || pred.mainText?.text || ''),
              pred,
            }));
        },
        async resolve(s) {
          const pred = (s as GoogleSuggestion).pred;
          token = null; // fetchFields below closes this session
          const place = pred.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
          if (!place.location) return null;
          return {
            lat: round6(place.location.lat()),
            lng: round6(place.location.lng()),
            name: String(place.displayName || pred.mainText?.text || ''),
            address: String(place.formattedAddress || ''),
            placeId: place.id || pred.placeId || null,
          } satisfies Place;
        },
      };
    },
    async reverse(p) {
      const { Geocoder } = await lib('geocoding');
      geocoder ||= new Geocoder();
      const { results } = await geocoder.geocode({ location: p, language: opts.lang });
      return String(results?.[0]?.formatted_address || '');
    },
    async createMap(el, center, zoom, on) {
      const [{ Map }] = await Promise.all([lib('maps'), lib('geocoding')]);
      const map = new Map(el, {
        center,
        zoom,
        // One finger pans the map inside the sheet (the page behind does not scroll).
        gestureHandling: 'greedy',
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      });
      map.addListener('dragstart', on.dragStart);
      // Google fires idle once the new map is ready, and after every move.
      map.addListener('idle', on.idle);
      return {
        getCenter() {
          const c = map.getCenter();
          return { lat: round6(c.lat()), lng: round6(c.lng()) };
        },
        setCenter(c, z) {
          map.setCenter(c);
          map.setZoom(z);
        },
      };
    },
  };
}
