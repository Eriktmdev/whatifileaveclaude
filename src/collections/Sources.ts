import type { CollectionConfig } from 'payload'

import { isStaff, isStaffField } from '@/access'
import { demoField, verificationField } from '@/fields/verification'
import { enforceEditorialRules, sourceDependents } from '@/hooks/editorial'
import { revalidateSite } from '@/hooks/revalidate'
import { SOURCE_KINDS } from '@/lib/sourceKinds'

export const Sources: CollectionConfig = {
  slug: 'sources',
  labels: { singular: 'Fuente', plural: 'Fuentes' },
  admin: {
    useAsTitle: 'title',
    group: 'Conocimiento',
    defaultColumns: ['title', 'publisher', 'kind', 'verification.reviewStatus', 'isDemo'],
    description:
      'Cada fuente se registra una vez y se cita desde requisitos, vías y guías. Para requisitos, usa fuentes oficiales.',
  },
  access: {
    // Las fuentes se muestran públicamente como citas. Los campos internos están protegidos.
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeChange: [enforceEditorialRules({ collection: 'sources' })],
    afterChange: [sourceDependents, revalidateSite],
  },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'publisher',
          label: 'Organismo o editor',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'kind',
          label: 'Tipo de fuente',
          type: 'select',
          options: SOURCE_KINDS,
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value) return 'La URL es obligatoria.'
        try {
          const u = new URL(value)
          return u.protocol === 'https:' || u.protocol === 'http:'
            ? true
            : 'Debe empezar por https://'
        } catch {
          return 'URL no válida.'
        }
      },
    },
    {
      name: 'country',
      label: 'País (ámbito)',
      type: 'relationship',
      relationTo: 'countries',
      admin: { description: 'Vacío si la fuente no es de un país concreto.' },
    },
    {
      name: 'limitations',
      label: 'Naturaleza y limitaciones de la evidencia',
      type: 'textarea',
      admin: {
        description:
          'Qué mide, de cuándo es, qué no permite concluir. Obligatorio en la práctica para datos de empleo o costes.',
      },
    },
    {
      name: 'internalNotes',
      label: 'Notas internas',
      type: 'textarea',
      access: { read: isStaffField },
      admin: { description: 'Lo que viste al comprobarla (secciones, cifras). No se publica.' },
    },
    verificationField(
      '«Fecha real de comprobación» = el día que abriste la URL y confirmaste que dice lo que citamos. Guardar no equivale a verificar.',
    ),
    {
      name: 'usedByRequirements',
      label: 'Usada en requisitos',
      type: 'join',
      collection: 'requirements',
      on: 'sources',
      admin: { allowCreate: false },
    },
    {
      name: 'usedByGuides',
      label: 'Usada en guías',
      type: 'join',
      collection: 'guides',
      on: 'sources',
      admin: { allowCreate: false },
    },
    demoField,
  ],
}
