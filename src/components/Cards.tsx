import { ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'

import { sectorLabel } from '@/lib/sectors'
import type { Opportunity, Pathway, Region } from '@/payload-types'

export function PathwayCard({ pathway, countrySlug }: { pathway: Pathway; countrySlug: string }) {
  return (
    <article className="pathway-card card-link">
      {pathway.officialCode ? <span className="tag">{pathway.officialCode}</span> : null}
      <h3>
        <Link href={`/${countrySlug}/vias/${pathway.slug}`} className="stretched">
          {pathway.name}
        </Link>
      </h3>
      <p>{pathway.summary}</p>
      <span className="read-more" aria-hidden="true">
        Ver requisitos <ArrowRight size={16} />
      </span>
    </article>
  )
}

export function RegionCard({ region }: { region: Region }) {
  return (
    <article className="pathway-card">
      {region.mainCity ? (
        <span className="tag">
          <MapPin size={14} aria-hidden="true" /> {region.mainCity}
        </span>
      ) : null}
      <h3>{region.name}</h3>
      <p>{region.summary}</p>
      {region.characteristics?.length ? (
        <ul className="mini-list">
          {region.characteristics.slice(0, 3).map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const signals = opportunity.signals?.length ?? 0
  return (
    <article className="pathway-card">
      <span className="tag">{sectorLabel(opportunity.sector)}</span>
      <h3>{opportunity.title}</h3>
      <p>{opportunity.summary}</p>
      <p className="small muted">
        {signals
          ? `${signals} señal(es) de mercado con fuente`
          : 'Sin señales de mercado verificadas todavía: no lo tomes como prueba de demanda.'}
      </p>
    </article>
  )
}
