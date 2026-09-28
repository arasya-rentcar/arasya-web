import { defineArrayMember, defineField, defineType } from 'sanity';
import { enHero, enObject } from './shared';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Pengaturan situs',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Kontak', default: true },
    { name: 'trust', title: 'Kepercayaan' },
    { name: 'rates', title: 'Tarif' },
    { name: 'analytics', title: 'Analitik' },
    { name: 'en', title: 'English' },
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
      name: 'fraudWarning',
      title: 'Peringatan penipuan',
      description: 'Tampil di beranda, halaman kota & layanan, dan /rekening-resmi. Nomor HP dan rekening diambil dari tab Kontak.',
      type: 'object',
      group: 'trust',
      fields: [
        { name: 'title', type: 'string', title: 'Judul' },
        { name: 'text', type: 'text', rows: 3, title: 'Paragraf' },
        { name: 'points', type: 'array', of: [{ type: 'string' }], title: 'Poin yang perlu diwaspadai' },
      ],
    }),
    defineField({
      name: 'analytics',
      title: 'Google Analytics',
      description: 'Tempel ID dari Google Analytics 4 (G-XXXXXXX) atau Google Tag Manager (GTM-XXXXXXX), lalu Publish. Situs dibangun ulang otomatis.',
      type: 'object',
      group: 'analytics',
      fields: [
        { name: 'ga4Id', type: 'string', title: 'GA4 Measurement ID', validation: (r: any) => r.regex(/^G-[A-Z0-9]{4,}$/, { name: 'G-XXXXXXX' }) },
        { name: 'gtmId', type: 'string', title: 'GTM Container ID (opsional)', validation: (r: any) => r.regex(/^GTM-[A-Z0-9]{4,}$/, { name: 'GTM-XXXXXXX' }) },
      ],
    }),
    enObject([
      { name: 'paymentTerms', type: 'text', rows: 3, title: 'Payment terms' },
      { name: 'rateNotes', type: 'object', title: 'Rate notes', fields: [{ name: 'city', type: 'text', rows: 2, title: '12 hours in town' }, { name: 'allIn', type: 'text', rows: 2, title: 'All-in' }] },
      { name: 'trust', type: 'array', of: [defineArrayMember({ type: 'titledText' })], title: 'Trust points' },
      { name: 'fraudWarning', type: 'object', title: 'Scam warning', fields: [{ name: 'title', type: 'string' }, { name: 'text', type: 'text', rows: 3 }, { name: 'points', type: 'array', of: [{ type: 'string' }] }] },
    ], 'Teks bersama untuk semua halaman /en.'),
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
  groups: [{ name: 'en', title: 'English' }],
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
    enObject([enHero, { name: 'seo', type: 'seo', title: 'SEO' }]),
  ],
  preview: { prepare: () => ({ title: 'Beranda' }) },
});
