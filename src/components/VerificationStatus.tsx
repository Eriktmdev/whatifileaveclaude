import { formatDate, freshness, type VerificationData } from '@/lib/verification'

/** Etiqueta honesta del estado de un dato. Nunca inventa una fecha. */
export function VerificationStatus({ verification }: { verification?: VerificationData | null }) {
  const status = verification?.reviewStatus ?? 'unverified'
  if (status === 'needs_review') {
    return <span className="status status-needs_review">En revisión</span>
  }
  if (status !== 'verified' || !verification?.lastVerifiedAt) {
    return <span className="status status-unverified">Sin verificar</span>
  }
  const date = formatDate(verification.lastVerifiedAt)
  if (freshness(verification.lastVerifiedAt) === 'stale') {
    return (
      <span className="status status-stale">Comprobado el {date} · puede estar desactualizado</span>
    )
  }
  return <span className="status status-verified">Comprobado el {date}</span>
}
