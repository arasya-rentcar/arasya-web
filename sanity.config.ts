import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes, singletons } from './src/sanity/schemas';

export default defineConfig({
  name: 'arasya',
  title: 'Arasya Rent Car',
  projectId: 'w5eya3q9',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Konten')
          .items([
            S.listItem().title('Beranda').id('homePage').child(S.document().schemaType('homePage').documentId('homePage')),
            S.listItem()
              .title('Pengaturan situs')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('city').title('Halaman kota'),
            S.documentTypeListItem('servicePage').title('Halaman layanan'),
            S.documentTypeListItem('car').title('Armada'),
            S.documentTypeListItem('post').title('Artikel'),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.includes(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletons.includes(context.schemaType)
        ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
});
