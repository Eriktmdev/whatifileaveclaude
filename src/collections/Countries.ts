import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { imageField } from '@/fields/image'
import { demoField, slugField } from '@/fields/verification'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidate'
import { topicOptions } from '@/lib/topics'

export const Countries: CollectionConfig = {
  slug: 'countries',
  labels: { singular: 'País', plural: 'Países' },
  admin: {
    useAsTitle: 'name',
    group: 'Conocimiento',
    defaultColumns: ['name', 'slug', '_status', 'isDemo'],
  },
  versions: { drafts: true },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSiteOnDelete] },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    slugField('name'),
    {
      name: 'isoCode',
      label: 'Código ISO (2 letras)',
      type: 'text',
      required: true,
      maxLength: 2,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tagline',
      label: 'Frase de presentación',
      type: 'text',
      required: true,
      admin: {
        description: 'Una línea, sin promesas. Aparece en el inicio y en la cabecera del país.',
      },
    },
    {
      name: 'intro',
      label: 'Introducción',
      type: 'textarea',
      required: true,
      admin: { description: 'Dos o tres frases: qué encontrará la persona en esta sección.' },
    },
    imageField('heroImage', 'Imagen de cabecera'),
    {
      name: 'quickFacts',
      label: 'Datos rápidos',
      type: 'array',
      maxRows: 6,
      admin: {
        description:
          'Datos estables (capital, idioma, moneda…). Evita cifras que cambian a menudo y cita la fuente.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              label: 'Icono',
              type: 'select',
              defaultValue: 'other',
              options: [
                { label: 'Capital', value: 'capital' },
                { label: 'Idioma', value: 'language' },
                { label: 'Moneda', value: 'currency' },
                { label: 'Hora', value: 'time' },
                { label: 'Otro', value: 'other' },
              ],
              admin: { width: '20%' },
            },
            {
              name: 'label',
              label: 'Etiqueta',
              type: 'text',
              required: true,
              admin: { width: '30%' },
            },
            {
              name: 'value',
              label: 'Valor',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
        { name: 'source', label: 'Fuente', type: 'relationship', relationTo: 'sources' },
      ],
    },
    {
      name: 'topicIntros',
      label: 'Introducción por tema',
      type: 'array',
      admin: { description: 'Opcional. Una frase breve por tema del hub.' },
      fields: [
        { name: 'topic', label: 'Tema', type: 'select', options: topicOptions, required: true },
        { name: 'text', label: 'Texto', type: 'textarea', required: true },
      ],
    },
    demoField,
  ],
}
