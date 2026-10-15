import { ArrowRight, Check, CircleHelp, Link2, ShieldCheck, Users } from 'lucide-react'
import Link from 'next/link'

import { HeroMedia } from '@/components/HeroMedia'
import { Icon, TOPIC_ICONS } from '@/components/icons'
import { QuickFacts } from '@/components/QuickFacts'
import { getCountries, getGuidesForCountry } from '@/lib/content'
import { flagEmoji } from '@/lib/flags'
import { TOPICS } from '@/lib/topics'

export const revalidate = 3600

export default async function HomePage() {
  const countries = await getCountries()
  const featured = countries[0]
  const guides = featured ? await getGuidesForCountry(featured.id) : []
  const topicsWithGuides = new Set(guides.map((g) => g.topic))

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Tu próximo capítulo, con los pies en el suelo</span>
            <h1>¿Y si me voy?</h1>
            <p className="lead">
              Descubre a dónde podrías ir, qué te pedirían y cómo prepararte. Con las fuentes
              oficiales a la vista y la fecha en que se comprobaron.
            </p>
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
              {['Visados y requisitos', 'Trabajo', 'Vivienda', 'Dinero'].map((t) => (
                <li key={t}>
                  <Check size={16} aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroMedia image={featured?.heroImage} priority />
        </div>
      </section>

      {featured ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Destino disponible</h2>
                <p className="muted">
                  Empezamos por uno y lo hacemos bien. Primer recorrido para pasaporte español.
                </p>
              </div>
            </div>
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
                    Ver guías de {featured.name} <ArrowRight size={16} />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {featured ? (
        <section className="section">
          <div className="container">
            <h2>Explora por tema</h2>
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

      <section className="section">
        <div className="container">
          <h2>Cómo te ayuda</h2>
          <ol className="steps">
            <li>
              <span className="step-number" aria-hidden="true">
                1
              </span>
              <h3>Descubre</h3>
              <p>
                Qué vías existen para vivir o trabajar en el país, cómo se busca empleo y cuánto
                cuesta empezar.
              </p>
            </li>
            <li>
              <span className="step-number" aria-hidden="true">
                2
              </span>
              <h3>Decide</h3>
              <p>
                Contrasta tu situación con los requisitos: qué cumples, qué no y qué falta
                comprobar.{' '}
                <span className="muted">
                  La herramienta para hacerlo paso a paso está en preparación.
                </span>
              </p>
            </li>
            <li>
              <span className="step-number" aria-hidden="true">
                3
              </span>
              <h3>Actúa</h3>
              <p>
                Convierte lo que has aprendido en próximos pasos concretos para preparar tu salida.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Por qué puedes fiarte</h2>
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
    </>
  )
}
