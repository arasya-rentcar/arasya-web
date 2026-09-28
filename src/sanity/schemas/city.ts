import { defineArrayMember, defineField, defineType } from 'sanity';
import { enHero, enObject, enSlug } from './shared';

/**
 * One document = one location landing page (/sewa-mobil-{kota}).
 *
 * Google treats near-identical city pages as doorway pages, so a city page is
 * only indexable once it carries enough content that belongs to that city
 * alone. The same thresholds are enforced at build time in
 * src/lib/quality.ts; the validation here just tells the editor early.
 */
export const CITY_SECTIONS = [
  { title: 'Jawaban singkat (AEO)', value: 'answer' },
  { title: 'Armada & tarif', value: 'fleet' },
  { title: 'Poin kepercayaan', value: 'trust' },
  { title: 'Editorial kota', value: 'editorial' },
  { title: 'Destinasi', value: 'destinations' },
  { title: 'Rute populer', value: 'routes' },
  { title: 'Ulasan', value: 'testimonials' },
  { title: 'FAQ', value: 'faq' },
];

export const city = defineType({
  name: 'city',
  title: 'Halaman kota',
  type: 'document',
  groups: [
    { name: 'main', title: 'Utama', default: true },
    { name: 'local', title: 'Konten lokal' },
    { name: 'seo', title: 'SEO' },
    { name: 'en', title: 'English' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Nama kota', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'code', title: 'Kode (3 huruf, untuk kode referensi WA)', type: 'string', group: 'main', validation: (r) => r.required().length(3).uppercase() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      description: 'Format: sewa-mobil-{kota}',
      options: { source: (doc: any) => `sewa-mobil-${doc.name || ''}` },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'country',
      title: 'Negara',
      type: 'string',
      group: 'main',
      initialValue: 'ID',
      options: { list: [{ title: 'Indonesia', value: 'ID' }, { title: 'Luar negeri', value: 'INTL' }] },
    }),
    defineField({ name: 'isHeadquarters', title: 'Kantor pusat', type: 'boolean', group: 'main', initialValue: false }),
    defineField({
      name: 'pricing',
      title: 'Tampilan harga',
      type: 'string',
      group: 'main',
      initialValue: 'table',
      options: {
        list: [
          { title: 'Tabel tarif armada', value: 'table' },
          { title: 'Tabel tarif armada sebagai acuan (tarif final dikonfirmasi admin)', value: 'reference' },
          { title: 'Tanpa harga: kelas unit + minta penawaran (luar negeri)', value: 'quote' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'unitClasses',
      title: 'Kelas unit (untuk tampilan "minta penawaran")',
      type: 'array',
      group: 'main',
      hidden: ({ document }) => document?.pricing !== 'quote',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Nama kelas' },
            { name: 'seats', type: 'string', title: 'Kapasitas' },
            { name: 'luggage', type: 'string', title: 'Bagasi' },
            { name: 'useCase', type: 'string', title: 'Cocok untuk' },
          ],
          preview: { select: { title: 'name', subtitle: 'seats' } },
        }),
      ],
    }),
    defineField({ name: 'trust', title: 'Poin kepercayaan khusus kota ini (opsional)', type: 'array', of: [{ type: 'titledText' }], group: 'main' }),
    defineField({ name: 'hero', title: 'Hero', type: 'hero', group: 'main' }),
    defineField({
      name: 'sections',
      title: 'Urutan bagian halaman',
      description: 'Atur urutan bagian supaya tiap kota tidak tersusun identik.',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: { list: CITY_SECTIONS, layout: 'grid' },
    }),
    defineField({
      name: 'editorial',
      title: 'Editorial kota',
      type: 'object',
      group: 'local',
      fields: [
        { name: 'eyebrow', type: 'string', title: 'Label' },
        { name: 'title', type: 'string', title: 'Judul' },
        { name: 'lead', type: 'text', rows: 3, title: 'Paragraf pembuka' },
        { name: 'body', type: 'richText', title: 'Isi' },
      ],
    }),
    defineField({ name: 'pickupPoints', title: 'Titik jemput populer', type: 'string', group: 'local' }),
    defineField({ name: 'areaServed', title: 'Area layanan', type: 'array', of: [{ type: 'string' }], group: 'local' }),
    defineField({
      name: 'destinations',
      title: 'Destinasi',
      type: 'array',
      group: 'local',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Nama' },
            { name: 'area', type: 'string', title: 'Kawasan' },
            { name: 'text', type: 'text', rows: 3, title: 'Keterangan' },
            { name: 'image', type: 'image', title: 'Foto', options: { hotspot: true } },
            { name: 'imagePath', type: 'string', hidden: true },
            { name: 'credit', type: 'string', title: 'Kredit foto (wajib untuk foto berlisensi CC)' },
            { name: 'creditUrl', type: 'url', title: 'Sumber foto' },
          ],
          preview: { select: { title: 'name', subtitle: 'area', media: 'image' } },
        }),
      ],
    }),
    defineField({
      name: 'routes',
      title: 'Rute populer',
      type: 'array',
      group: 'local',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'to', type: 'string', title: 'Tujuan' },
            { name: 'duration', type: 'string', title: 'Durasi' },
            { name: 'note', type: 'string', title: 'Catatan' },
          ],
          preview: { select: { title: 'to', subtitle: 'duration' } },
        }),
      ],
    }),
    defineField({ name: 'faq', title: 'FAQ', type: 'array', of: [{ type: 'faqItem' }], group: 'local' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
    enObject([
      enSlug,
      enHero,
      { name: 'editorial', type: 'object', title: 'Editorial', fields: [{ name: 'eyebrow', type: 'string' }, { name: 'title', type: 'string' }, { name: 'lead', type: 'text', rows: 3 }, { name: 'body', type: 'richText' }] },
      { name: 'pickupPoints', type: 'string', title: 'Pick-up points' },
      { name: 'areaServed', type: 'array', of: [defineArrayMember({ type: 'string' })], title: 'Areas' },
      {
        name: 'destinations',
        type: 'array',
        title: 'Destinations (same order as Indonesian; photos are shared)',
        of: [defineArrayMember({ type: 'object', fields: [{ name: 'name', type: 'string' }, { name: 'area', type: 'string' }, { name: 'text', type: 'text', rows: 3 }] })],
      },
      {
        name: 'routes',
        type: 'array',
        title: 'Routes (same order as Indonesian)',
        of: [defineArrayMember({ type: 'object', fields: [{ name: 'to', type: 'string' }, { name: 'duration', type: 'string' }, { name: 'note', type: 'string' }] })],
      },
      { name: 'faq', type: 'array', of: [defineArrayMember({ type: 'faqItem' })], title: 'FAQ' },
      { name: 'seo', type: 'seo', title: 'SEO' },
    ]),
  ],
  validation: (r) =>
    r.custom((doc: any) => {
      if (!doc) return true;
      const paras = (doc.editorial?.body || []).length;
      const missing: string[] = [];
      if (paras < 2) missing.push('editorial minimal 2 paragraf');
      if ((doc.destinations || []).length < 3) missing.push('minimal 3 destinasi');
      if ((doc.routes || []).length < 2) missing.push('minimal 2 rute');
      if ((doc.faq || []).length < 4) missing.push('minimal 4 FAQ');
      return missing.length
        ? `Halaman ini belum diindeks Google sampai konten lokalnya lengkap: ${missing.join(', ')}.`
        : true;
    }).warning(),
  preview: { select: { title: 'name', subtitle: 'slug.current' } },
});
