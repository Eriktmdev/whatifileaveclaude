import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { editorialFields } from '@/fields/editorial'
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
  labels: { singular: 'Vía migratoria', plural: 'Vías migratorias' },
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
      name: 'advantages',
      label: 'Ventajas',
      type: 'array',
      fields: [{ name: 'text', label: 'Ventaja', type: 'text', required: true }],
    },
    {
      name: 'restrictions',
      label: 'Restricciones y condiciones',
      type: 'array',
      admin: {
        description:
          'Lo que el visado no permite o limita (p. ej. límites de trabajo con un mismo empleador).',
      },
      fields: [{ name: 'text', label: 'Restricción', type: 'text', required: true }],
    },
    {
      name: 'limits',
      label: 'Límites de la vía',
      type: 'textarea',
      admin: { description: 'Duración, cupos, número de solicitudes posibles…' },
    },
    {
      name: 'officialBodies',
      label: 'Organismos oficiales',
      type: 'array',
      fields: [
        { name: 'name', label: 'Organismo', type: 'text', required: true },
        { name: 'url', label: 'Web', type: 'text' },
      ],
    },
    {
      name: 'knownCosts',
      label: 'Costes conocidos',
      type: 'array',
      admin: {
        description:
          'Solo importes con fuente. Si no hay fuente verificada, no lo añadas: la web dirá que no hay costes verificados.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'concept',
              label: 'Concepto',
              type: 'text',
              required: true,
              admin: { width: '40%' },
            },
            {
              name: 'amount',
              label: 'Importe',
              type: 'number',
              required: true,
              admin: { width: '20%' },
            },
            {
              name: 'currency',
              label: 'Moneda',
              type: 'text',
              required: true,
              defaultValue: 'AUD',
              admin: { width: '15%' },
            },
            {
              name: 'source',
              label: 'Fuente',
              type: 'relationship',
              relationTo: 'sources',
              required: true,
              admin: { width: '25%' },
            },
          ],
        },
        { name: 'note', label: 'Nota', type: 'text' },
      ],
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
    ...editorialFields(),
  ],
}
