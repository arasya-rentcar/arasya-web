/**
 * /llms.txt: a plain-text fact sheet for AI assistants (the llmstxt.org
 * convention). Generated from the same content as the pages, so prices and
 * contact details never drift from what the site shows.
 */
import type { APIRoute } from 'astro';
import { getContent } from '../lib/content';
import { rupiah } from '../lib/format';
import { paths } from '../lib/paths';
import { cityIsIndexable } from '../lib/quality';

export const GET: APIRoute = async ({ site }) => {
  const { settings, cars, cities, services, posts } = await getContent('id');
  const en = await getContent('en');
  const travel = services.find((s) => s.template === 'travel');
  const originName = (k: string) => travel?.origins?.find((o) => o.key === k)?.name || k;
  const base = (site?.toString() || settings.siteUrl).replace(/\/$/, '');
  const lines = [
    `# ${settings.brandName}`,
    '',
    `> Rental mobil dengan driver (bukan lepas kunci) di ${settings.address.locality}, dikelola ${settings.legalName}. Pemesanan melalui WhatsApp +${settings.waPhone}, admin siaga 24 jam.`,
    '',
    '## Fakta utama',
    `- Alamat kantor: ${settings.address.full}`,
    `- Telepon/WhatsApp: ${settings.phones.join(', ')}`,
    ...settings.bankAccounts.map((b) => `- Rekening resmi: ${b.bank} ${b.number} ${b.owner}`),
    `- Pembayaran: ${settings.paymentTerms || ''}`,
    `- Waspada penipuan: pembayaran hanya ke rekening atas nama ${settings.legalName}; nomor resmi hanya yang tercantum di atas. Verifikasi: ${base}/rekening-resmi`,
    settings.rateNotes?.city ? `- Tarif Dalam Kota: ${settings.rateNotes.city}` : '',
    settings.rateNotes?.allIn ? `- Tarif All-in: ${settings.rateNotes.allIn}` : '',
    '',
    '## Armada dan tarif (dengan driver)',
    ...cars.map((c) => `- [${c.name}](${base}${paths.car(c.slug.current, 'id')}) (${c.capacity ?? '?'} kursi termasuk driver): ${c.priceCity ? `${rupiah(c.priceCity)} per 12 jam dalam kota` : 'tarif sesuai permintaan'}${c.priceAllIn ? `, all-in ${rupiah(c.priceAllIn)}` : ''}`),
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
