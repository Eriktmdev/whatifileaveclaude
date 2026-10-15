import type { Field } from 'payload'

import { isStaffField } from '@/access'
import { slugify } from '@/lib/slug'
import { REVIEW_STATUSES } from '@/lib/verification'

/**
 * Bloque común para registrar CUÁNDO y CÓMO se comprobó un dato.
 * La fecha de edición la guarda Payload (updatedAt); esta es otra cosa.
 */
export const verificationField = (
  description = 'Rellena la fecha solo cuando hayas abierto las fuentes y comprobado el dato. Guardar no equivale a verificar.',
): Field => ({
  name: 'verification',
  label: 'Verificación',
  type: 'group',
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'reviewStatus',
          label: 'Estado de verificación',
          type: 'select',
          options: [...REVIEW_STATUSES],
          defaultValue: 'unverified',
          required: true,
          admin: { width: '33%' },
        },
        {
          name: 'lastVerifiedAt',
          label: 'Fecha real de comprobación',
          type: 'date',
          admin: {
            width: '33%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
          },
        },
        {
          name: 'verifiedBy',
          label: 'Comprobado por',
          type: 'relationship',
          relationTo: 'users',
          access: { read: isStaffField },
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'validFrom',
          label: 'Vigente desde',
          type: 'date',
          admin: {
            width: '50%',
            description: 'Opcional. Útil para importes o umbrales que cambian cada año.',
            date: { pickerAppearance: 'dayOnly' },
          },
        },
        {
          name: 'validUntil',
          label: 'Vigente hasta',
          type: 'date',
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'flaggedAt',
      label: 'En revisión desde',
      type: 'date',
      access: { read: isStaffField },
      admin: {
        readOnly: true,
        description: 'Se rellena solo cuando el estado pasa a «Necesita revisión».',
        condition: (_, s) => s?.reviewStatus === 'needs_review',
      },
    },
    {
      name: 'reviewNote',
      label: 'Nota de revisión',
      type: 'textarea',
      access: { read: isStaffField },
      admin: {
        description: 'Qué falta comprobar, por qué necesita revisión o qué cambió. Interno.',
      },
    },
  ],
})

export const demoField: Field = {
  name: 'isDemo',
  label: 'Contenido de demostración',
  type: 'checkbox',
  defaultValue: false,
  index: true,
  admin: {
    position: 'sidebar',
    description:
      'Datos de ejemplo para desarrollo. No son evidencia. La web pública los oculta salvo que SHOW_DEMO_CONTENT=true.',
  },
}

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  label: 'Slug (URL)',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: `Parte de la URL. Minúsculas y guiones. Se propone a partir de «${from}».`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const base = (value as string) || (data?.[from] as string) || ''
        return slugify(base)
      },
    ],
  },
})
