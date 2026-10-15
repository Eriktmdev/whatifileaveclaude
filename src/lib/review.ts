import { freshness } from './verification'

/** Prioridad de un elemento en la cola de revisión (mayor = antes). Pura y testeable. */
export function reviewPriority(item: {
  reviewStatus?: string | null
  volatility?: string | null
  dependents: number
  flaggedAt?: string | null
  lastVerifiedAt?: string | null
  now?: Date
}): number {
  let score = 0
  if (item.reviewStatus === 'needs_review') score += 100
  if (item.volatility === 'high') score += 20
  score += Math.min(item.dependents, 10) * 5
  if (item.flaggedAt) {
    const days =
      ((item.now ?? new Date()).getTime() - new Date(item.flaggedAt).getTime()) / 86_400_000
    score += Math.min(Math.floor(days), 30)
  }
  if (item.reviewStatus === 'verified' && freshness(item.lastVerifiedAt, item.now) === 'stale')
    score += 40
  return score
}

/** Última línea de la nota de revisión: el motivo más reciente. */
export function latestReason(note: string | null | undefined): string {
  if (!note) return 'Sin motivo indicado'
  const lines = note
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return lines[lines.length - 1] ?? 'Sin motivo indicado'
}
