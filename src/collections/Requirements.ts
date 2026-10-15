import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { editorialFields } from '@/fields/editorial'
import { demoField, verificationField } from '@/fields/verification'
import { enforceEditorialRules, requirementDependents } from '@/hooks/editorial'
import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidate'
import { CRITERIA, OPERATORS } from '@/lib/criteria'
import { PASSPORTS } from '@/lib/passports'

/**
 * Un requisito se escribe UNA vez aquí. Las guías y la herramienta lo leen
 * desde aquí; no se copia a mano en los artículos.
 */
export const Requirements: CollectionConfig = {
  slug: 'requirements',
  labels: { singular: 'Requisito', plural: 'Requisitos' },
  admin: {
    useAsTitle: 'title',
    group: 'Conocimiento',
    defaultColumns: ['title', 'pathway', 'type', 'volatility', 'editorialState', 'isDemo'],
  },
  versions: { drafts: true },
  defaultSort: 'order',
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  hooks: {
    beforeChange: [enforceEditorialRules({ collection: 'requirements', hasDrafts: true })],
    afterChange: [requirementDependents, revalidateSite],
    afterDelete: [revalidateSiteOnDelete],
  },
  fields: [
    {
      name: 'title',
      label: 'Nombre corto',
      type: 'text',
      required: true,
      admin: { description: 'Ej.: «Edad», «Fondos suficientes».' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pathway',
          label: 'Vía migratoria',
          type: 'relationship',
          relationTo: 'pathways',
          required: true,
          admin: { width: '70%' },
        },
        {
          name: 'order',
          label: 'Orden',
          type: 'number',
          defaultValue: 10,
          admin: { width: '30%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Tipo',
          type: 'select',
          defaultValue: 'eligibility',
          options: [
            { label: 'Elegibilidad', value: 'eligibility' },
            { label: 'Documentación', value: 'document' },
            { label: 'Económico', value: 'financial' },
            { label: 'Salud y antecedentes', value: 'health_character' },
            { label: 'Cupo o plazas', value: 'quota' },
            { label: 'Otro', value: 'other' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'volatility',
          label: 'Volatilidad',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Baja (rara vez cambia)', value: 'low' },
            { label: 'Media', value: 'medium' },
            { label: 'Alta (cambia a menudo: importes, cupos…)', value: 'high' },
          ],
          admin: {
            width: '50%',
            description:
              'Con volatilidad alta la web muestra un aviso y el panel lo prioriza en revisiones.',
          },
        },
      ],
    },
    {
      name: 'statement',
      label: 'Enunciado del requisito',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Texto público. Si el requisito tiene una regla con valores, usa {min}, {max} o {values} en lugar de escribir el número: así el dato vive en un solo sitio.',
      },
    },
    {
      name: 'details',
      label: 'Matices',
      type: 'textarea',
      admin: { description: 'Excepciones, cómo se acredita, errores frecuentes.' },
    },
    {
      name: 'scope',
      label: 'Ámbito de aplicación',
      type: 'group',
      fields: [
        {
          name: 'passports',
          label: 'Aplica a estos pasaportes',
          type: 'select',
          hasMany: true,
          options: [...PASSPORTS],
          admin: { description: 'Vacío = aplica a todos los pasaportes de la vía.' },
        },
        {
          name: 'note',
          label: 'Nota de ámbito',
          type: 'text',
          admin: { description: 'Ej.: «Solo para la primera solicitud».' },
        },
      ],
    },
    {
      name: 'rule',
      label: 'Regla para la herramienta',
      type: 'group',
      admin: {
        description:
          'Cómo la herramienta «Explora tus opciones» trata este requisito. La IA nunca decide la elegibilidad: solo estas reglas.',
      },
      fields: [
        {
          name: 'mode',
          label: 'Modo',
          type: 'select',
          required: true,
          defaultValue: 'not_evaluated',
          options: [
            { label: 'Regla automática', value: 'rule' },
            { label: 'La persona lo confirma (sí / no / no lo sé)', value: 'self_declared' },
            { label: 'La herramienta no lo evalúa', value: 'not_evaluated' },
          ],
        },
        {
          name: 'criterion',
          label: 'Criterio',
          type: 'select',
          options: CRITERIA.map(({ label, value }) => ({ label, value })),
          admin: { condition: (_, s) => s?.mode === 'rule' },
        },
        {
          name: 'operator',
          label: 'Operador',
          type: 'select',
          options: [...OPERATORS],
          admin: { condition: (_, s) => s?.mode === 'rule' },
        },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.mode === 'rule' },
          fields: [
            { name: 'min', label: 'Mínimo', type: 'number', admin: { width: '33%' } },
            { name: 'max', label: 'Máximo', type: 'number', admin: { width: '33%' } },
            {
              name: 'unit',
              label: 'Unidad',
              type: 'text',
              admin: { width: '33%', description: 'Ej.: años, AUD' },
            },
          ],
        },
        {
          name: 'values',
          label: 'Valores permitidos',
          type: 'text',
          hasMany: true,
          admin: { condition: (_, s) => s?.mode === 'rule' },
        },
        {
          name: 'question',
          label: 'Pregunta para la persona',
          type: 'text',
          admin: {
            condition: (_, s) => s?.mode === 'self_declared',
            description: 'Pregunta clara que admita «Sí», «No» o «No lo sé».',
          },
        },
      ],
    },
    {
      name: 'sources',
      label: 'Fuentes',
      type: 'relationship',
      relationTo: 'sources',
      hasMany: true,
      admin: { description: 'Para requisitos, prioriza fuentes oficiales.' },
    },
    verificationField(),
    demoField,
    ...editorialFields(),
  ],
}
