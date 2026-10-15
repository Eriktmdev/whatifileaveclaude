import { CircleCheck, CircleMinus, ExternalLink, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AnalysisCta } from '@/components/AnalysisCta'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { GuideCard } from '@/components/GuideCard'
import { RequirementList } from '@/components/RequirementList'
import { SourceList } from '@/components/SourceList'
import { VerificationStatus } from '@/components/VerificationStatus'
import { asDocs, getGuidesForPathway, getPathway, getPathwaysWithRequirements } from '@/lib/content'
import type { Country, Source } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ country: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, slug } = await params
  const pathway = await getPathway(country, slug)
  if (!pathway) return {}
  const title = `${pathway.name}${pathway.officialCode ? ` (${pathway.officialCode})` : ''}: requisitos y condiciones`
  return {
    title,
    description: pathway.summary,
    alternates: { canonical: `/${country}/vias/${pathway.slug}` },
    robots: pathway.isDemo ? { index: false } : undefined,
  }
}

const fmtMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

export default async function PathwayPage({ params }: Props) {
  const { country: countrySlug, slug } = await params
  const pathway = await getPathway(countrySlug, slug)
  if (!pathway) notFound()

  const country = pathway.country as Country
  const [[withReqs], guides] = await Promise.all([
    getPathwaysWithRequirements([pathway.id]),
    getGuidesForPathway(pathway.id),
  ])
  const sources = asDocs<Source>(pathway.sources)

  return (
    <div className="container narrow">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: country.name, href: `/${country.slug}` },
          { label: pathway.name, href: `/${country.slug}/vias/${pathway.slug}` },
        ]}
      />
      <header className="guide-header">
        <span className="eyebrow">
          Vía migratoria{pathway.officialCode ? ` · ${pathway.officialCode}` : ''}
        </span>
        <h1>{pathway.name}</h1>
        {pathway.officialName ? (
          <p className="muted">Nombre oficial: {pathway.officialName}</p>
        ) : null}
        <p className="lead">{pathway.summary}</p>
        <div className="meta-strip">
          <span>
            <ShieldCheck size={16} aria-hidden="true" />{' '}
            <VerificationStatus verification={pathway.verification} />
          </span>
        </div>
      </header>

      {pathway.isDemo ? <DemoNotice what="Esta ficha" /> : null}
      {pathway.verification?.reviewStatus === 'needs_review' ? (
        <div className="notice notice-info" role="note">
          <p>
            Estamos revisando esta ficha porque alguna de sus fuentes ha cambiado. Confirma los
            datos en la web oficial.
          </p>
        </div>
      ) : null}

      {pathway.advantages?.length || pathway.restrictions?.length ? (
        <section className="block two-col" aria-label="Ventajas y restricciones">
          {pathway.advantages?.length ? (
            <div className="panel">
              <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>Lo que permite</h2>
              <ul className="list-plain">
                {pathway.advantages.map((a) => (
                  <li key={a.id}>
                    <CircleCheck size={18} color="var(--accent)" aria-hidden="true" /> {a.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {pathway.restrictions?.length ? (
            <div className="panel">
              <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>Restricciones y condiciones</h2>
              <ul className="list-plain">
                {pathway.restrictions.map((r) => (
                  <li key={r.id}>
                    <CircleMinus size={18} color="var(--warn-text)" aria-hidden="true" /> {r.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {pathway.limits ? (
        <section className="block">
          <h2>Límites de esta vía</h2>
          <p>{pathway.limits}</p>
        </section>
      ) : null}

      {withReqs ? <RequirementList pathway={withReqs} onPathwayPage /> : null}

      <AnalysisCta />

      <section className="block" aria-labelledby="h-costes">
        <h2 id="h-costes">Costes conocidos</h2>
        {pathway.knownCosts?.length ? (
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Concepto</th>
                  <th scope="col">Importe</th>
                  <th scope="col">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {pathway.knownCosts.map((c) => {
                  const src = typeof c.source === 'object' ? c.source : null
                  return (
                    <tr key={c.id}>
                      <td>
                        {c.concept}
                        {c.note ? <div className="small muted">{c.note}</div> : null}
                      </td>
                      <td>{fmtMoney(c.amount, c.currency)}</td>
                      <td>
                        {src ? (
                          <a href={src.url} rel="noopener noreferrer" target="_blank">
                            {src.publisher}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            Todavía no hay costes verificados para esta vía. No mostramos importes hasta
            comprobarlos en la fuente oficial.
          </p>
        )}
      </section>

      {pathway.notCovered ? (
        <div className="notice notice-info">
          <p>
            <strong>Lo que esta ficha no cubre:</strong> {pathway.notCovered}
          </p>
        </div>
      ) : null}

      {pathway.officialBodies?.length ? (
        <section className="block">
          <h2>Organismos oficiales</h2>
          <ul className="list-plain">
            {pathway.officialBodies.map((b) => (
              <li key={b.id}>
                <ExternalLink size={16} aria-hidden="true" />
                {b.url ? (
                  <a href={b.url} rel="noopener noreferrer" target="_blank">
                    {b.name}
                  </a>
                ) : (
                  b.name
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {guides.length ? (
        <section className="block">
          <h2>Guías sobre esta vía</h2>
          <ul className="card-grid">
            {guides.map((g) => (
              <li key={g.id}>
                <GuideCard guide={g} countrySlug={country.slug} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="block" aria-labelledby="h-fuentes">
        <h2 id="h-fuentes">Fuentes</h2>
        <SourceList sources={sources} />
      </section>
    </div>
  )
}
