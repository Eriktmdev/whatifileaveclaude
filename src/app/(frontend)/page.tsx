import { ArrowRight, Check, CircleHelp, Link2, Minus, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'

import { PathwayCard } from '@/components/Cards'
import { Faq } from '@/components/Faq'
import { GuideCard } from '@/components/GuideCard'
import { HeroMedia } from '@/components/HeroMedia'
import { Icon, TOPIC_ICONS } from '@/components/icons'
import { QuickFacts } from '@/components/QuickFacts'
import {
  getCountries,
  getFeaturedGuides,
  getGuidesForCountry,
  getHomepage,
  getPathwaysForCountry,
} from '@/lib/content'
import { flagEmoji } from '@/lib/flags'
import { TOPICS } from '@/lib/topics'

export const revalidate = 3600

// La imagen de portada es parte del diseño, no contenido del CMS.
const HOME_IMAGE = {
  src: '/images/portada-acantilado.webp',
  alt: 'Una persona con mochila, sentada de espaldas en un acantilado, mira la costa al atardecer.',
  credit: 'Imagen generada con IA',
}

/** Qué incluye cada nivel. Solo «disponible» si existe y funciona hoy. */
const PLAN_ROWS: { label: string; free: 'yes' | 'soon' | 'no'; premium: 'yes' | 'soon' }[] = [
  { label: 'Guías, vías migratorias y requisitos con sus fuentes', free: 'yes', premium: 'yes' },
  { label: 'Cuestionario y diagnóstico preliminar de tu situación', free: 'soon', premium: 'soon' },
  { label: 'Investigación de oportunidades laborales para tu perfil', free: 'no', premium: 'soon' },
  { label: 'Comparación de regiones según tus objetivos', free: 'no', premium: 'soon' },
  { label: 'Escenarios económicos: ahorro, costes y colchón', free: 'no', premium: 'soon' },
  { label: 'Plan de preparación de 3, 6 o 12 meses', free: 'no', premium: 'soon' },
]

function PlanCell({ value }: { value: 'yes' | 'soon' | 'no' }) {
  if (value === 'yes')
    return (
      <span className="plan-yes">
        <Check size={16} aria-hidden="true" /> Disponible
      </span>
    )
  if (value === 'soon') return <span className="muted">En desarrollo</span>
  return (
    <span className="muted">
      <Minus size={16} aria-label="No incluido" />
    </span>
  )
}

export default async function HomePage() {
  const [countries, home] = await Promise.all([getCountries(), getHomepage()])
  const featured = countries[0]
  const [guides, pathways, featuredGuides] = featured
    ? await Promise.all([
        getGuidesForCountry(featured.id),
        getPathwaysForCountry(featured.id),
        getFeaturedGuides(
          (home.featuredGuides ?? []).map((g) => (typeof g === 'object' ? g.id : g)),
          featured.id,
        ),
      ])
    : [[], [], []]
  const topicsWithGuides = new Set(guides.map((g) => g.topic))

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Tu próximo capítulo, con los pies en el suelo</span>
            <h1>{home.heroTitle}</h1>
            <p className="lead">{home.heroSubtitle}</p>
            {featured ? (
              <p>
                <Link className="button" href={`/${featured.slug}`}>
                  Explorar {featured.name} <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </p>
            ) : (
              <p className="muted">Estamos preparando las primeras guías.</p>
            )}
            <ul className="checks">
              {['Vías migratorias y requisitos', 'Fuentes oficiales', 'Fecha de comprobación'].map(
                (t) => (
                  <li key={t}>
                    <Check size={16} aria-hidden="true" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <HeroMedia image={HOME_IMAGE} priority />
        </div>
      </section>

      <section className="section" aria-labelledby="h-como">
        <div className="container">
          <h2 id="h-como">Cómo funciona</h2>
          <ol className="steps">
            <li>
              <span className="step-number" aria-hidden="true">
                1
              </span>
              <h3>Descubre</h3>
              <p>
                Qué vías existen para vivir o trabajar en el país, qué piden y qué oportunidades
                hay.
              </p>
            </li>
            <li>
              <span className="step-number" aria-hidden="true">
                2
              </span>
              <h3>Analiza tu situación</h3>
              <p>
                Contrasta tu perfil con los requisitos: qué cumples, qué no y qué falta comprobar.{' '}
                <span className="muted">El cuestionario está en desarrollo.</span>
              </p>
            </li>
            <li>
              <span className="step-number" aria-hidden="true">
                3
              </span>
              <h3>Prepárate</h3>
              <p>Convierte la idea en un plan con pasos concretos, costes y plazos.</p>
            </li>
          </ol>
        </div>
      </section>

      {featured ? (
        <section className="section" aria-labelledby="h-destino">
          <div className="container">
            <h2 id="h-destino">Destino destacado</h2>
            <p className="muted">
              Empezamos por uno y lo hacemos bien. Primer recorrido para pasaporte español.
            </p>
            <div className="country-feature" style={{ position: 'relative', marginTop: '1.25rem' }}>
              <HeroMedia image={featured.heroImage} />
              <div className="country-feature-body">
                <span className="flag" aria-hidden="true">
                  {flagEmoji(featured.isoCode)}
                </span>
                <h3>
                  <Link href={`/${featured.slug}`} className="stretched">
                    {featured.name}
                  </Link>
                </h3>
                <p className="muted">{featured.tagline}</p>
                <QuickFacts facts={featured.quickFacts} />
                <p style={{ marginTop: '1.25rem', marginBottom: 0 }}>
                  <span className="text-link" aria-hidden="true">
                    Ver {featured.name} <ArrowRight size={16} />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {featured && pathways.length ? (
        <section className="section" aria-labelledby="h-rutas">
          <div className="container">
            <h2 id="h-rutas">Rutas para irte</h2>
            <p className="muted">Cada vía tiene sus requisitos, límites y fuentes oficiales.</p>
            <ul className="card-grid">
              {pathways.map((p) => (
                <li key={p.id}>
                  <PathwayCard pathway={p} countrySlug={featured.slug} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {featured ? (
        <section className="section" aria-labelledby="h-temas">
          <div className="container">
            <h2 id="h-temas">Explora por tema</h2>
            <ul className="topic-grid">
              {TOPICS.map((t) => {
                const ready = topicsWithGuides.has(t.value)
                return (
                  <li key={t.value}>
                    <div className={`topic-card${ready ? '' : ' is-pending'}`}>
                      <span className="icon-badge">
                        <Icon icon={TOPIC_ICONS[t.value]} />
                      </span>
                      <div>
                        <h3>
                          {ready ? (
                            <Link href={`/${featured.slug}#${t.value}`} className="stretched">
                              {t.label}
                            </Link>
                          ) : (
                            t.label
                          )}
                        </h3>
                        <p>{ready ? t.description : 'En preparación'}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {featured && featuredGuides.length ? (
        <section className="section" aria-labelledby="h-articulos">
          <div className="container">
            <h2 id="h-articulos">Artículos destacados</h2>
            <ul className="card-grid">
              {featuredGuides.map((g) => (
                <li key={g.id}>
                  <GuideCard guide={g} countrySlug={featured.slug} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section" aria-labelledby="h-planes">
        <div className="container">
          <h2 id="h-planes">Gratis y análisis personalizado</h2>
          <p className="muted">
            Lo gratuito tiene que ser útil por sí mismo. El análisis personalizado está en
            desarrollo y todavía no tiene precio.
          </p>
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Qué incluye</th>
                  <th scope="col">Gratis</th>
                  <th scope="col">Análisis personalizado</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_ROWS.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" style={{ fontWeight: 500 }}>
                      {r.label}
                    </th>
                    <td>
                      <PlanCell value={r.free} />
                    </td>
                    <td>
                      <PlanCell value={r.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="h-fiarte">
        <div className="container">
          <h2 id="h-fiarte">Por qué puedes fiarte</h2>
          <ul className="trust">
            <li>
              <span className="icon-badge">
                <Icon icon={Link2} />
              </span>
              <div>
                <strong>Fuentes oficiales enlazadas</strong>
                <p>Cada requisito cita de dónde sale para que puedas comprobarlo.</p>
              </div>
            </li>
            <li>
              <span className="icon-badge">
                <Icon icon={ShieldCheck} />
              </span>
              <div>
                <strong>Fecha de comprobación visible</strong>
                <p>Si un dato no se ha comprobado o está en revisión, lo verás indicado.</p>
              </div>
            </li>
            <li>
              <span className="icon-badge">
                <Icon icon={Users} />
              </span>
              <div>
                <strong>Pasaporte, residencia e idioma por separado</strong>
                <p>
                  Lo que se te pide depende de tu nacionalidad, no de dónde vives ni del idioma que
                  hablas.
                </p>
              </div>
            </li>
            <li>
              <span className="icon-badge">
                <Icon icon={CircleHelp} />
              </span>
              <div>
                <strong>Sin promesas</strong>
                <p>Que falten trabajadores no garantiza un empleo, un patrocinio ni un visado.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {home.faqs?.length ? (
        <div className="container narrow">
          <Faq items={home.faqs} id="faq-portada" />
        </div>
      ) : null}
    </>
  )
}
