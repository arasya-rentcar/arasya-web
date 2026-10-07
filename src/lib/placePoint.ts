/**
 * The point a visitor chose for the booking form's pick-up or destination
 * field (browser only). It lives on the input element itself, never in
 * storage, and is cleared as soon as the visitor edits the text, so the text
 * and the point always describe the same place.
 */
export interface PlacePoint {
  lat: number;
  lng: number;
  /** Google place id; only when the visitor chose a suggested place. */
  placeId?: string;
  /** Place name (suggestion) or the address found for a map point. */
  name?: string;
}

type WithPoint = HTMLInputElement & { arasyaPoint?: PlacePoint };

export const pointOf = (input: Element | null | undefined): PlacePoint | undefined => (input as WithPoint | null)?.arasyaPoint;

export const setPoint = (input: HTMLInputElement, point: PlacePoint | null) => {
  (input as WithPoint).arasyaPoint = point || undefined;
};

/** About 10 cm: plenty for a pick-up point, and short in links. */
export const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/** Official Maps URLs search link (opens the app on phones). */
export const mapsLink = (p: PlacePoint) =>
  `https://www.google.com/maps/search/?api=1&query=${p.lat}%2C${p.lng}` + (p.placeId ? `&query_place_id=${encodeURIComponent(p.placeId)}` : '');
