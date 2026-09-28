import { defineArrayMember, defineField, defineType } from 'sanity';
import { enObject } from './shared';

export const CAR_CATEGORIES = [
  { title: 'MPV', value: 'mpv' },
  { title: 'MPV premium', value: 'mpv-premium' },
  { title: 'SUV', value: 'suv' },
  { title: 'Premium', value: 'premium' },
  { title: 'Van & rombongan', value: 'van' },
];

export const car = defineType({
  name: 'car',
  title: 'Armada',
  type: 'document',
  groups: [
    { name: 'page', title: 'Halaman unit' },
    { name: 'en', title: 'English' },
  ],
  fields: [
    defineField({ name: 'name', title: 'Nama unit', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: { list: CAR_CATEGORIES, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Kapasitas (termasuk driver)',
      type: 'number',
      validation: (r) => r.min(1).max(60),
    }),
    defineField({
      name: 'priceCity',
      title: 'Tarif Dalam Kota 12 jam (Rp)',
      type: 'number',
      description: 'Kosongkan bila harga sesuai permintaan.',
    }),
    defineField({ name: 'priceAllIn', title: 'Tarif All-in (Rp)', type: 'number' }),
    defineField({ name: 'badge', title: 'Label (mis. Terpopuler)', type: 'string' }),
    defineField({ name: 'description', title: 'Keterangan singkat', type: 'text', rows: 2 }),
    defineField({
      name: 'image',
      title: 'Foto (PNG/WebP transparan, tampak samping-depan)',
      type: 'image',
    }),
    defineField({ name: 'imagePath', title: 'Foto lokal (sistem)', type: 'string', hidden: true }),
    defineField({ name: 'order', title: 'Urutan', type: 'number', initialValue: 100 }),
    defineField({
      name: 'travelUnit',
      title: 'Kelas travel',
      description: 'Kode kelas unit di halaman Travel (mis. avanza, xpander, reborn, zenix, zenixq). Dipakai untuk menampilkan rute travel di halaman unit.',
      type: 'string',
    }),
    defineField({
      name: 'summary',
      title: 'Deskripsi halaman unit',
      description: 'Paragraf pembuka di /armada/{slug}. Tulis untuk calon penyewa: untuk siapa unit ini, kenyamanannya, kelebihannya.',
      type: 'text',
      rows: 4,
      group: 'page',
    }),
    defineField({ name: 'idealFor', title: 'Cocok untuk', type: 'array', of: [{ type: 'string' }], group: 'page', validation: (r) => r.min(3).warning('Minimal 3 poin supaya halaman diindeks Google.') }),
    defineField({ name: 'features', title: 'Kelebihan', type: 'array', of: [{ type: 'titledText' }], group: 'page' }),
    defineField({ name: 'luggage', title: 'Bagasi', type: 'string', group: 'page', description: 'Mis. "2 koper besar + 2 tas kabin dengan kursi belakang terpakai"' }),
    defineField({ name: 'faq', title: 'FAQ unit', type: 'array', of: [{ type: 'faqItem' }], group: 'page', validation: (r) => r.min(2).warning('Minimal 2 FAQ supaya halaman diindeks Google.') }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'page' }),
    enObject([
      { name: 'description', type: 'text', rows: 2, title: 'Short description' },
      { name: 'badge', type: 'string', title: 'Badge' },
      { name: 'summary', type: 'text', rows: 4, title: 'Page intro' },
      { name: 'idealFor', type: 'array', of: [defineArrayMember({ type: 'string' })], title: 'Good for' },
      { name: 'features', type: 'array', of: [defineArrayMember({ type: 'titledText' })], title: 'Highlights' },
      { name: 'luggage', type: 'string', title: 'Luggage' },
      { name: 'faq', type: 'array', of: [defineArrayMember({ type: 'faqItem' })], title: 'FAQ' },
      { name: 'seo', type: 'seo', title: 'SEO' },
    ]),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'category', media: 'image' } },
});
