const idr = new Intl.NumberFormat('id-ID');

export const rupiah = (n: number) => 'Rp' + idr.format(n);

/** "Rp500rb", "Rp1,5jt" for tight spots like cards. */
export function rupiahShort(n: number): string {
  if (n >= 1_000_000) return 'Rp' + (n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + 'jt';
  if (n >= 1_000) return 'Rp' + Math.round(n / 1_000) + 'rb';
  return rupiah(n);
}

export const dateId = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const CATEGORY_LABEL: Record<string, string> = {
  mpv: 'MPV',
  'mpv-premium': 'MPV premium',
  suv: 'SUV',
  premium: 'Premium',
  van: 'Van & rombongan',
};

/** Capacity in the data includes the driver. */
export const passengers = (capacity?: number) => (capacity ? `${capacity - 1} penumpang + driver` : '');
