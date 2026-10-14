import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { demoField, slugField, verificationField } from '@/fields/verification'
import { enforceEditorialRules } from '@/hooks/editorial'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidate'
import { topicOptions } from '@/lib/topics'

export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: { singular: 'Guía', plural: 'Guías' },
  admin: {
    useAsTitle: 'title',
    group: 'Contenido',
    defaultColumns: ['title', 'country', 'topic', '_status', 'verification.reviewStatus', 'isDemo'],
    preview: (doc) =>
      `/preview?collection=guides&slug=${encodeURIComponent(String(doc?.slug ?? ''))}`,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [enforceEditorialRules({ collection: 'guides', hasDrafts: true })],
    afterChange: [revalidateSite],
    afterDelete: [revalidateSiteOnDelete],
  },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    slugField('title'),
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          label: 'País',
          type: 'relationship',
          relationTo: 'countries',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'topic',
          label: 'Tema',
          type: 'select',
          options: topicOptions,
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'summary',
      label: 'Resumen',
      type: 'textarea',
      required: true,
      maxLength: 320,
      admin: {
        description:
          'Lo esencial en dos o tres frases. Se muestra arriba y como descripción en buscadores.',
      },
    },
    {
      name: 'keyPoints',
      label: 'Puntos clave',
      type: 'array',
      maxRows: 6,
      admin: { description: 'Tres a cinco ideas para quien lee en diagonal.' },
      fields: [{ name: 'text', label: 'Punto', type: 'text', required: true }],
    },
    {
      name: 'body',
      label: 'Contenido',
      type: 'richText',
      required: true,
    },
    {
      name: 'relatedPathways',
      label: 'Vías de estancia relacionadas',
      type: 'relationship',
      relationTo: 'pathways',
      hasMany: true,
      admin: {
        description:
          'Sus requisitos se muestran automáticamente en la guía desde la colección «Requisitos». No los copies en el texto.',
      },
    },
    {
      name: 'sources',
      label: 'Fuentes',
      type: 'relationship',
      relationTo: 'sources',
      hasMany: true,
    },
    {
      name: 'seo',
      label: 'Buscadores',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          label: 'Título para buscadores',
          type: 'text',
          maxLength: 70,
          admin: { description: 'Opcional. Si está vacío se usa el título.' },
        },
      ],
    },
    verificationField(),
    demoField,
  ],
}
