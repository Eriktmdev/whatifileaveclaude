import type { PathwayWithRequirements } from '@/lib/content'
import { isInForce, renderStatement } from '@/lib/verification'

import { CRITERION_ICONS, FallbackRequirementIcon, Icon } from './icons'
import { VerificationStatus } from './VerificationStatus'

/**
 * Requisitos de una vía, leídos de la colección «Requisitos».
 * Es el mismo dato que usará la herramienta «Explora tus opciones».
 */
export function RequirementList({ pathway }: { pathway: PathwayWithRequirements }) {
  const reqs = pathway.requirementDocs.filter((r) => isInForce(r.verification))
  return (
    <section aria-labelledby={`req-${pathway.id}`} className="block">
      <h2 id={`req-${pathway.id}`}>
        Requisitos: {pathway.name}
        {pathway.officialCode ? <span className="muted"> · {pathway.officialCode}</span> : null}
      </h2>
      <p className="muted">{pathway.summary}</p>
      {reqs.length === 0 ? (
        <p className="muted">Todavía no hay requisitos publicados para esta vía.</p>
      ) : (
        <ul className="req-grid">
          {reqs.map((r) => {
            const ReqIcon =
              (r.rule?.criterion && CRITERION_ICONS[r.rule.criterion]) || FallbackRequirementIcon
            return (
              <li key={r.id} className="req-card">
                <div className="req-head">
                  <span className="req-icon">
                    <Icon icon={ReqIcon} />
                  </span>
                  <h3>{r.title}</h3>
                </div>
                <p>{renderStatement(r.statement, r.rule)}</p>
                {r.scope?.note ? <p className="details">Ámbito: {r.scope.note}</p> : null}
                {r.details ? <p className="details">{r.details}</p> : null}
                <div className="req-foot">
                  <VerificationStatus verification={r.verification} />
                  {(r.sources ?? [])
                    .filter((s, i, all) => all.findIndex((x) => x.publisher === s.publisher) === i)
                    .map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="small"
                      >
                        {s.publisher}
                      </a>
                    ))}
                </div>
              </li>
            )
          })}
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
