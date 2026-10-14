import { SOURCE_KINDS } from '@/lib/sourceKinds'
import type { Source } from '@/payload-types'

import { VerificationStatus } from './VerificationStatus'

const kindLabel = (k: string) => SOURCE_KINDS.find((s) => s.value === k)?.label ?? k

export function SourceList({ sources }: { sources: Source[] }) {
  if (!sources.length) {
    return <p className="muted">Esta página todavía no tiene fuentes registradas.</p>
  }
  return (
    <ol className="sources">
      {sources.map((s) => (
        <li key={s.id}>
          <a href={s.url} rel="noopener noreferrer" target="_blank">
            {s.title}
          </a>{' '}
          <span className="muted small">
            — {s.publisher}. {kindLabel(s.kind)}.
          </span>
          <div>
            <VerificationStatus verification={s.verification} />
          </div>
          {s.limitations ? <p className="muted small">{s.limitations}</p> : null}
        </li>
      ))}
    </ol>
  )
}
