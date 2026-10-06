/**
 * Two languages: Indonesian at the root, English under /en.
 *
 * Interface copy lives here; page content lives in Sanity, where every
 * translatable document carries an optional `en` object with the same shape
 * as the fields it translates. An English page is only built when that
 * object is filled in, so a half-translated page never ships.
 */
import { rupiah } from './format';
import type { PriceExtra, PriceSurcharge, PriceZone } from './prices';

export type Lang = 'id' | 'en';

export const langOf = (pathname: string): Lang => (pathname === '/en' || pathname.startsWith('/en/') || pathname.startsWith('/en.') ? 'en' : 'id');

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const isPortableText = (xs: any[]) => xs.some((x) => x?._type === 'block');
const empty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/**
 * Lay a document's `en` overrides on top of it. Objects merge key by key;
 * arrays take the English length and merge item by item, so an English
 * destination list inherits each photo from the Indonesian one. Rich text is
 * replaced wholesale.
 */
export function overlay<T>(base: T, over: any): T {
  if (empty(over)) return base;
  if (Array.isArray(over)) {
    if (!Array.isArray(base) || isPortableText(over)) return over as T;
    return over.map((item, i) => (isObj(item) && isObj(base[i]) ? overlay(base[i], item) : item)) as T;
  }
  if (isObj(over) && isObj(base)) {
    const out: any = { ...base };
    for (const [k, v] of Object.entries(over)) {
      if (k.startsWith('_')) continue;
      out[k] = overlay((base as any)[k], v);
    }
    return out;
  }
  return over as T;
}

export function localize<T extends Record<string, any>>(doc: T, lang: Lang): T {
  if (lang === 'id' || !doc?.en) return doc;
  const { en, ...rest } = doc;
  return overlay(rest as T, en);
}

export const ogLocale = (lang: Lang) => (lang === 'en' ? 'en_US' : 'id_ID');
export const htmlLang = (lang: Lang) => (lang === 'en' ? 'en' : 'id');
export const bcp47 = (lang: Lang) => (lang === 'en' ? 'en' : 'id-ID');

export const dateFmt = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

/** "A, B, dan C" / "A, B and C". */
export function listJoin(xs: string[], lang: Lang): string {
  if (xs.length < 2) return xs[0] || '';
  return `${xs.slice(0, -1).join(', ')}${lang === 'en' ? ' and ' : ', dan '}${xs[xs.length - 1]}`;
}

