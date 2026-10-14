import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { RequirementList } from '@/components/RequirementList'
import { SourceList } from '@/components/SourceList'
import { VerificationStatus } from '@/components/VerificationStatus'
import { asDocs, getGuide, getPathwaysWithRequirements } from '@/lib/content'
import { getTopic } from '@/lib/topics'
import { formatDate } from '@/lib/verification'
import type { Country, Pathway, Source } from '@/payload-types'

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
  const preview = (await draftMode()).isEnabled

  return (
    <div className="container narrow">
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
      <article>
        {topic ? (
          <Link className="eyebrow" href={`/${country.slug}#${topic.value}`}>
            {topic.label}
          </Link>
        ) : null}
        <h1>{guide.title}</h1>
        <div className="meta-line">
          <span>
            Fuentes: <VerificationStatus verification={guide.verification} />
          </span>
          <span>Editado el {formatDate(guide.updatedAt)}</span>
        </div>
        {guide.isDemo ? <DemoNotice what="Esta guía" /> : null}
        {guide.verification?.reviewStatus === 'needs_review' ? (
          <div className="notice notice-info" role="note">
            <p>
              Estamos revisando esta guía porque alguna de sus fuentes o requisitos ha cambiado.
              Comprueba los datos en la fuente oficial antes de actuar.
            </p>
          </div>
        ) : null}

        <div className="panel summary-box">
          <h2>En resumen</h2>
          <p>{guide.summary}</p>
          {guide.keyPoints?.length ? (
            <ul>
              {guide.keyPoints.map((k) => (
                <li key={k.id}>{k.text}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="prose">
          <RichText data={guide.body} />
        </div>

        {pathways.map((p) => (
          <RequirementList key={p.id} pathway={p} />
        ))}

        <section aria-labelledby="h-fuentes">
          <h2 id="h-fuentes">Fuentes</h2>
          <SourceList sources={sources} />
          <p className="muted small">
            «Comprobado» indica el día en que una persona abrió la fuente y confirmó el dato. La
            fecha de edición solo indica cuándo se cambió el texto.
          </p>
        </section>
      </article>
    </div>
  )
}
