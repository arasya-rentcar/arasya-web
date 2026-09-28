/**
 * Two languages: Indonesian at the root, English under /en.
 *
 * Interface copy lives here; page content lives in Sanity, where every
 * translatable document carries an optional `en` object with the same shape
 * as the fields it translates. An English page is only built when that
 * object is filled in, so a half-translated page never ships.
 */
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
  per12h: '12 jam dalam kota',
  allIn: 'All-in',
  rate: 'Tarif',
  askAdmin: 'Tanya admin',
  bookThis: 'Pesan unit ini',
  consultPrice: 'Konsultasi harga',
  consultNote: 'Harga menyesuaikan jadwal dan kebutuhan acara. Konsultasikan lewat WhatsApp.',
  waRent: (car: string, ctx = '') => `Halo Arasya, saya mau sewa ${car}${ctx ? ' ' + ctx : ''}. Tanggal: …, tujuan: …`,
  waConsult: (car: string, ctx = '') => `Halo Arasya, saya mau konsultasi harga ${car}${ctx ? ' ' + ctx : ''}. Tanggal: …, lokasi: …`,
  details: 'Detail unit',
  // hero + booking
  from: 'Mulai',
  per12hShort: '/ 12 jam dalam kota',
  heroChecks: (legal: string) => ['Sudah termasuk driver', `Rekening resmi ${legal}`, 'Admin WhatsApp 24 jam'],
  bkDate: 'Tanggal',
  bkPickup: 'Jemput di',
  bkPickupPh: 'Rumah, stasiun, hotel…',
  bkDest: 'Tujuan',
  bkDestPh: 'Kota tujuan, bandara, dalam kota…',
  bkUnit: 'Unit',
  bkHelp: 'Bantu pilihkan',
  bkSend: 'Kirim ke WhatsApp',
  bkMsg: { hello: 'Halo Arasya, saya mau sewa mobil.', date: 'Tanggal', pickup: 'Jemput di', dest: 'Tujuan', unit: 'Unit', help: 'mohon dibantu pilihkan', locale: 'id-ID' },
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
  per12h: '12 hours, in town',
  allIn: 'All-in',
  rate: 'Rate',
  askAdmin: 'On request',
  bookThis: 'Book this car',
  consultPrice: 'Ask for a quote',
  consultNote: 'Pricing depends on your schedule and event. Ask us on WhatsApp for a quote.',
  waRent: (car, ctx = '') => `Hi Arasya, I'd like to rent a ${car} with a driver${ctx ? ' ' + ctx : ''}. Date: …, destination: …`,
  waConsult: (car, ctx = '') => `Hi Arasya, I'd like a quote for a ${car}${ctx ? ' ' + ctx : ''}. Date: …, location: …`,
  details: 'Car details',
  from: 'From',
  per12hShort: '/ 12 hours in town',
  heroChecks: (legal) => ['Driver included', `Official ${legal} account`, '24-hour WhatsApp support'],
  bkDate: 'Date',
  bkPickup: 'Pick-up',
  bkPickupPh: 'Hotel, airport, address…',
  bkDest: 'Destination',
  bkDestPh: 'Any city, airport, in town…',
  bkUnit: 'Car',
  bkHelp: 'Help me choose',
  bkSend: 'Send on WhatsApp',
  bkMsg: { hello: "Hi Arasya, I'd like to rent a car with a driver.", date: 'Date', pickup: 'Pick-up', dest: 'Destination', unit: 'Car', help: 'please recommend one', locale: 'en-GB' },
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
