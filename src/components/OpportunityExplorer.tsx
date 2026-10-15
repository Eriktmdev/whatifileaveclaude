'use client'

import React, { useMemo, useState } from 'react'

import { SECTORS, sectorLabel } from '@/lib/sectors'

export type ExplorerItem = {
  id: number
  title: string
  sector: string
  summary: string
  adjacentProfiles: string[]
  barriers?: string | null
  entryRequirements?: string | null
  regions: string[]
  signals: {
    kind: string
    label: string
    statement: string
    source?: { title: string; url: string } | null
    observedAt?: string
  }[]
  verified: boolean
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Explorador con filtros que explican por qué aparece cada resultado. Sin rankings. */
export function OpportunityExplorer({
  items,
  regions,
}: {
  items: ExplorerItem[]
  regions: string[]
}) {
  const [sector, setSector] = useState('')
  const [region, setRegion] = useState('')
  const [experience, setExperience] = useState('')

  const results = useMemo(() => {
    const exp = norm(experience.trim())
    return items
      .map((o) => {
        const reasons: string[] = []
        if (sector && o.sector !== sector) return null
        if (sector) reasons.push(`Sector: ${sectorLabel(o.sector)}.`)
        if (region && !o.regions.includes(region)) return null
        if (region) reasons.push(`Registrada en ${region}.`)
        if (exp) {
          const hits = o.adjacentProfiles.filter(
            (a) => norm(a).includes(exp) || exp.includes(norm(a)),
          )
          const inText = norm(`${o.title} ${o.summary}`).includes(exp)
          if (!hits.length && !inText) return null
          reasons.push(
            hits.length ? `Cercana a «${hits.join('», «')}».` : 'Coincide con tu búsqueda.',
          )
        }
        return { o, reasons }
      })
      .filter((x): x is { o: ExplorerItem; reasons: string[] } => x !== null)
  }, [items, sector, region, experience])

  return (
    <div>
      <form
        className="filters"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filtrar oportunidades"
      >
        <label>
          <span>Tu experiencia</span>
          <input
            className="input"
            placeholder="Ej.: soporte técnico"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </label>
        <label>
          <span>Sector</span>
          <select className="input" value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">Todos</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {regions.length ? (
          <label>
            <span>Región</span>
            <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Todas</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </form>

      <p className="muted small" aria-live="polite">
        {results.length} {results.length === 1 ? 'oportunidad' : 'oportunidades'}. Orden alfabético:
        no es un ranking.
      </p>

      {results.length === 0 ? (
        <p className="muted">
          No hay oportunidades registradas con esos filtros. Prueba a quitar alguno.
        </p>
      ) : (
        <ul className="card-grid">
          {results.map(({ o, reasons }) => (
            <li key={o.id}>
              <article className="pathway-card" style={{ height: '100%' }}>
                <span className="tag">{sectorLabel(o.sector)}</span>
                <h3>{o.title}</h3>
                <p>{o.summary}</p>
                {reasons.length ? (
                  <p className="small">
                    <strong>Por qué aparece:</strong> {reasons.join(' ')}
                  </p>
                ) : null}
                {o.regions.length ? (
                  <p className="small muted">Regiones: {o.regions.join(', ')}</p>
                ) : null}
                {o.entryRequirements ? (
                  <p className="small muted">
                    <strong>Requisitos de acceso:</strong> {o.entryRequirements}
                  </p>
                ) : null}
                {o.barriers ? (
                  <p className="small muted">
                    <strong>Barreras:</strong> {o.barriers}
                  </p>
                ) : null}
                {o.signals.length ? (
                  <ul className="mini-list">
                    {o.signals.map((s, i) => (
                      <li key={i}>
                        <strong>{s.label}:</strong> {s.statement}{' '}
                        {s.source ? (
                          <a href={s.source.url} rel="noopener noreferrer" target="_blank">
                            {s.source.title}
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="volatile">Sin evidencia de mercado verificada todavía.</p>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
