/**
 * Reglas editoriales puras (sin Payload) para poder probarlas con facilidad.
 *
 * Conceptos:
 * - Fecha de edición (`updatedAt`): la pone Payload sola cada vez que se guarda.
 * - Fecha de verificación (`verification.lastVerifiedAt`): la escribe una
 *   persona SOLO cuando ha abierto las fuentes y comprobado el dato.
 *   Guardar un documento no la cambia.
 */

export const REVIEW_STATUSES = [
  { label: 'Sin verificar', value: 'unverified' },
  { label: 'Verificado', value: 'verified' },
  { label: 'Necesita revisión', value: 'needs_review' },
] as const

export type ReviewStatus = (typeof REVIEW_STATUSES)[number]['value']

export type VerificationData = {
  reviewStatus?: ReviewStatus | null
  lastVerifiedAt?: string | Date | null
  validFrom?: string | Date | null
  validUntil?: string | Date | null
  reviewNote?: string | null
}

/** Días tras los que un dato verificado se muestra como «comprobado hace tiempo». */
export const STALE_AFTER_DAYS = 180

const toDate = (d: string | Date | null | undefined) => (d ? new Date(d) : null)

/** Coherencia interna del bloque de verificación (se aplica siempre al guardar). */
export function validateVerification(v: VerificationData | undefined, now = new Date()): string[] {
  const errors: string[] = []
  const verifiedAt = toDate(v?.lastVerifiedAt)
  if (v?.reviewStatus === 'verified' && !verifiedAt) {
    errors.push(
      'Para marcarlo como «Verificado» indica la fecha real en que comprobaste las fuentes.',
    )
  }
  if (verifiedAt && verifiedAt.getTime() > now.getTime() + 60_000) {
    errors.push('La fecha de verificación no puede estar en el futuro.')
  }
  const from = toDate(v?.validFrom)
  const until = toDate(v?.validUntil)
  if (from && until && until < from) {
    errors.push('La vigencia termina antes de empezar.')
  }
  return errors
}

/**
 * Condiciones para publicar contenido real (no demo):
 * verificado, con fecha de verificación y al menos una fuente.
 * El contenido demo puede publicarse para desarrollo, pero la web pública
 * lo oculta salvo que SHOW_DEMO_CONTENT=true.
 */
export function validatePublishable(input: {
  isDemo?: boolean | null
  verification?: VerificationData
  sourcesCount: number
  requiresSources?: boolean
}): string[] {
  if (input.isDemo) return []
  const errors: string[] = []
  if (input.verification?.reviewStatus !== 'verified') {
    errors.push('Solo se puede publicar contenido con estado «Verificado».')
  }
  if (!input.verification?.lastVerifiedAt) {
    errors.push('Falta la fecha de verificación.')
  }
  if (input.requiresSources !== false && input.sourcesCount < 1) {
    errors.push('Añade al menos una fuente antes de publicar.')
  }
  return errors
}

export type Freshness = 'never' | 'fresh' | 'stale'

export function freshness(
  lastVerifiedAt: string | Date | null | undefined,
  now = new Date(),
  staleAfterDays = STALE_AFTER_DAYS,
): Freshness {
  const d = toDate(lastVerifiedAt)
  if (!d) return 'never'
  const ageDays = (now.getTime() - d.getTime()) / 86_400_000
  return ageDays > staleAfterDays ? 'stale' : 'fresh'
}

/** Vigencia: ¿el dato aplica hoy? */
export function isInForce(v: VerificationData | undefined, now = new Date()): boolean {
  const from = toDate(v?.validFrom)
  const until = toDate(v?.validUntil)
  if (from && now < from) return false
  if (until && now > until) return false
  return true
}

/**
 * Los requisitos guardan el valor (p. ej. edad máxima) una sola vez, en la
 * regla. El texto visible usa marcadores {min}, {max} y {values} para que
 * guías y herramienta muestren siempre el mismo dato.
 */
export function renderStatement(
  statement: string,
  rule?: { min?: number | null; max?: number | null; values?: string[] | null },
): string {
  const fmt = (n: number | null | undefined) =>
    n === null || n === undefined ? '¿?' : new Intl.NumberFormat('es-ES').format(n)
  return statement
    .replaceAll('{min}', fmt(rule?.min))
    .replaceAll('{max}', fmt(rule?.max))
    .replaceAll('{values}', rule?.values?.length ? rule.values.join(', ') : '¿?')
}

export function formatDate(d: string | Date | null | undefined): string | null {
  const date = toDate(d)
  if (!date) return null
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
