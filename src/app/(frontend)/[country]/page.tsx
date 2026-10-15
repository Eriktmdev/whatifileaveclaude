import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { GuideCard } from '@/components/GuideCard'
import { HeroMedia } from '@/components/HeroMedia'
import { Icon, TOPIC_ICONS } from '@/components/icons'
import { QuickFacts } from '@/components/QuickFacts'
import { getCountry, getGuidesForCountry, getPathwaysForCountry } from '@/lib/content'
import { flagEmoji } from '@/lib/flags'
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
    <>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: country.name, href: `/${country.slug}` },
          ]}
        />
        <header className="country-head">
          <div>
            <div className="country-title">
              <span className="flag" aria-hidden="true">
                {flagEmoji(country.isoCode)}
              </span>
              <h1>{country.name}</h1>
            </div>
            <p className="lead" style={{ marginTop: '0.75rem' }}>
              {country.tagline}
            </p>
            <p className="muted">{country.intro}</p>
            <QuickFacts facts={country.quickFacts} />
          </div>
          <HeroMedia image={country.heroImage} priority />
        </header>
        {country.isDemo ? <DemoNotice what="Esta sección" /> : null}
      </div>

      <nav aria-label="Temas" className="topic-nav">
        <div className="container">
          <ul>
            {TOPICS.map((t) => {
              const ready = topicsWithGuides.includes(t)
              return (
                <li key={t.value}>
                  {ready ? (
                    <a href={`#${t.value}`}>
                      <Icon icon={TOPIC_ICONS[t.value]} size={18} />
                      {t.short}
                    </a>
                  ) : (
                    <span title="En preparación">
                      <Icon icon={TOPIC_ICONS[t.value]} size={18} />
                      {t.short}
                      <span className="visually-hidden"> (en preparación)</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      <div className="container">
        {topicsWithGuides.length === 0 ? (
          <p className="section muted">Todavía no hay guías publicadas para este destino.</p>
        ) : null}

        {topicsWithGuides.map((t) => (
          <section key={t.value} id={t.value} className="section" aria-labelledby={`h-${t.value}`}>
            <h2 id={`h-${t.value}`} style={{ marginTop: 0 }}>
              {t.label}
            </h2>
            <p className="muted">{intro(t.value) ?? t.description}</p>
            <ul className="card-grid">
              {guides
                .filter((g) => g.topic === t.value)
                .map((g) => (
                  <li key={g.id}>
                    <GuideCard guide={g} countrySlug={country.slug} />
                  </li>
                ))}
            </ul>
          </section>
        ))}

        {pathways.length > 0 ? (
          <section className="section" aria-labelledby="h-vias">
            <h2 id="h-vias" style={{ marginTop: 0 }}>
              Vías de estancia que cubrimos
            </h2>
            <ul className="card-grid">
              {pathways.map((p) => (
                <li key={p.id}>
                  <div className="pathway-card">
                    {p.officialCode ? <span className="tag">{p.officialCode}</span> : null}
                    <h3 style={{ marginTop: '0.6rem' }}>{p.name}</h3>
                    <p>{p.summary}</p>
                  </div>
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
    </>
  )
}
