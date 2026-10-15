import type { Field } from 'payload'

import { EDITORIAL_STATES, editorialState, editorialLabel } from '@/lib/editorial'

/** Campos de flujo editorial comunes. Ver src/lib/editorial.ts. */
export const editorialFields = (): Field[] => [
  {
    name: 'editorialState',
    label: 'Estado editorial',
    type: 'select',
    options: [...EDITORIAL_STATES],
    virtual: true,
    admin: {
      position: 'sidebar',
      readOnly: true,
      description:
        'Se calcula solo a partir de los campos de abajo, la verificación y la publicación.',
    },
    hooks: {
      afterRead: [({ data }) => (data ? editorialState(data) : undefined)],
    },
  },
  {
    name: 'reviewRequested',
    label: 'Pendiente de revisión',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description:
        'Marca el borrador como listo para revisar antes de publicar. Se desmarca al publicar.',
    },
  },
  {
    name: 'lastEditedBy',
    label: 'Última edición por',
    type: 'relationship',
    relationTo: 'users',
    access: { read: ({ req }) => Boolean(req.user) },
    admin: { position: 'sidebar', readOnly: true },
  },
  {
    name: 'archived',
    label: 'Archivado',
    type: 'checkbox',
    defaultValue: false,
    index: true,
    admin: {
      position: 'sidebar',
      description:
        'Oculta el contenido de la web sin borrarlo. Útil cuando una vía o dato deja de existir.',
    },
  },
]

export { editorialLabel }
