/**
 * The point a visitor chose for the booking form's pick-up or destination
 * field (browser only). It lives on the input element itself, never in
 * storage, and is cleared as soon as the visitor edits the text, so the text
 * and the point always describe the same place.
 */
export interface PlacePoint {
  lat: number;
  lng: number;
  /** Google place id; only when the visitor chose a Google suggestion (never with OSM). */
  placeId?: string;
  /** Place name (suggestion) or the address found for a map point. */
  name?: string;
}

type WithPoint = HTMLInputElement & { arasyaPoint?: PlacePoint };

/**
 * Finite WGS84 coordinates in range. Checked when a point is stored and when it
 * is read, so a provider bug can never put NaN or an impossible point into the
 * WhatsApp link, the lead or the map (the text is still sent as typed).
 */
export const isValidPoint = (p: Partial<PlacePoint> | null | undefined): p is PlacePoint =>
  !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat!) <= 90 && Math.abs(p.lng!) <= 180;

export const pointOf = (input: Element | null | undefined): PlacePoint | undefined => {
  const p = (input as WithPoint | null)?.arasyaPoint;
  return isValidPoint(p) ? p : undefined;
};

export const setPoint = (input: HTMLInputElement, point: PlacePoint | null) => {
  (input as WithPoint).arasyaPoint = isValidPoint(point) ? point : undefined;
};

/** About 10 cm: plenty for a pick-up point, and short in links. */
export const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/** Official Maps URLs search link (opens the app on phones). */
export const mapsLink = (p: PlacePoint) =>
  `https://www.google.com/maps/search/?api=1&query=${p.lat}%2C${p.lng}` + (p.placeId ? `&query_place_id=${encodeURIComponent(p.placeId)}` : '');
