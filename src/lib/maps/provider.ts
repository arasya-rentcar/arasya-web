/**
 * What the booking form's place suggestions and map picker (mapsPicker.ts)
 * need from a map provider. Two implementations, each loaded lazily and only
 * the one the build is configured for (PUBLIC_MAPS_PROVIDER): google.ts and
 * osm.ts. Coordinates are WGS84 in both, so a chosen point means the same
 * spot whichever provider found it.
 */
import type { MapBias } from '../geo';

export interface LatLng { lat: number; lng: number }

/** One row of the suggestion list (providers add their own data to it). */
export interface Suggestion {
  /** Bold first line: the place name. */
  main: string;
  /** Grey second line: short address. */
  sub: string;
  /** Text put into the field straight away when the row is chosen. */
  text: string;
}

/** A chosen place. placeId is Google's place id, null for other providers. */
export interface Place extends LatLng { name: string; address: string; placeId: string | null }

/** Suggestions for one text field. Google ties requests to a session per field. */
export interface Suggester {
  /** At most 5 suggestions. May ignore the signal (stale answers are dropped by the caller). */
  suggest(text: string, signal: AbortSignal): Promise<Suggestion[]>;
  /** Coordinates (and details) of a suggestion from this suggester; null if it has none. */
  resolve(s: Suggestion): Promise<Place | null>;
}

export interface MapView {
  getCenter(): LatLng;
  setCenter(c: LatLng, zoom: number): void;
}

export interface MapEvents {
  /** The visitor started dragging the map. */
  dragStart(): void;
  /** The map stopped moving (after a drag, zoom or setCenter). */
  idle(): void;
}

export interface Provider {
  suggester(): Suggester;
  /** Address text of a point, '' when none is known. */
  reverse(p: LatLng, signal: AbortSignal): Promise<string>;
  createMap(el: HTMLElement, center: LatLng, zoom: number, on: MapEvents): Promise<MapView>;
}

/** "Name, address", or just one of them when the address already starts with the name. */
export const labelOf = (name: string, address: string) => {
  if (!name) return address;
  if (!address || address.toLowerCase().startsWith(name.toLowerCase())) return address || name;
  return `${name}, ${address}`;
};

export interface ProviderOptions {
  lang: string;
  bias: MapBias;
  /** UI strings (ui(lang).bkMap). */
  msg: Record<string, string>;
  /** Google browser key (Google only). */
  key?: string;
  /** The provider cannot work at all (script or key rejected): the caller turns the extras off. */
  onFail(): void;
}
