import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { OpportunityCard, PathwayCard, RegionCard } from '@/components/Cards'
import { GuideCard } from '@/components/GuideCard'
import { HeroMedia } from '@/components/HeroMedia'
import { Icon, TOPIC_ICONS } from '@/components/icons'
import { QuickFacts } from '@/components/QuickFacts'
import { SourceList } from '@/components/SourceList'
import {
  getCountry,
  getGuidesForCountry,
  getLatestVerification,
  getOfficialSources,
  getOpportunities,
  getPathwaysForCountry,
  getRegionsForCountry,
} from '@/lib/content'
import { flagEmoji } from '@/lib/flags'
import { TOPICS } from '@/lib/topics'
import { formatDate } from '@/lib/verification'

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

  const [guides, pathways, regions, opportunities, officialSources, latestVerification] =
    await Promise.all([
      getGuidesForCountry(country.id),
      getPathwaysForCountry(country.id),
      getRegionsForCountry(country.id),
      getOpportunities(country.id),
      getOfficialSources(country.id),
      getLatestVerification(country.id),
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
              Vías migratorias
            </h2>
            <p className="muted">
              Formas de vivir o trabajar en {country.name} que cubrimos, con sus requisitos y
              fuentes.
            </p>
            <ul className="card-grid">
              {pathways.map((p) => (
                <li key={p.id}>
                  <PathwayCard pathway={p} countrySlug={country.slug} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {regions.length > 0 ? (
          <section className="section" aria-labelledby="h-regiones">
            <h2 id="h-regiones" style={{ marginTop: 0 }}>
              Regiones
            </h2>
            <p className="muted">
              Cada zona tiene un mercado laboral, unos costes y un estilo de vida distintos.
            </p>
            <ul className="card-grid">
              {regions.map((r) => (
                <li key={r.id}>
                  <RegionCard region={r} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {opportunities.length > 0 ? (
          <section className="section" aria-labelledby="h-sectores">
            <h2 id="h-sectores" style={{ marginTop: 0 }}>
              Profesiones y sectores
            </h2>
            <p className="muted">
              Que una profesión aparezca aquí no significa que haya trabajo garantizado: cada ficha
              indica qué evidencia tenemos y de qué tipo.
            </p>
            <ul className="card-grid">
              {opportunities.map((o) => (
                <li key={o.id}>
                  <OpportunityCard opportunity={o} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {officialSources.length > 0 ? (
          <section className="section" aria-labelledby="h-oficiales">
            <h2 id="h-oficiales" style={{ marginTop: 0 }}>
              Fuentes oficiales
            </h2>
            <SourceList sources={officialSources} />
          </section>
        ) : null}

        <p className="muted small">
          {latestVerification
            ? `Última verificación de contenido de ${country.name}: ${formatDate(latestVerification)}.`
            : `El contenido de ${country.name} todavía no está verificado.`}
        </p>

        {pendingTopics.length > 0 ? (
          <p className="muted small">
            En preparación: {pendingTopics.map((t) => t.label.toLowerCase()).join(', ')}.
          </p>
        ) : null}
      </div>
    </>
  )
}
