import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Topic pages (/wedding, /korporat, /travel, …). `template` picks the layout,
 * so each topic gets its own structure and mood on top of the shared design.
 */
export const servicePage = defineType({
  name: 'servicePage',
  title: 'Halaman layanan',
  type: 'document',
  groups: [
    { name: 'main', title: 'Utama', default: true },
    { name: 'travel', title: 'Tarif travel' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'template',
      title: 'Template',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Wedding', value: 'wedding' },
          { title: 'Korporat', value: 'corporate' },
          { title: 'Travel antar kota', value: 'travel' },
          { title: 'Standar', value: 'standard' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'navLabel', title: 'Label di menu', type: 'string', group: 'main' }),
    defineField({ name: 'hero', title: 'Hero', type: 'hero', group: 'main' }),
    defineField({
      name: 'answerQuestion',
      title: 'Pertanyaan untuk jawaban singkat',
      description: 'Mis. "Berapa tarif travel carter Arasya?"',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'answer',
      title: 'Jawaban singkat (untuk Google & AI)',
      description: '2–3 kalimat faktual yang menjawab "apa layanan ini, di mana, berapa". Tampil di atas halaman.',
      type: 'text',
      rows: 3,
      group: 'main',
    }),
    defineField({ name: 'highlights', title: 'Keunggulan', type: 'array', of: [{ type: 'titledText' }], group: 'main' }),
    defineField({
      name: 'cars',
      title: 'Unit yang ditampilkan',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'car' }] }],
      group: 'main',
    }),
    defineField({ name: 'steps', title: 'Langkah pemesanan', type: 'array', of: [{ type: 'titledText' }], group: 'main' }),
    defineField({ name: 'faq', title: 'FAQ', type: 'array', of: [{ type: 'faqItem' }], group: 'main' }),
    defineField({
      name: 'units',
      title: 'Kelas unit travel',
      type: 'array',
      group: 'travel',
      hidden: ({ document }) => document?.template !== 'travel',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'key', type: 'string', title: 'Kode unit' },
            { name: 'name', type: 'string', title: 'Nama' },
            { name: 'capacity', type: 'number', title: 'Kapasitas' },
            { name: 'image', type: 'image', title: 'Foto' },
            { name: 'imagePath', type: 'string', hidden: true },
          ],
        }),
      ],
    }),
    defineField({
      name: 'origins',
      title: 'Kota asal',
      type: 'array',
      group: 'travel',
      hidden: ({ document }) => document?.template !== 'travel',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'key', type: 'string', title: 'Kode' },
            { name: 'code', type: 'string', title: 'Kode 3 huruf' },
            { name: 'name', type: 'string', title: 'Nama' },
          ],
        }),
      ],
    }),
    defineField({
      name: 'routes',
      title: 'Rute & tarif',
      type: 'array',
      group: 'travel',
      hidden: ({ document }) => document?.template !== 'travel',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'origin', type: 'string', title: 'Kode kota asal' },
            { name: 'dest', type: 'string', title: 'Kode tujuan' },
            { name: 'destName', type: 'string', title: 'Nama tujuan' },
            { name: 'destCode', type: 'string', title: 'Kode 3 huruf tujuan (mis. BDG)' },
            {
              name: 'prices',
              type: 'array',
              title: 'Tarif per unit',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    { name: 'unit', type: 'string', title: 'Kode unit' },
                    { name: 'price', type: 'number', title: 'Tarif (Rp)' },
                  ],
                  preview: { select: { title: 'unit', subtitle: 'price' } },
                }),
              ],
            },
          ],
          preview: { select: { title: 'destName', subtitle: 'origin' } },
        }),
      ],
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: { select: { title: 'navLabel', subtitle: 'slug.current' } },
});
