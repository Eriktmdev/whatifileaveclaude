'use client'

import { CircleCheck, CircleHelp, CircleMinus, CircleX, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { type PathwayResult, type RequirementResult, groupResults } from '@/lib/evaluation'
import { type Knowledge, buildFreeResult, profileSummary } from '@/lib/freeResult'
import { sectorLabel } from '@/lib/sectors'

import { useStoredProfile } from './useStoredProfile'

const SUMMARY_TEXT: Record<PathwayResult['summary'], { title: string; tone: string }> = {
  fails_some: {
    title: 'Según tus respuestas, algún requisito no parece cumplirse',
    tone: 'tone-fail',
  },
  pending_checks: {
    title: 'Podría merecer la pena investigarla: hay requisitos por comprobar',
    tone: 'tone-pending',
  },
  meets_evaluated: {
    title: 'Coincide con los requisitos que hemos podido evaluar',
    tone: 'tone-ok',
  },
  not_covered: {
    title: 'Nuestro recorrido no cubre tu pasaporte para esta vía',
    tone: 'tone-pending',
  },
}

function Group({
  title,
  icon,
  items,
  empty,
}: {
  title: string
  icon: React.ReactNode
  items: RequirementResult[]
  empty?: string
}) {
  if (!items.length && !empty) return null
  return (
    <div className="result-group">
      <h4>
        {icon} {title} <span className="muted">({items.length})</span>
      </h4>
      {items.length ? (
        <ul>
          {items.map((r) => (
            <li key={r.requirement.id}>
              <strong>{r.requirement.title}.</strong> {r.requirement.statement}
              <div className="small muted">
                {r.explanation}
                {r.requirement.source ? (
                  <>
                    {' '}
                    <a href={r.requirement.source.url} rel="noopener noreferrer" target="_blank">
                      Fuente
                    </a>
                  </>
                ) : null}
                {!r.requirement.verified ? ' · Dato sin verificar' : ''}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="small muted">{empty}</p>
      )}
    </div>
  )
}

export function ResultView({ knowledge }: { knowledge: Knowledge }) {
  const { profile, loaded } = useStoredProfile()
  if (!loaded) return <p className="muted">Cargando…</p>

  const isEmpty = Object.keys(profile).length === 0
  if (isEmpty) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Todavía no hay respuestas</h2>
        <p>Responde unas preguntas cortas para ver tu resultado. No necesitas cuenta.</p>
        <Link className="button" href="/analisis">
          Empezar
        </Link>
      </div>
    )
  }

  const result = buildFreeResult(profile, knowledge)

  return (
    <div className="result">
      {knowledge.includesDemo ? (
        <div className="notice notice-demo" role="note">
          <p>
            <strong>Resultado con datos de demostración.</strong> Los requisitos y oportunidades que
            ves aún no están verificados. Sirve para probar la herramienta, no para decidir.
          </p>
        </div>
      ) : null}

      <section className="panel result-profile" aria-labelledby="r-perfil">
        <h2 id="r-perfil">Tu punto de partida</h2>
        <p>{profileSummary(profile)}</p>
        {result.goals.length ? (
          <p className="muted">Buscas: {result.goals.join(', ').toLowerCase()}.</p>
        ) : null}
        <Link href="/analisis" className="text-link">
          <Pencil size={16} aria-hidden="true" /> Cambiar respuestas
        </Link>
      </section>

      <section aria-labelledby="r-pasos" className="block">
        <h2 id="r-pasos">Tus 3 siguientes pasos</h2>
        <ol className="next-steps">
          {result.nextSteps.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <p>{s.why}</p>
              {s.href ? (
                s.href.startsWith('http') ? (
                  <a href={s.href} rel="noopener noreferrer" target="_blank" className="text-link">
                    Abrir fuente <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <Link href={s.href} className="text-link">
                    Abrir
                  </Link>
                )
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="r-vias" className="block">
        <h2 id="r-vias">Vías que merece la pena investigar</h2>
        <p className="muted">
          Esto no es una aprobación migratoria. Comparamos tus respuestas con los requisitos
          publicados; la decisión la toma siempre la administración del país.
        </p>
        {result.pathways.map((p) => {
          const g = groupResults(p.results)
          const s = SUMMARY_TEXT[p.summary]
          return (
            <article key={p.pathway.id} className="panel pathway-result">
              <h3>
                <Link href={p.pathway.url}>
                  {p.pathway.name}
                  {p.pathway.officialCode ? ` (${p.pathway.officialCode})` : ''}
                </Link>
              </h3>
              <p className={`result-headline ${s.tone}`}>{s.title}</p>
              {p.coversPassport ? (
                <div className="result-groups">
                  <Group
                    title="Coincide"
                    icon={<CircleCheck size={18} aria-hidden="true" />}
                    items={g.meets}
                  />
                  <Group
                    title="Parece no coincidir"
                    icon={<CircleX size={18} aria-hidden="true" />}
                    items={g.fails}
                  />
                  <Group
                    title="Falta comprobar"
                    icon={<CircleHelp size={18} aria-hidden="true" />}
                    items={g.unknown}
                  />
                  <Group
                    title="La herramienta no lo evalúa"
                    icon={<CircleMinus size={18} aria-hidden="true" />}
                    items={g.notEvaluated}
                  />
                </div>
              ) : (
                <p className="muted">
                  Consulta la fuente oficial para saber si hay una vía para tu nacionalidad.
                </p>
              )}
            </article>
          )
        })}
      </section>

      <section aria-labelledby="r-oportunidades" className="block">
        <h2 id="r-oportunidades">Primeras oportunidades a explorar</h2>
        {result.opportunities.length ? (
          <ul className="card-grid">
            {result.opportunities.map(({ opportunity: o, reasons, cautions }) => (
              <li key={o.id}>
                <article className="pathway-card" style={{ height: '100%' }}>
                  <span className="tag">{sectorLabel(o.sector)}</span>
                  <h3>{o.title}</h3>
                  <p>{o.summary}</p>
                  <p className="small">
                    <strong>Por qué te lo mostramos:</strong> {reasons.join(' ')}
                  </p>
                  {o.barriers ? (
                    <p className="small muted">
                      <strong>Barreras:</strong> {o.barriers}
                    </p>
                  ) : null}
                  {cautions.length ? <p className="volatile">{cautions.join(' ')}</p> : null}
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            No encontramos oportunidades registradas que encajen con lo que nos has contado. Prueba
            a indicar tu sector y tus competencias, o{' '}
            <Link href="/australia/oportunidades">explora todas las oportunidades</Link>.
          </p>
        )}
      </section>

      <section aria-labelledby="r-obstaculos" className="block">
        <h2 id="r-obstaculos">Principales obstáculos</h2>
        {result.obstacles.length ? (
          <ul>
            {result.obstacles.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            Con lo que nos has contado no detectamos obstáculos claros, pero revisa lo que falta
            comprobar.
          </p>
        )}
      </section>

      <section aria-labelledby="r-dinero" className="block">
        <h2 id="r-dinero">Estimación económica</h2>
        <p className="muted">
          Todavía no tenemos datos de costes verificados (alquiler, transporte, impuestos) para
          hacer una estimación honesta. Cuando los tengamos, verás aquí escenarios con su fuente.
          Mientras tanto, revisa el requisito de fondos de cada vía.
        </p>
      </section>

      <section aria-labelledby="r-falta" className="block">
        <h2 id="r-falta">Qué información falta</h2>
        {result.missing.length ? (
          <ul>
            {result.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nada importante.</p>
        )}
      </section>

      {result.guides.length ? (
        <section aria-labelledby="r-guias" className="block">
          <h2 id="r-guias">Para leer después</h2>
          <ul>
            {result.guides.map((g) => (
              <li key={g.url}>
                <Link href={g.url}>{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="r-premium" className="block panel">
        <h2 id="r-premium" style={{ marginTop: 0 }}>
          Qué aportaría un análisis personalizado
        </h2>
        <p>
          Este resultado compara tus respuestas con requisitos y oportunidades registradas. Un
          análisis personalizado iría más allá: investigaría oportunidades concretas para tu perfil
          con fuentes, compararía regiones, calcularía escenarios de ahorro y prepararía un plan de
          3, 6 o 12 meses.
        </p>
        <p className="muted small">Está en desarrollo. Todavía no se puede contratar.</p>
      </section>
    </div>
  )
}