const id = {
  home: 'Beranda',
  skip: 'Langsung ke konten',
  navCities: 'Kota',
  navAllCities: 'Semua kota layanan',
  navAllCitiesShort: 'Semua kota',
  navFleet: 'Armada',
  navBlog: 'Blog',
  navBook: 'Pesan',
  navOpenMenu: 'Buka menu',
  navMain: 'Menu utama',
  toHome: (brand: string) => `${brand}, ke beranda`,
  call: 'Telepon',
  switchTo: 'English',
  switchLabel: 'Switch to English',
  waHello: 'Halo Arasya, saya mau tanya sewa mobil.',
  fabLabel: 'Chat WhatsApp admin Arasya',
  fab: 'Chat admin',
  footerAbout: (legal: string, city: string) => `Rental mobil dengan driver. Dikelola oleh ${legal}, berkantor di ${city}.`,
  contact: 'Kontak',
  wa24: 'WhatsApp admin 24 jam',
  officialAccount: 'Rekening resmi',
  footerWarn: 'Kami tidak pernah meminta transfer ke rekening pribadi.',
  footerVerify: 'Cek nomor & rekening resmi',
  services: 'Layanan',
  rentIn: (city: string) => `Sewa mobil ${city}`,
  fleetAndRates: 'Armada & tarif',
  // cars
  seats: (n: number) => `${n} kursi`,
  passengers: (cap?: number) => (cap ? `${cap - 1} penumpang + driver` : ''),
  category: { mpv: 'MPV', 'mpv-premium': 'MPV premium', suv: 'SUV', premium: 'Premium', van: 'Van & rombongan' } as Record<string, string>,
  allIn: 'All-in',
  rate: 'Tarif',
  askAdmin: 'Tanya admin',
  bookThis: 'Pesan unit ini',
  consultPrice: 'Konsultasi harga',
  consultNote: 'Harga menyesuaikan jadwal dan kebutuhan acara. Konsultasikan lewat WhatsApp.',
  waRent: (car: string, ctx = '') => `Halo Arasya, saya mau sewa ${car}${ctx ? ' ' + ctx : ''}. Tanggal: …, tujuan: …`,
  waConsult: (car: string, ctx = '') => `Halo Arasya, saya mau konsultasi harga ${car}${ctx ? ' ' + ctx : ''}. Tanggal: …, lokasi: …`,
  details: 'Detail unit',
  // price list (published from the dashboard; numbers and table texts come from the API)
  pkgDriver: 'Mobil + supir',
  pkgDriverTitle: 'Mobil + Supir',
  pkgAllInTitle: 'All-in (kecuali parkir)',
  /** Short area of each table, by table code (unknown codes show the table name). */
  zoneArea: { JABODETABEK: 'Jabodetabek', LUAR_KOTA: 'luar Jabodetabek', JAKARTA: 'Jakarta', BANDUNG: 'Bandung', SURABAYA: 'Surabaya & kota lain' } as Record<string, string>,
  /** A table's name: "Mobil + Supir Jabodetabek", "All-in Jakarta". */
  zoneTitle: (pkg: string, area: string) => `${pkg} ${area}`,
  colCar: 'Unit',
  col12h: '12 jam',
  colFullday: 'Fullday',
  per12: '/ 12 jam',
  /** Label above a "mulai" price: "Mobil + supir (Jabodetabek), mulai". */
  fromLbl: (pkg: string, area: string) => `${pkg} (${area}), mulai`,
  fromDriver: (price: string, area: string) => `Mobil + supir mulai ${price} / 12 jam (${area})`,
  fromAllIn: (price: string, area: string) => `All-in mulai ${price} / 12 jam (${area})`,
  heroFrom: (area?: string) => `/ 12 jam, mobil + supir${area ? ` (${area})` : ''}`,
  included: 'Sudah termasuk',
  excluded: 'Belum termasuk',
  zonesLbl: 'Wilayah',
  // Table texts, extras and notes come from the price list (Indonesian); English maps them by code.
  zoneIncluded: (z: PriceZone) => z.included,
  zoneExcluded: (z: PriceZone) => z.excluded,
  zoneNote: (z: PriceZone) => z.note || '',
  extraLabel: (_code: string, e: PriceExtra) => e.label,
  /** "Rp100.000 per hari. Paket Mobil + Supir." */
  extraValue: (_code: string, e: PriceExtra) => (e.amount ? `${rupiah(e.amount)} per ${e.unit}.${e.note ? ` ${e.note}` : ''}` : ''),
  overtime: (pct: number) => `${pct}% dari tarif Fullday per jam, berlaku bila melebihi durasi atau lewat pukul 23.00.`,
  durationLbl: 'Durasi',
  durations: '12 jam dihitung dari jam jemput. Fullday: pukul 06.00–23.00.',
  surcharges: (city: string, xs: PriceSurcharge[]) => `Tambahan bila pemakaian ${city} diperluas ke: ${xs.map((s) => `${s.area} ${rupiah(s.amount)}`).join(', ')}.`,
  ratesUpdated: (date: string) => `Tarif diperbarui ${date}.`,
  ratesPerCity: 'Harga “mulai” per 12 jam. Tarif lengkap tiap kota ada di halaman kotanya.',
  termsLink: 'Ketentuan pemesanan →',
  // city page rates
  cityRatesEyebrow: (city: string) => `Armada & tarif ${city}`,
  cityRatesTitle: (city: string) => `Tarif sewa mobil di ${city}`,
  compareCars: 'Bandingkan semua unit →',
  tableCaption: (pkg: string, city: string) => `${pkg}: tarif sewa mobil dengan driver di ${city}`,
  cityAnswer: (o: { city: string; pickup: string; driver?: { price: string; car: string }; allIn?: { price: string } }) => [
    o.driver
      ? `Sewa mobil dengan driver di ${o.city} mulai ${o.driver.price} per 12 jam untuk paket mobil + supir (${o.driver.car}), belum termasuk BBM, tol, parkir, dan makan driver.`
      : `Tarif sewa mobil dengan driver di ${o.city} dikonfirmasi admin sesuai unit dan perjalanan.`,
    o.allIn ? `Paket all-in mulai ${o.allIn.price} (12 jam, sudah termasuk BBM, tol, dan makan driver; parkir dibayar terpisah).` : '',
    `Penjemputan di ${o.pickup}.`,
  ].filter(Boolean).join(' '),
  // car page rates
  carRatesTitle: (car: string) => `Tarif sewa ${car}`,
  carTableCaption: (car: string) => `Tarif sewa ${car} per paket dan wilayah`,
  colPackage: 'Paket & wilayah',
  quotedPerTrip: 'Sesuai perjalanan',
  carAnswer: (o: { car: string; driver?: { price: string; area: string }; allIn?: { price: string; area: string } }) =>
    o.driver || o.allIn
      ? [
          o.driver ? `Mobil + supir mulai ${o.driver.price} per 12 jam (${o.driver.area}), sudah termasuk driver; BBM, tol, parkir, dan makan driver dibayar terpisah.` : '',
          o.allIn ? `All-in mulai ${o.allIn.price} per 12 jam (${o.allIn.area}), sudah termasuk BBM, tol, dan makan driver; parkir dibayar terpisah.` : 'Paket all-in untuk unit ini: tanya admin.',
          'Tarif tiap wilayah ada di tabel di bawah.',
        ].filter(Boolean).join(' ')
      : `Tarif ${o.car} dihitung per perjalanan, menyesuaikan tanggal, durasi, dan rute. Kirim detailnya lewat WhatsApp untuk penawaran tertulis.`,
  // fleet page
  fleetAnswer: (o: { cats: string; range?: { lo: string; loCar: string; hi: string; hiCar: string; area: string }; allIn?: { price: string; area: string } }) => [
    `Semua unit disewakan bersama driver, dari ${o.cats}.`,
    o.range ? `Mobil + supir di ${o.range.area} mulai ${o.range.lo} (${o.range.loCar}) sampai ${o.range.hi} (${o.range.hiCar}) per 12 jam.` : '',
    o.allIn ? `All-in mulai ${o.allIn.price} per 12 jam (${o.allIn.area}).` : '',
    'Tarif tiap kota ada di halaman kotanya. Yang tampil di sini adalah tipe unit yang paling sering dipesan; unit lain bisa di-request ke admin.',
  ].filter(Boolean).join(' '),
  // hero + booking
  from: 'Mulai',
  heroChecks: (legal: string) => ['Sudah termasuk driver', `Rekening resmi ${legal}`, 'Admin WhatsApp 24 jam'],
  bkDate: 'Tanggal',
  bkPickup: 'Jemput di',
  bkPickupPh: 'Alamat Jl. / Rumah / Stasiun / Hotel',
  bkDest: 'Tujuan',
  bkDestPh: 'Kota tujuan, bandara, dalam kota…',
  bkUnit: 'Tipe mobil',
  bkHelp: 'Bantu pilihkan',
  bkSend: 'Kirim ke WhatsApp',
  bkName: 'Nama',
  bkNamePh: 'Nama pemesan',
  bkTime: 'Jam jemput',
  bkMore: 'Tambah detail (opsional)',
  bkPax: 'Jumlah penumpang',
  bkDuration: 'Lama sewa',
  bkDurations: ['Belum tahu', '12 jam dalam kota', 'All-in (BBM, tol, makan driver)', '1 Kali Drop Only ke 1 Tujuan', 'Pulang-pergi', 'Beberapa hari'],
  bkNotes: 'Catatan',
  bkNotesPh: 'Mis. bawa 3 koper, butuh kursi bayi, nomor penerbangan…',
  bkHint: 'Data ini kami kirim ke WhatsApp admin supaya admin langsung bisa mengecek unit dan tarif.',
  bkMsg: { hello: 'Halo Arasya, saya mau pesan mobil dengan driver.', code: 'Kode pesanan', name: 'Nama', date: 'Tanggal', time: 'Jam jemput', pickup: 'Jemput di', dest: 'Tujuan', unit: 'Tipe mobil', pax: 'Jumlah penumpang', duration: 'Lama sewa', notes: 'Catatan', help: 'mohon dibantu pilihkan', locale: 'id-ID' },
  // shared sections
  faqTitle: 'Pertanyaan yang sering diajukan',
  trustTitle: 'Kenapa memilih Arasya',
  trustEyebrow: 'Layanan kami',
  reviewsEyebrow: 'Ulasan Google',
  reviewsTitle: 'Kata pelanggan kami',
  reviewsStars: '5 bintang',
  seeReview: 'Lihat ulasan',
  stepsEyebrow: 'Langkah',
  stepsTitle: 'Cara pesan',
  bandBtn: 'Chat admin sekarang',
  bandCall: (p: string) => `atau telepon ${p}`,
  // fraud
  fraudTitle: 'Waspada penipuan yang mengatasnamakan Arasya',
  officialPhones: 'Nomor resmi',
  watchOut: 'Yang perlu diwaspadai',
  copy: 'Salin',
  copied: 'Tersalin',
  copyPhone: (p: string) => `Salin nomor ${p}`,
  copyAcc: (b: string) => `Salin nomor rekening ${b}`,
  fraudMore: 'Cara memastikan nomor dan rekening resmi →',
  // language banner
  bannerText: 'Halaman ini tersedia dalam Bahasa Indonesia.',
  bannerGo: 'Buka versi Indonesia',
  bannerStay: 'Tetap di sini',
};

