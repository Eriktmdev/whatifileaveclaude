import type { PathwayWithRequirements } from '@/lib/content'
import { isInForce, renderStatement } from '@/lib/verification'

import { VerificationStatus } from './VerificationStatus'

/**
 * Requisitos de una vía, leídos de la colección «Requisitos».
 * Es el mismo dato que usará la herramienta «Explora tus opciones».
 */
export function RequirementList({ pathway }: { pathway: PathwayWithRequirements }) {
  const reqs = pathway.requirementDocs.filter((r) => isInForce(r.verification))
  return (
    <section aria-labelledby={`req-${pathway.id}`}>
      <h2 id={`req-${pathway.id}`}>
        Requisitos principales: {pathway.name}
        {pathway.officialCode ? ` (${pathway.officialCode})` : ''}
      </h2>
      <p className="muted">{pathway.summary}</p>
      {reqs.length === 0 ? (
        <p className="muted">Todavía no hay requisitos publicados para esta vía.</p>
      ) : (
        <ul className="requirements">
          {reqs.map((r) => (
            <li key={r.id} className="requirement">
              <div className="requirement-head">
                <span className="requirement-title">{r.title}</span>
                <VerificationStatus verification={r.verification} />
              </div>
              <p>{renderStatement(r.statement, r.rule)}</p>
              {r.scope?.note ? <p className="details">Ámbito: {r.scope.note}</p> : null}
              {r.details ? <p className="details">{r.details}</p> : null}
              {r.sources?.length ? (
                <p className="details">
                  {r.sources.length > 1 ? 'Fuentes' : 'Fuente'}:{' '}
                  {r.sources.map((s, i) => (
                    <span key={s.id}>
                      {i > 0 ? ' · ' : ''}
                      <a href={s.url} rel="noopener noreferrer" target="_blank">
                        {s.title}
                      </a>
                    </span>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {pathway.notCovered ? (
        <div className="notice notice-info">
          <p>
            <strong>Lo que esta ficha no cubre:</strong> {pathway.notCovered}
          </p>
        </div>
      ) : null}
    </section>
  )
}
