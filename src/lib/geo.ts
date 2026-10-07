/**
 * Where the booking form's place suggestions and map picker start. These are
 * rough, public city centres used only to *bias* suggestions (never to
 * restrict them) and to open the map near the page's city. Keyed by the city
 * `code` from Sanity; a city without an entry (or a page without a city) gets
 * Jabodetabek, where most bookings start.
 */
export interface MapBias { lat: number; lng: number; /** metres, max 50 000 for Places */ radius: number; zoom: number }

const JABODETABEK: MapBias = { lat: -6.35, lng: 106.82, radius: 50000, zoom: 10 };
const city = (lat: number, lng: number, radius = 25000, zoom = 12): MapBias => ({ lat, lng, radius, zoom });

const CITIES: Record<string, MapBias> = {
  BGR: city(-6.5971, 106.806),
  JKT: city(-6.2088, 106.8456, 30000),
  BDG: city(-6.9175, 107.6191),
  BKS: city(-6.2383, 106.9756),
  DPK: city(-6.4025, 106.7942),
  TNG: city(-6.1783, 106.6319),
  CBN: city(-6.732, 108.5523),
  PKL: city(-6.8886, 109.6753),
  SRG: city(-6.9667, 110.4167),
  SOC: city(-7.5755, 110.8243),
  JOG: city(-7.7956, 110.3695),
  MDN: city(-7.6298, 111.5239),
  SUB: city(-7.2575, 112.7521, 30000),
  MLG: city(-7.9666, 112.6326),
  SIN: city(1.3521, 103.8198, 30000, 11),
  MYS: city(3.139, 101.6869, 50000, 11),
  THA: city(13.7563, 100.5018, 50000, 11),
};

export const mapBias = (cityCode?: string): MapBias => (cityCode && CITIES[cityCode.toUpperCase()]) || JABODETABEK;
