import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { editorialFields } from '@/fields/editorial'
import { imageField } from '@/fields/image'
import { demoField, slugField, verificationField } from '@/fields/verification'
import { enforceEditorialRules } from '@/hooks/editorial'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidate'

/** Estado, territorio o zona de un país. Sin cifras sin fuente. */
export const Regions: CollectionConfig = {
  slug: 'regions',
  labels: { singular: 'Región', plural: 'Regiones' },
  admin: {
    useAsTitle: 'name',
    group: 'Conocimiento',
    defaultColumns: ['name', 'country', 'mainCity', 'editorialState', 'isDemo'],
  },
  versions: { drafts: true },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [enforceEditorialRules({ collection: 'regions', hasDrafts: true })],
    afterChange: [revalidateSite],
    afterDelete: [revalidateSiteOnDelete],
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    slugField('name'),
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
          name: 'mainCity',
          label: 'Ciudad o zona principal',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'summary',
      label: 'Resumen',
      type: 'textarea',
      required: true,
      admin: { description: 'Dos o tres frases: para quién puede tener sentido y por qué.' },
    },
    {
      name: 'characteristics',
      label: 'Características',
      type: 'array',
      fields: [{ name: 'text', label: 'Característica', type: 'text', required: true }],
    },
    {
      name: 'labourMarket',
      label: 'Mercado laboral',
      type: 'textarea',
      admin: { description: 'Sectores principales y tipo de empleo. Cita la fuente en «Fuentes».' },
    },
    {
      name: 'costOfLiving',
      label: 'Coste de vida y vivienda',
      type: 'textarea',
      admin: { description: 'Cualitativo salvo que tengas una fuente con fecha.' },
    },
    {
      name: 'mobility',
      label: 'Movilidad',
      type: 'textarea',
      admin: { description: '¿Hace falta coche? Transporte público, distancias…' },
    },
    imageField('image', 'Imagen'),
    {
      name: 'sources',
      label: 'Fuentes',
      type: 'relationship',
      relationTo: 'sources',
      hasMany: true,
    },
    verificationField(),
    demoField,
    ...editorialFields(),
  ],
}
