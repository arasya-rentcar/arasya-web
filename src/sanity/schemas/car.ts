import { defineField, defineType } from 'sanity';

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
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'category', media: 'image' } },
});
