import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { getCountry, getGuidesForCountry, getPathwaysForCountry } from '@/lib/content'
import { TOPICS } from '@/lib/topics'

export const revalidate = 3600

type Props = { params: Promise<{ country: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = await getCountry((await params).country)
  if (!country) return {}
  return {
    title: `Vivir en ${country.name}: visados, trabajo y vida diaria`,
    description: country.intro,
    alternates: { canonical: `/${country.slug}` },
    robots: country.isDemo ? { index: false } : undefined,
  }
}

export default async function CountryHub({ params }: Props) {
  const country = await getCountry((await params).country)
  if (!country) notFound()

  const [guides, pathways] = await Promise.all([
    getGuidesForCountry(country.id),
    getPathwaysForCountry(country.id),
  ])
  const topicsWithGuides = TOPICS.filter((t) => guides.some((g) => g.topic === t.value))
  const pendingTopics = TOPICS.filter((t) => !guides.some((g) => g.topic === t.value))
  const intro = (topic: string) => country.topicIntros?.find((t) => t.topic === topic)?.text

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: country.name, href: `/${country.slug}` },
        ]}
      />
      <span className="eyebrow">Destino</span>
      <h1>{country.name}</h1>
      <p className="lead">{country.tagline}</p>
      <p className="prose">{country.intro}</p>
      {country.isDemo ? <DemoNotice what="Esta sección" /> : null}

      {topicsWithGuides.length > 0 ? (
        <nav aria-label="Temas">
          <ul className="chips">
            {topicsWithGuides.map((t) => (
              <li key={t.value}>
                <a href={`#${t.value}`}>{t.short}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <p className="muted">Todavía no hay guías publicadas para este destino.</p>
      )}

      <div className="narrow">
        {topicsWithGuides.map((t) => (
          <section key={t.value} id={t.value} className="section" aria-labelledby={`h-${t.value}`}>
            <h2 id={`h-${t.value}`}>{t.label}</h2>
            <p className="muted">{intro(t.value) ?? t.description}</p>
            <ul className="link-list">
              {guides
                .filter((g) => g.topic === t.value)
                .map((g) => (
                  <li key={g.id}>
                    <Link href={`/${country.slug}/guias/${g.slug}`}>{g.title}</Link>
                    <p>{g.summary}</p>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        {pathways.length > 0 ? (
          <section className="section" aria-labelledby="h-vias">
            <h2 id="h-vias">Vías de estancia que cubrimos</h2>
            <ul>
              {pathways.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong>
                  {p.officialCode ? ` (${p.officialCode})` : ''}.{' '}
                  <span className="muted">{p.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {pendingTopics.length > 0 ? (
          <p className="muted small">
            En preparación: {pendingTopics.map((t) => t.label.toLowerCase()).join(', ')}.
          </p>
        ) : null}
      </div>
    </div>
  )
}
