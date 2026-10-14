import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { demoField, slugField, verificationField } from '@/fields/verification'
import { enforceEditorialRules, pathwayDependents } from '@/hooks/editorial'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidate'
import { PASSPORTS } from '@/lib/passports'

export const PATHWAY_CATEGORIES = [
  { label: 'Trabajo y vacaciones', value: 'working_holiday' },
  { label: 'Estudios', value: 'study' },
  { label: 'Trabajo cualificado', value: 'skilled' },
  { label: 'Patrocinio de empresa', value: 'employer_sponsored' },
  { label: 'Familia o pareja', value: 'family' },
  { label: 'Otra', value: 'other' },
]

/** Vía de estancia o visado. Sus requisitos viven en la colección «Requisitos». */
export const Pathways: CollectionConfig = {
  slug: 'pathways',
  labels: { singular: 'Vía de estancia', plural: 'Vías de estancia' },
  admin: {
    useAsTitle: 'name',
    group: 'Conocimiento',
    defaultColumns: [
      'name',
      'country',
      'officialCode',
      '_status',
      'verification.reviewStatus',
      'isDemo',
    ],
  },
  versions: { drafts: true },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [enforceEditorialRules({ collection: 'pathways', hasDrafts: true })],
    afterChange: [pathwayDependents, revalidateSite],
    afterDelete: [revalidateSiteOnDelete],
  },
  fields: [
    { name: 'name', label: 'Nombre en español', type: 'text', required: true },
    slugField('name'),
    {
      type: 'row',
      fields: [
        { name: 'officialName', label: 'Nombre oficial', type: 'text', admin: { width: '50%' } },
        {
          name: 'officialCode',
          label: 'Código oficial (p. ej. subclase)',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          label: 'País de destino',
          type: 'relationship',
          relationTo: 'countries',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'category',
          label: 'Categoría',
          type: 'select',
          options: PATHWAY_CATEGORIES,
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'eligiblePassports',
      label: 'Pasaportes para los que aplica este recorrido',
      type: 'select',
      hasMany: true,
      options: [...PASSPORTS],
      admin: {
        description:
          'Nacionalidad del pasaporte, no país de residencia ni idioma. Si una vía tiene requisitos distintos según pasaporte, se reflejan en el ámbito de cada requisito.',
      },
    },
    {
      name: 'summary',
      label: 'Resumen',
      type: 'textarea',
      required: true,
      admin: { description: 'Qué permite esta vía, en dos o tres frases.' },
    },
    {
      name: 'notCovered',
      label: 'Lo que esta ficha no cubre',
      type: 'textarea',
      admin: { description: 'Límites explícitos: casos especiales, segundas solicitudes, etc.' },
    },
    {
      name: 'requirements',
      label: 'Requisitos',
      type: 'join',
      collection: 'requirements',
      on: 'pathway',
      defaultSort: 'order',
      admin: { defaultColumns: ['title', 'order', '_status'] },
    },
    {
      name: 'sources',
      label: 'Fuentes',
      type: 'relationship',
      relationTo: 'sources',
      hasMany: true,
    },
    verificationField(),
    demoField,
  ],
}
