import type { Country, Source } from '@/payload-types'

import { FACT_ICONS, Icon } from './icons'

export function QuickFacts({ facts }: { facts: Country['quickFacts'] }) {
  if (!facts?.length) return null
  return (
    <dl className="facts">
      {facts.map((f) => {
        const source = typeof f.source === 'object' ? (f.source as Source | null) : null
        return (
          <div key={f.id} className="fact">
            <span className="fact-icon">
              <Icon icon={FACT_ICONS[f.icon ?? 'other'] ?? FACT_ICONS.other} />
            </span>
            <div>
              <dt>{f.label}</dt>
              <dd>
                {f.value}
                {source ? (
                  <>
                    {' '}
                    <a
                      className="fact-source"
                      href={source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={`Fuente: ${source.title}`}
                    >
                      <span className="visually-hidden">Fuente: {source.title}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </>
                ) : null}
              </dd>
            </div>
          </div>
        )
      })}
    </dl>
  )
}
