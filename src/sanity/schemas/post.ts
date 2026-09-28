import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Artikel',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Judul', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: { list: ['Itinerari', 'Panduan', 'Tips', 'Berita'] },
    }),
    defineField({
      name: 'city',
      title: 'Kota terkait',
      description: 'Artikel akan ditautkan dari halaman kota ini, dan sebaliknya.',
      type: 'reference',
      to: [{ type: 'city' }],
    }),
    defineField({ name: 'author', title: 'Penulis', type: 'string', initialValue: 'Tim Arasya' }),
    defineField({ name: 'publishedAt', title: 'Tanggal terbit', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'updatedAt', title: 'Terakhir diperbarui', type: 'date' }),
    defineField({ name: 'cover', title: 'Foto sampul', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'coverPath', type: 'string', hidden: true }),
    defineField({
      name: 'excerpt',
      title: 'Ringkasan',
      description: 'Juga dipakai sebagai jawaban singkat di atas artikel.',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(300),
    }),
    defineField({ name: 'body', title: 'Isi artikel', type: 'richText', validation: (r) => r.required() }),
    defineField({ name: 'faq', title: 'FAQ artikel (opsional)', type: 'array', of: [{ type: 'faqItem' }] }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  orderings: [{ title: 'Terbaru', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'cover' } },
});
