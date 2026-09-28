import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Pengaturan situs',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Kontak', default: true },
    { name: 'trust', title: 'Kepercayaan' },
    { name: 'rates', title: 'Tarif' },
  ],
  fields: [
    defineField({ name: 'brandName', title: 'Nama brand', type: 'string', group: 'contact' }),
    defineField({ name: 'legalName', title: 'Nama badan usaha', type: 'string', group: 'contact' }),
    defineField({ name: 'siteUrl', title: 'Domain utama', type: 'url', group: 'contact' }),
    defineField({
      name: 'waPhone',
      title: 'Nomor WhatsApp (format 62…)',
      type: 'string',
      group: 'contact',
      validation: (r) => r.required().regex(/^62\d{8,13}$/, { name: '62…' }),
    }),
    defineField({ name: 'phones', title: 'Nomor resmi (tampilan)', type: 'array', of: [{ type: 'string' }], group: 'contact' }),
    defineField({
      name: 'address',
      title: 'Alamat kantor',
      type: 'object',
      group: 'contact',
      fields: [
        { name: 'street', type: 'string', title: 'Jalan' },
        { name: 'locality', type: 'string', title: 'Kota' },
        { name: 'region', type: 'string', title: 'Provinsi' },
        { name: 'postalCode', type: 'string', title: 'Kode pos' },
        { name: 'full', type: 'string', title: 'Alamat lengkap' },
      ],
    }),
    defineField({
      name: 'bankAccounts',
      title: 'Rekening resmi',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'bank', type: 'string', title: 'Bank' },
            { name: 'number', type: 'string', title: 'Nomor rekening' },
            { name: 'owner', type: 'string', title: 'Atas nama' },
          ],
        }),
      ],
    }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url', group: 'contact' }),
    defineField({ name: 'paymentTerms', title: 'Ketentuan pembayaran', type: 'text', rows: 3, group: 'rates' }),
    defineField({
      name: 'rateNotes',
      title: 'Catatan tarif',
      type: 'object',
      group: 'rates',
      fields: [
        { name: 'city', type: 'text', rows: 2, title: 'Dalam Kota 12 jam' },
        { name: 'allIn', type: 'text', rows: 2, title: 'All-in' },
      ],
    }),
    defineField({ name: 'trust', title: 'Poin kepercayaan', type: 'array', of: [{ type: 'titledText' }], group: 'trust' }),
    defineField({
      name: 'testimonials',
      title: 'Ulasan pelanggan',
      description: 'Hanya ulasan asli. Sertakan link ke ulasan Google bila ada.',
      type: 'array',
      group: 'trust',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'quote', type: 'text', rows: 4, title: 'Ulasan' },
            { name: 'name', type: 'string', title: 'Nama' },
            { name: 'context', type: 'string', title: 'Konteks (mis. Liburan keluarga · Innova)' },
            { name: 'link', type: 'url', title: 'Link ulasan' },
          ],
          preview: { select: { title: 'name', subtitle: 'quote' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Pengaturan situs' }) },
});

export const homePage = defineType({
  name: 'homePage',
  title: 'Beranda',
  type: 'document',
  fields: [
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    defineField({ name: 'hero', title: 'Hero', type: 'hero' }),
    defineField({
      name: 'featuredCars',
      title: 'Armada unggulan',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'car' }] }],
      validation: (r) => r.max(8),
    }),
  ],
  preview: { prepare: () => ({ title: 'Beranda' }) },
});