type Dict = typeof id;

// English for the price list's Indonesian texts, by package / table / extra code.
// Numbers always come from the price list; update these if the dashboard texts change.
const PACKAGE_EN: Record<string, { included: string; excluded: string }> = {
  XOPS: { included: 'The car and the driver.', excluded: 'Fuel, tolls, parking/entrance tickets and the driver’s meals. Tips are up to you.' },
  'ALL-IN X PARKIR': { included: 'The car, the driver, fuel, tolls and the driver’s meals.', excluded: 'Parking/entrance tickets. Tips are up to you.' },
};
const ZONE_NOTE_EN: Record<string, string> = {
  LUAR_KOTA: 'Out-of-town trips that end where they started, and hires in cities outside Greater Jakarta.',
  SURABAYA: 'Also used in other cities without a table of their own.',
};
const EXTRA_EN: Record<string, { label: string; unit?: string; note?: string }> = {
  DRIVER_MEAL: { label: 'Driver’s meals', unit: 'day', note: 'Car + driver package.' },
  DRIVER_LODGING: { label: 'Driver’s overnight stay', unit: 'night', note: 'Out-of-town trips with an overnight stay.' },
  OVERTIME: { label: 'Overtime' },
};

const en: Dict = {
  home: 'Home',
  skip: 'Skip to content',
  navCities: 'Cities',
  navAllCities: 'All service cities',
  navAllCitiesShort: 'All cities',
  navFleet: 'Fleet',
  navBlog: 'Blog',
  navBook: 'Book',
  navOpenMenu: 'Open menu',
  navMain: 'Main menu',
  toHome: (brand) => `${brand}, home`,
  call: 'Call',
  switchTo: 'Indonesia',
  switchLabel: 'Ganti ke Bahasa Indonesia',
  waHello: "Hi Arasya, I'd like to ask about renting a car with a driver.",
  fabLabel: 'Chat with Arasya on WhatsApp',
  fab: 'Chat with us',
  footerAbout: (legal, city) => `Car rental with a professional driver. Operated by ${legal}, based in ${city}, Indonesia.`,
  contact: 'Contact',
  wa24: 'WhatsApp support, 24 hours',
  officialAccount: 'Official bank account',
  footerWarn: 'We never ask you to pay into a personal account.',
  footerVerify: 'Check our official numbers & account',
  services: 'Services',
  rentIn: (city) => `Car rental in ${city}`,
  fleetAndRates: 'Fleet & rates',
  seats: (n) => `${n} seats`,
  passengers: (cap) => (cap ? `${cap - 1} passengers + driver` : ''),
  category: { mpv: 'MPV', 'mpv-premium': 'Premium MPV', suv: 'SUV', premium: 'Luxury', van: 'Van & group' },
  allIn: 'All-in',
  rate: 'Rate',
  askAdmin: 'On request',
  bookThis: 'Book this car',
  consultPrice: 'Ask for a quote',
  consultNote: 'Pricing depends on your schedule and event. Ask us on WhatsApp for a quote.',
  waRent: (car, ctx = '') => `Hi Arasya, I'd like to rent a ${car} with a driver${ctx ? ' ' + ctx : ''}. Date: …, destination: …`,
  waConsult: (car, ctx = '') => `Hi Arasya, I'd like a quote for a ${car}${ctx ? ' ' + ctx : ''}. Date: …, location: …`,
  details: 'Car details',
  pkgDriver: 'Car + driver',
  pkgDriverTitle: 'Car + driver',
  pkgAllInTitle: 'All-in (parking extra)',
  zoneArea: { JABODETABEK: 'Greater Jakarta', LUAR_KOTA: 'outside Greater Jakarta', JAKARTA: 'Jakarta', BANDUNG: 'Bandung', SURABAYA: 'Surabaya & other cities' },
  zoneTitle: (pkg, area) => `${pkg}, ${area}`,
  colCar: 'Car',
  col12h: '12 hours',
  colFullday: 'Full day',
  per12: '/ 12 hours',
  fromLbl: (pkg, area) => `${pkg} (${area}), from`,
  fromDriver: (price, area) => `Car + driver from ${price} / 12 hours (${area})`,
  fromAllIn: (price, area) => `All-in from ${price} / 12 hours (${area})`,
  heroFrom: (area) => `/ 12 hours, car + driver${area ? ` (${area})` : ''}`,
  included: 'Included',
  excluded: 'Not included',
  zonesLbl: 'Areas',
  zoneIncluded: (z) => PACKAGE_EN[z.service_package]?.included ?? z.included,
  zoneExcluded: (z) => PACKAGE_EN[z.service_package]?.excluded ?? z.excluded,
  zoneNote: (z) => ZONE_NOTE_EN[z.code] ?? z.note ?? '',
  extraLabel: (code, e) => EXTRA_EN[code]?.label ?? e.label,
  extraValue: (code, e) => {
    if (!e.amount) return '';
    const x = EXTRA_EN[code];
    return `${rupiah(e.amount)} per ${x?.unit ?? e.unit}.${x?.note ? ` ${x.note}` : e.note ? ` ${e.note}` : ''}`;
  },
  overtime: (pct) => `${pct}% of the full-day rate per hour, if you go past the booked hours or past 23:00.`,
  durationLbl: 'Duration',
  durations: '12 hours are counted from pick-up. A full day runs from 06:00 to 23:00.',
  surcharges: (city, xs) => `Extra charge if your ${city} hire extends to: ${xs.map((s) => `${s.area} ${rupiah(s.amount)}`).join(', ')}.`,
  ratesUpdated: (date) => `Rates updated ${date}.`,
  ratesPerCity: '“From” prices are per 12 hours. Each city page lists its full rates.',
  termsLink: 'Booking terms →',
  cityRatesEyebrow: () => 'Fleet & rates',
  cityRatesTitle: (city) => `Car rental rates in ${city}`,
  compareCars: 'Compare all cars →',
  tableCaption: (pkg, city) => `${pkg}: car rental rates with a driver in ${city}`,
  cityAnswer: (o) => [
    o.driver
      ? `Car rental with a driver in ${o.city} starts at ${o.driver.price} for 12 hours with the car + driver package (${o.driver.car}); fuel, tolls, parking and the driver’s meals are extra.`
      : `We confirm car rental rates in ${o.city} for your car and trip.`,
    o.allIn ? `All-in starts at ${o.allIn.price} (12 hours, fuel, tolls and the driver’s meals included; parking extra).` : '',
    `We pick up anywhere in ${o.pickup}.`,
  ].filter(Boolean).join(' '),
  carRatesTitle: (car) => `${car} rates`,
  carTableCaption: (car) => `${car} rates by package and area`,
  colPackage: 'Package & area',
  quotedPerTrip: 'Quoted per trip',
  carAnswer: (o) =>
    o.driver || o.allIn
      ? [
          o.driver ? `Car + driver from ${o.driver.price} for 12 hours (${o.driver.area}); fuel, tolls, parking and the driver’s meals are paid separately.` : '',
          o.allIn ? `All-in from ${o.allIn.price} for 12 hours (${o.allIn.area}), covering fuel, tolls and the driver’s meals; parking is extra.` : 'All-in for this car: ask us for a quote.',
          'The table below lists the rate for each area.',
        ].filter(Boolean).join(' ')
      : `The ${o.car} is quoted per trip, depending on date, duration and route. Send us the details on WhatsApp for a written quote.`,
  fleetAnswer: (o) => [
    `Every car comes with a driver, across ${o.cats}.`,
    o.range ? `Car + driver in ${o.range.area} costs from ${o.range.lo} (${o.range.loCar}) to ${o.range.hi} (${o.range.hiCar}) for 12 hours.` : '',
    o.allIn ? `All-in starts at ${o.allIn.price} for 12 hours (${o.allIn.area}).` : '',
    'Each city page lists its own rates. These are our most-booked types; ask us for anything else.',
  ].filter(Boolean).join(' '),
  from: 'From',
  heroChecks: (legal) => ['Driver included', `Official ${legal} account`, '24-hour WhatsApp support'],
  bkDate: 'Date',
  bkPickup: 'Pick-up',
  bkPickupPh: 'Street address / home / station / hotel',
  bkDest: 'Destination',
  bkDestPh: 'Any city, airport, in town…',
  bkUnit: 'Car type',
  bkHelp: 'Help me choose',
  bkSend: 'Send on WhatsApp',
  bkName: 'Name',
  bkNamePh: 'Your name',
  bkTime: 'Pick-up time',
  bkMore: 'Add details (optional)',
  bkPax: 'Passengers',
  bkDuration: 'Hire type',
  bkDurations: ['Not sure yet', '12 hours in town', 'All-in (fuel, tolls, meals)', 'Single drop-off, one destination', 'Return trip', 'Several days'],
  bkNotes: 'Notes',
  bkNotesPh: 'E.g. 3 suitcases, child seat, flight number…',
  bkHint: 'We send this to our WhatsApp team so they can check the car and price straight away.',
  bkMsg: { hello: "Hi Arasya, I'd like to book a car with a driver.", code: 'Booking code', name: 'Name', date: 'Date', time: 'Pick-up time', pickup: 'Pick-up', dest: 'Destination', unit: 'Car type', pax: 'Passengers', duration: 'Hire type', notes: 'Notes', help: 'please recommend one', locale: 'en-GB' },
  faqTitle: 'Frequently asked questions',
  trustTitle: 'Why travel with Arasya',
  trustEyebrow: 'Our service',
  reviewsEyebrow: 'Google reviews',
  reviewsTitle: 'What our customers say',
  reviewsStars: '5 stars',
  seeReview: 'See review',
  stepsEyebrow: 'Steps',
  stepsTitle: 'How to book',
  bandBtn: 'Chat with us now',
  bandCall: (p) => `or call ${p}`,
  fraudTitle: 'Beware of scams using the Arasya name',
  officialPhones: 'Official numbers',
  watchOut: 'Red flags',
  copy: 'Copy',
  copied: 'Copied',
  copyPhone: (p) => `Copy number ${p}`,
  copyAcc: (b) => `Copy ${b} account number`,
  fraudMore: 'How to check our official numbers and account →',
  bannerText: 'This page is available in English.',
  bannerGo: 'View in English',
  bannerStay: 'Stay in Indonesian',
};

export const ui = (lang: Lang): Dict => (lang === 'en' ? en : id);
