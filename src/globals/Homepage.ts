import type { GlobalConfig } from 'payload'

import { isStaff } from '@/access'
import { revalidateSiteGlobal } from '@/hooks/revalidate'

/** Textos y destacados de la portada, editables sin tocar código. */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Portada',
  admin: { group: 'Contenido' },
  access: { read: () => true, update: isStaff },
  hooks: { afterChange: [revalidateSiteGlobal] },
  fields: [
    {
      name: 'heroTitle',
      label: 'Título principal',
      type: 'text',
      required: true,
      defaultValue: '¿Y si te fueras?',
    },
    {
      name: 'heroSubtitle',
      label: 'Subtítulo',
      type: 'textarea',
      required: true,
      defaultValue:
        'Descubre oportunidades reales para vivir y trabajar fuera, entiende qué te pedirían y convierte la idea en un plan.',
    },
    {
      name: 'featuredGuides',
      label: 'Guías destacadas',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
      maxRows: 3,
    },
    {
      name: 'faqs',
      label: 'Preguntas frecuentes',
      type: 'array',
      fields: [
        { name: 'question', label: 'Pregunta', type: 'text', required: true },
        { name: 'answer', label: 'Respuesta', type: 'textarea', required: true },
      ],
    },
  ],
}
