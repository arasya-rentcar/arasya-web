import { defineField, defineType } from 'sanity';

/** Meta title/description. Counters match what Google shows. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'string',
      description: 'Maksimal ±60 karakter supaya tidak terpotong di Google.',
      validation: (r) => r.required().max(70).warning('Lebih dari 70 karakter akan terpotong.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Maksimal ±160 karakter.',
      validation: (r) => r.required().max(170).warning('Lebih dari 170 karakter akan terpotong.'),
    }),
    defineField({
      name: 'noindex',
      title: 'Sembunyikan dari Google (noindex)',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', title: 'Label kecil di atas judul', type: 'string' }),
    defineField({ name: 'title', title: 'Judul (H1)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'titleAccent', title: 'Lanjutan judul (warna biru)', type: 'string' }),
    defineField({ name: 'lead', title: 'Paragraf pembuka', type: 'text', rows: 3 }),
    defineField({ name: 'car', title: 'Mobil di hero', type: 'reference', to: [{ type: 'car' }] }),
    defineField({ name: 'image', title: 'Foto latar (opsional)', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'imagePath', title: 'Foto latar lokal (sistem)', type: 'string', hidden: true }),
  ],
});

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Pertanyaan',
  type: 'object',
  fields: [
    defineField({ name: 'question', title: 'Pertanyaan', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Jawaban', type: 'text', rows: 4, validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'question', subtitle: 'answer' } },
});

export const titledText = defineType({
  name: 'titledText',
  title: 'Poin',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Judul', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'text', title: 'Keterangan', type: 'text', rows: 2 }),
  ],
});

/** Rich text used by articles and editorial blocks. */
export const richText = defineType({
  name: 'richText',
  title: 'Teks',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Paragraf', value: 'normal' },
        { title: 'Subjudul (H2)', value: 'h2' },
        { title: 'Subjudul kecil (H3)', value: 'h3' },
        { title: 'Kutipan', value: 'blockquote' },
      ],
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{ name: 'href', type: 'string', title: 'URL atau path (mis. /sewa-mobil-bogor)' }],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Teks alternatif', validation: (r: any) => r.required() },
        { name: 'caption', type: 'string', title: 'Keterangan' },
      ],
    },
  ],
});
