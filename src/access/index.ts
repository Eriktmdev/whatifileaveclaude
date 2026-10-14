import type { Access, FieldAccess } from 'payload'

/** Cualquier persona con sesión en el panel (admin o editor). */
export const isStaff: Access = ({ req }) => Boolean(req.user)
export const isStaffField: FieldAccess = ({ req }) => Boolean(req.user)

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'
export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin'

/**
 * Lectura pública: el público solo ve lo publicado; el equipo ve también
 * borradores. Se usa en colecciones con borradores (versions.drafts).
 */
export const publishedOrStaff: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
