import { CalendarDays, CircleCheck, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AnalysisCta } from '@/components/AnalysisCta'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { Faq } from '@/components/Faq'
import { GuideBody } from '@/components/GuideBody'
import { GuideCard } from '@/components/GuideCard'
import { Icon, TOPIC_ICONS } from '@/components/icons'
import { RequirementList } from '@/components/RequirementList'
import { SourceList } from '@/components/SourceList'
import { VerificationStatus } from '@/components/VerificationStatus'
import { asDocs, getGuide, getPathwaysWithRequirements, visibleDocs } from '@/lib/content'
import { tableOfContents } from '@/lib/richtext'
import { getTopic } from '@/lib/topics'
import { formatDate } from '@/lib/verification'
import type { Country, Guide, Pathway, Source } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ country: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, slug } = await params
  const guide = await getGuide(country, slug)
  if (!guide) return {}
  return {
    title: guide.seo?.metaTitle || guide.title,
    description: guide.summary,
    alternates: { canonical: `/${country}/guias/${guide.slug}` },
    openGraph: { type: 'article', title: guide.title, description: guide.summary },
    robots: guide.isDemo ? { index: false } : undefined,
  }
}

export default async function GuidePage({ params }: Props) {
  const { country: countrySlug, slug } = await params
  const guide = await getGuide(countrySlug, slug)
  if (!guide) notFound()

  const country = guide.country as Country
  const topic = getTopic(guide.topic)
  const pathways = await getPathwaysWithRequirements(
    asDocs<Pathway>(guide.relatedPathways).map((p) => p.id),
  )
  const sources = asDocs<Source>(guide.sources)
  const officialSource = sources.find((s) => s.kind === 'official_government')
  const preview = (await draftMode()).isEnabled

  const related = visibleDocs<Guide>(guide.relatedGuides)
  const toc = [
    ...tableOfContents(guide.body),
    ...pathways.map((p) => ({ id: `req-${p.id}`, text: `Requisitos: ${p.name}` })),
    ...(guide.faqs?.length ? [{ id: 'faq', text: 'Preguntas frecuentes' }] : []),
    { id: 'h-fuentes', text: 'Fuentes' },
  ]

  return (
    <div className="container">
      {preview ? (
        <div className="notice notice-info" role="status">
          <p>
            Vista previa del equipo: puedes estar viendo un borrador.{' '}
            <Link href="/preview/salir" prefetch={false}>
              Salir de la vista previa
            </Link>
          </p>
        </div>
      ) : null}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: country.name, href: `/${country.slug}` },
          { label: guide.title, href: `/${country.slug}/guias/${guide.slug}` },
        ]}
      />

      <div className="guide-layout">
        <article>
          <header className="guide-header">
            {topic ? (
              <Link className="eyebrow" href={`/${country.slug}#${topic.value}`}>
                <Icon icon={TOPIC_ICONS[topic.value]} size={16} />
                {topic.label}
              </Link>
            ) : null}
            <h1>{guide.title}</h1>
            <p className="lead">{guide.summary}</p>
            <div className="meta-line">
              <span>
                <ShieldCheck size={16} aria-hidden="true" /> Fuentes:{' '}
                <VerificationStatus verification={guide.verification} />
              </span>
              <span>
                <CalendarDays size={16} aria-hidden="true" /> Editado el{' '}
                {formatDate(guide.updatedAt)}
              </span>
            </div>
          </header>

          {guide.isDemo ? <DemoNotice what="Esta guía" /> : null}
          {guide.verification?.reviewStatus === 'needs_review' ? (
            <div className="notice notice-info" role="note">
              <p>
                Estamos revisando esta guía porque alguna de sus fuentes o requisitos ha cambiado.
                Comprueba los datos en la fuente oficial antes de actuar.
              </p>
            </div>
          ) : null}

          {guide.keyPoints?.length ? (
            <div className="panel key-points">
              <h2>Puntos clave</h2>
              <ul>
                {guide.keyPoints.map((k) => (
                  <li key={k.id}>
                    <CircleCheck size={18} aria-hidden="true" />
                    <span>{k.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="prose">
            <GuideBody data={guide.body as never} />
          </div>

          {pathways.map((p) => (
            <RequirementList key={p.id} pathway={p} />
          ))}

          <AnalysisCta />

          <Faq items={guide.faqs} />

          {related.length ? (
            <section className="block" aria-labelledby="h-relacionadas">
              <h2 id="h-relacionadas">Sigue leyendo</h2>
              <ul className="card-grid">
                {related.map((g) => (
                  <li key={g.id}>
                    <GuideCard guide={g} countrySlug={country.slug} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="h-fuentes" className="block">
            <h2 id="h-fuentes">Fuentes</h2>
            <SourceList sources={sources} />
            <p className="muted small">
              «Comprobado» indica el día en que una persona abrió la fuente y confirmó el dato. La
              fecha de edición solo indica cuándo se cambió el texto.
            </p>
          </section>
        </article>

        <aside className="guide-aside" aria-label="Sobre esta guía">
          <div className="guide-aside-inner">
            <nav className="toc" aria-labelledby="toc-title">
              <h2 id="toc-title">En esta página</h2>
              <ol>
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
            {officialSource ? (
              <div className="panel aside-box">
                <h2>Fuente oficial</h2>
                <p>
                  <a href={officialSource.url} rel="noopener noreferrer" target="_blank">
                    {officialSource.publisher}
                  </a>
                </p>
                <p>
                  <VerificationStatus verification={officialSource.verification} />
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
