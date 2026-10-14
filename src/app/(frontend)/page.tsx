import Link from 'next/link'

import { getCountries } from '@/lib/content'

export const revalidate = 3600

export default async function HomePage() {
  const countries = await getCountries()

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">¿Y si me voy?</span>
          <h1>Entiende tus opciones antes de hacer las maletas</h1>
          <p className="lead">
            Guías claras sobre visados, trabajo, vivienda y dinero para vivir en otro país. Con las
            fuentes a la vista y la fecha en que se comprobaron, para que sepas qué es seguro y qué
            falta confirmar.
          </p>
          {countries[0] ? (
            <p>
              <Link className="button" href={`/${countries[0].slug}`}>
                Explorar {countries[0].name}
              </Link>
            </p>
          ) : (
            <p className="muted">Estamos preparando las primeras guías.</p>
          )}
        </div>
      </section>

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
                Contrasta tu situación con los requisitos de cada vía: qué cumples, qué no y qué
                falta comprobar.{' '}
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
        <div className="container narrow">
          <h2>Cómo tratamos la información</h2>
          <ul>
            <li>Los requisitos salen de fuentes oficiales, enlazadas en cada página.</li>
            <li>
              Cada dato muestra cuándo se comprobó por última vez. Si no se ha comprobado, lo
              decimos.
            </li>
            <li>
              Separamos lo que depende de tu pasaporte, de dónde vives y del idioma que hablas: no
              son lo mismo.
            </li>
            <li>
              Que haya demanda de trabajadores no garantiza un empleo, un patrocinio ni un visado.
            </li>
          </ul>
        </div>
      </section>

      {countries.length > 0 ? (
        <section className="section">
          <div className="container narrow">
            <h2>Destinos</h2>
            <ul className="link-list">
              {countries.map((c) => (
                <li key={c.id}>
                  <Link href={`/${c.slug}`}>{c.name}</Link>
                  <p>{c.tagline}</p>
                </li>
              ))}
            </ul>
            <p className="muted small">
              Por ahora, con un primer recorrido para personas con pasaporte español.
            </p>
          </div>
        </section>
      ) : null}
    </>
  )
}
