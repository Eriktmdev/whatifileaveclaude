import type { GlobalConfig } from 'payload'

import { isStaff } from '@/access'
import { revalidateSiteGlobal } from '@/hooks/revalidate'

/**
 * Datos económicos de referencia que usan los cálculos.
 * Un tipo de cambio sin fuente y fecha no se usa: los cálculos dirán «falta comprobar».
 */
export const Economics: GlobalConfig = {
  slug: 'economics',
  label: 'Datos económicos',
  admin: { group: 'Conocimiento' },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateSiteGlobal] },
  fields: [
    {
      name: 'exchangeRates',
      label: 'Tipos de cambio',
      type: 'array',
      admin: {
        description:
          'Ej.: 1 EUR = X AUD. Actualízalo con fecha y fuente (banco central, etc.). Sin tipo de cambio, el cuestionario no convierte tus ahorros.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'from',
              label: 'De',
              type: 'text',
              required: true,
              defaultValue: 'EUR',
              maxLength: 3,
              admin: { width: '15%' },
            },
            {
              name: 'to',
              label: 'A',
              type: 'text',
              required: true,
              defaultValue: 'AUD',
              maxLength: 3,
              admin: { width: '15%' },
            },
            {
              name: 'rate',
              label: 'Tipo (1 «De» = X «A»)',
              type: 'number',
              required: true,
              min: 0,
              admin: { width: '25%' },
            },
            {
              name: 'observedAt',
              label: 'Fecha del dato',
              type: 'date',
              required: true,
              admin: { width: '20%', date: { pickerAppearance: 'dayOnly' } },
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
      ],
    },
  ],
}
