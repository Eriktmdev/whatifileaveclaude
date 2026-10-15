import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DemoNotice } from '@/components/DemoNotice'
import { type ExplorerItem, OpportunityExplorer } from '@/components/OpportunityExplorer'
import { asDocs, getCountry, getOpportunities, getRegionsForCountry } from '@/lib/content'
import { signalLabel } from '@/lib/sectors'
import type { Region, Source } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ country: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = await getCountry((await params).country)
  if (!country) return {}
  return {
    title: `Oportunidades de trabajo en ${country.name}`,
    description: `Profesiones y sectores en ${country.name} con la evidencia de mercado que tenemos y sus barreras de acceso.`,
    alternates: { canonical: `/${country.slug}/oportunidades` },
    robots: country.isDemo ? { index: false } : undefined,
  }
}

export default async function OpportunitiesPage({ params }: Props) {
  const country = await getCountry((await params).country)
  if (!country) notFound()
  const [opps, regions] = await Promise.all([
    getOpportunities(country.id),
    getRegionsForCountry(country.id),
  ])

  const items: ExplorerItem[] = opps.map((o) => ({
    id: o.id,
    title: o.title,
    sector: o.sector,
    summary: o.summary,
    adjacentProfiles: o.adjacentProfiles ?? [],
    barriers: o.barriers,
    entryRequirements: o.entryRequirements,
    regions: asDocs<Region>(o.regions).map((r) => r.name),
    signals: (o.signals ?? []).map((s) => {
      const src = typeof s.source === 'object' ? (s.source as Source) : null
      return {
        kind: s.kind,
        label: signalLabel(s.kind),
        statement: s.statement,
        observedAt: s.observedAt,
        source: src ? { title: src.title, url: src.url } : null,
      }
    }),
    verified: o.verification?.reviewStatus === 'verified',
  }))

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: country.name, href: `/${country.slug}` },
          { label: 'Oportunidades', href: `/${country.slug}/oportunidades` },
        ]}
      />
      <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)' }}>Oportunidades en {country.name}</h1>
      <p className="lead">
        Profesiones y sectores con lo que sabemos de ellos: requisitos, barreras y evidencia de
        mercado. Que aparezcan aquí no garantiza trabajo.
      </p>
      {opps.some((o) => o.isDemo) ? <DemoNotice what="Este explorador" /> : null}
      <div className="notice notice-info" role="note">
        <p>
          Distinguimos cuatro tipos de evidencia: estar en una lista oficial, escasez documentada,
          vacantes actuales y referencias salariales. No son lo mismo. Todavía no hay filtros por
          presupuesto, duración o idioma porque no tenemos datos verificados para ellos.
        </p>
      </div>
      <OpportunityExplorer items={items} regions={regions.map((r) => r.name)} />
      <p className="section">
        ¿Quieres ver cuáles encajan con tu perfil?{' '}
        <Link href="/analisis">Analiza tu situación</Link>.
      </p>
    </div>
  )
}
