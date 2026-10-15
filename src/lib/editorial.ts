/**
 * Estado editorial visible (5 estados), derivado de campos simples:
 * - archived            → Archivado (nunca público)
 * - verification = needs_review → Necesita revisión (sigue público con aviso si ya estaba publicado)
 * - _status = published → Publicado
 * - reviewRequested     → Pendiente de revisión
 * - resto               → Borrador
 */
export const EDITORIAL_STATES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'pending_review', label: 'Pendiente de revisión' },
  { value: 'published', label: 'Publicado' },
  { value: 'needs_review', label: 'Necesita revisión' },
  { value: 'archived', label: 'Archivado' },
] as const

export type EditorialState = (typeof EDITORIAL_STATES)[number]['value']

export function editorialState(doc: {
  archived?: boolean | null
  reviewRequested?: boolean | null
  _status?: string | null
  verification?: { reviewStatus?: string | null } | null
}): EditorialState {
  if (doc.archived) return 'archived'
  if (doc.verification?.reviewStatus === 'needs_review') return 'needs_review'
  if (doc._status === 'published') return 'published'
  if (doc.reviewRequested) return 'pending_review'
  return 'draft'
}

export const editorialLabel = (s: EditorialState) =>
  EDITORIAL_STATES.find((e) => e.value === s)?.label ?? s
