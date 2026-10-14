import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Persona del equipo', plural: 'Equipo' },
  admin: { useAsTitle: 'email', group: 'Administración' },
  auth: true,
  access: {
    // Solo el equipo existe como usuario. La herramienta pública no usa cuentas.
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text' },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administración', value: 'admin' },
        { label: 'Edición', value: 'editor' },
      ],
      access: { update: isAdminField },
      hooks: {
        // La primera persona registrada siempre es administradora.
        beforeChange: [
          async ({ req, operation, value }) => {
            if (operation !== 'create') return value
            const { totalDocs } = await req.payload.count({ collection: 'users' })
            return totalDocs === 0 ? 'admin' : value
          },
        ],
      },
    },
  ],
}
