/**
 * /llms.txt: a plain-text fact sheet for AI assistants (the llmstxt.org
 * convention). Generated from the same content as the pages, so prices and
 * contact details never drift from what the site shows.
 */
import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { rupiah } from '../lib/format';
import { ui } from '../lib/i18n';
import { paths } from '../lib/paths';
import { allInZones, cheapest, cityTables, driverZones, fromPrices, publishedDate, surchargesFor, zoneArea, type PriceZone } from '../lib/prices';
import { cityIsIndexable } from '../lib/quality';

export const GET: APIRoute = async ({ site }) => {
  const { settings, cars, cities, services, posts, prices } = await getContent('id');
  const en = await getContent('en');
  const travel = services.find((s) => s.template === 'travel');
  const originName = (k: string) => travel?.origins?.find((o) => o.key === k)?.name || k;
  const base = (site?.toString() || settings.siteUrl).replace(/\/$/, '');
  const t = ui('id');
  const slugs = cars.map((c) => c.slug.current);
  const carName = (slug: string) => cars.find((c) => c.slug.current === slug)?.name || slug;
  // Prices from the published price list: "mulai" per 12 hours, always with the area they apply to.
  const fromLine = (carSlugs: string[]) => {
    const from = fromPrices(prices, carSlugs);
    return [
      from.driver && t.fromDriver(rupiah(from.driver.amount), zoneArea(from.driver.zone, 'id')),
      from.allIn && t.fromAllIn(rupiah(from.allIn.amount), zoneArea(from.allIn.zone, 'id')),
    ].filter(Boolean).join('; ');
  };
  const pkgLine = (title: string, zone: PriceZone | undefined) =>
    zone ? `- Paket ${title}. ${t.included}: ${t.zoneIncluded(zone)} ${t.excluded}: ${t.zoneExcluded(zone)}` : '';
  const extraLine = (code: string) => {
    const e = prices.extras[code];
    const value = e ? t.extraValue(code, e) : '';
    return value ? `- ${t.extraLabel(code, e)}: ${value}` : '';
  };
  const cityLine = (c: (typeof cities)[number]) => {
    const tables = cityTables(prices, c);
    const link = `[Sewa mobil ${c.name}](${base}/${c.slug.current})`;
    if (tables.quote) return `- ${link}: penawaran per perjalanan dalam Rupiah, tanpa tabel harga.`;
    const driver = tables.driver && cheapest(prices, [tables.driver], slugs);
    const allIn = tables.allIn && cheapest(prices, [tables.allIn], slugs);
    const surcharges = surchargesFor(tables.allIn, c.name);
    return `- ${link}: ${[
      driver ? `mobil + supir mulai ${rupiah(driver.amount)} / 12 jam (${carName(driver.slug)})` : '',
      allIn ? `all-in mulai ${rupiah(allIn.amount)} / 12 jam (${carName(allIn.slug)})` : '',
    ].filter(Boolean).join(', ') || 'tarif dikonfirmasi admin'}.${surcharges.length ? ` ${t.surcharges(c.name, surcharges)}` : ''}`;
  };
  const overtime = prices.extras.OVERTIME;
  const lines = [
    `# ${settings.brandName}`,
    '',
    `> Rental mobil dengan driver (bukan lepas kunci) di ${settings.address.locality}, dikelola ${settings.legalName}. Pemesanan melalui WhatsApp +${settings.waPhone}, admin siaga 24 jam. Melayani perjalanan dalam kota, antar kota, dan antarprovinsi ke mana pun tujuan, serta layanan di Singapura, Malaysia, dan Thailand dengan penawaran dalam Rupiah.`,
    '',
    '## Fakta utama',
    `- Alamat kantor: ${settings.address.full}`,
    `- Telepon/WhatsApp: ${settings.phones.join(', ')}`,
    ...settings.bankAccounts.map((b) => `- Rekening resmi: ${b.bank} ${b.number} ${b.owner}`),
    `- Pembayaran: ${settings.paymentTerms || ''}`,
    `- Waspada penipuan: pembayaran hanya ke rekening atas nama ${settings.legalName}; nomor resmi hanya yang tercantum di atas. Verifikasi: ${base}/rekening-resmi`,
    ...(settings.cancellationPolicy?.items || []).map((it) => `- Pembatalan (${it.when}): ${it.fee}`),
    `- Ketentuan pemesanan lengkap: ${base}/ketentuan-pemesanan`,
    pkgLine(t.pkgDriverTitle, driverZones(prices)[0]),
    pkgLine(t.pkgAllInTitle, allInZones(prices)[0]),
    extraLine('DRIVER_MEAL'),
    extraLine('DRIVER_LODGING'),
    overtime?.percent ? `- ${t.extraLabel('OVERTIME', overtime)}: ${t.overtime(overtime.percent)}` : '',
    `- ${t.durationLbl}: ${t.durations}`,
    `- Daftar harga resmi diterbitkan ${publishedDate(prices, 'id')}. Harga berbeda per kota; tabel lengkap ada di halaman tiap kota.`,
    '',
    '## Armada dan tarif (dengan driver)',
    '- Daftar berikut adalah tipe unit yang paling sering dipesan; unit lain bisa di-request ke admin. Harga "mulai" per 12 jam, dengan wilayah tabelnya.',
    ...cars.map((c) => `- [${c.name}](${base}${paths.car(c.slug.current, 'id')}) (${c.capacity ?? '?'} kursi termasuk driver): ${fromLine([c.slug.current]) || 'tarif sesuai permintaan'}`),
    '',
    '## Tarif per kota (per 12 jam)',
    ...cities.filter(cityIsIndexable).map(cityLine),
    ...(travel?.routes?.length
      ? [
          '',
          '## Travel carter (sekali jalan, per mobil, termasuk driver)',
          ...travel.routes.map((r) => {
            const min = Math.min(...r.prices.map((p) => p.price));
            const link = r.intro ? `[${originName(r.origin)} → ${r.destName}](${base}${paths.route(travel, r, 'id')})` : `${originName(r.origin)} → ${r.destName}`;
            return `- ${link}: mulai ${rupiah(min)}${r.duration ? `, ${r.duration}` : ''}`;
          }),
        ]
      : []),
    '',
    '## Halaman',
    `- [Beranda](${base}/)`,
    `- [Armada & tarif](${base}/armada)`,
    ...cities.filter(cityIsIndexable).map((c) => `- [Sewa mobil ${c.name}](${base}/${c.slug.current})`),
    ...services.map((s) => `- [${s.navLabel}](${base}/${s.slug.current}): ${s.answer || s.hero.lead || ''}`),
    '',
    '## Artikel',
    ...posts.slice(0, 50).map((p) => `- [${p.title}](${base}/blog/${p.slug.current}): ${p.excerpt}`),
    '',
    '## English',
    `- [Home](${base}/en): car rental with a professional driver in Indonesia; rates in rupiah, booking on WhatsApp.`,
    `- [Fleet & rates](${base}${paths.fleet('en')})`,
    ...en.cities.filter(cityIsIndexable).map((c) => `- [Car rental in ${c.name}](${base}${paths.city(c, 'en')})`),
    ...en.services.map((s) => `- [${s.navLabel}](${base}${paths.service(s, 'en')})`),
    `- [Official numbers & bank account](${base}${paths.verify('en')})`,
    '',
  ];
  return new Response(lines.filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
