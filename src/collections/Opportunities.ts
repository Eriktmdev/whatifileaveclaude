import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { editorialFields } from '@/fields/editorial'
import { demoField, slugField, verificationField } from '@/fields/verification'
import { enforceEditorialRules } from '@/hooks/editorial'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidate'
import { SECTORS, SIGNAL_KINDS } from '@/lib/sectors'

/**
 * Ocupación o especialidad con evidencia de mercado.
 * Las señales separan: lista oficial ≠ escasez ≠ vacantes ≠ salario.
 * La «facilidad de acceso» depende de cada persona y la calcula el análisis, no se guarda aquí.
 */
export const Opportunities: CollectionConfig = {
  slug: 'opportunities',
  labels: { singular: 'Oportunidad', plural: 'Oportunidades' },
  admin: {
    useAsTitle: 'title',
    group: 'Conocimiento',
    defaultColumns: ['title', 'sector', 'country', 'editorialState', 'isDemo'],
  },
  versions: { drafts: true },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [enforceEditorialRules({ collection: 'opportunities', hasDrafts: true })],
    afterChange: [revalidateSite],
    afterDelete: [revalidateSiteOnDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Ocupación o especialidad',
      type: 'text',
      required: true,
      admin: { description: 'Ej.: «Técnico/a de soporte TI en entornos industriales».' },
    },
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
          name: 'sector',
          label: 'Sector',
          type: 'select',
          options: [...SECTORS],
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
      admin: { description: 'Qué es el trabajo y por qué puede ser interesante, sin promesas.' },
    },
    {
      name: 'adjacentProfiles',
      label: 'Perfiles de los que se puede llegar',
      type: 'text',
      hasMany: true,
      admin: {
        description:
          'Experiencias desde las que esta oportunidad es «adyacente». Ej.: soporte técnico, redes, electricidad. Lo usa el descubrimiento de oportunidades.',
      },
    },
    { name: 'skills', label: 'Competencias', type: 'text', hasMany: true },
    {
      name: 'entryRequirements',
      label: 'Requisitos de acceso',
      type: 'textarea',
      admin: {
        description: 'Licencias, certificaciones, reconocimiento de títulos, experiencia mínima…',
      },
    },
    {
      name: 'barriers',
      label: 'Barreras de entrada',
      type: 'textarea',
      admin: {
        description:
          'Lo que suele frenar a alguien recién llegado: visado, experiencia local, ubicación remota…',
      },
    },
    {
      name: 'regions',
      label: 'Regiones',
      type: 'relationship',
      relationTo: 'regions',
      hasMany: true,
    },
    {
      name: 'relatedPathways',
      label: 'Vías migratorias relacionadas',
      type: 'relationship',
      relationTo: 'pathways',
      hasMany: true,
    },
    {
      name: 'signals',
      label: 'Señales de mercado',
      type: 'array',
      admin: {
        description: 'Cada señal con su tipo, fecha y fuente. Sin fuente no hay señal.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              label: 'Tipo',
              type: 'select',
              options: [...SIGNAL_KINDS],
              required: true,
              admin: { width: '35%' },
            },
            {
              name: 'observedAt',
              label: 'Fecha del dato',
              type: 'date',
              required: true,
              admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
            },
            {
              name: 'source',
              label: 'Fuente',
              type: 'relationship',
              relationTo: 'sources',
              required: true,
              admin: { width: '40%' },
            },
          ],
        },
        { name: 'statement', label: 'Qué dice la fuente', type: 'textarea', required: true },
        {
          name: 'value',
          label: 'Valor (si aplica)',
          type: 'text',
          admin: { description: 'Ej.: rango salarial tal como lo publica la fuente.' },
        },
      ],
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
