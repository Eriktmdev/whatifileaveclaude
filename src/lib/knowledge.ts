import 'server-only'

import type { ExchangeRate, KnowledgePathway } from './evaluation'
import type { Knowledge } from './freeResult'
import {
  asDocs,
  getCountry,
  getGuidesForCountry,
  getOpportunities,
  getPathwaysForCountry,
  getPathwaysWithRequirements,
  showDemo,
} from './content'
import config from '@payload-config'
import { getPayload } from 'payload'

import { renderStatement } from './verification'
import type { Guide, Region, Source } from '@/payload-types'

/**
 * Conocimiento público (ya publicado) que necesita el cuestionario, en un formato
 * pequeño y serializable para enviarlo al navegador. No contiene datos personales.
 */
export async function getKnowledge(countrySlug: string): Promise<Knowledge | null> {
  const country = await getCountry(countrySlug)
  if (!country) return null
  const payload = await getPayload({ config })

  const [pathwayDocs, opportunityDocs, guideDocs, economics] = await Promise.all([
    getPathwaysForCountry(country.id),
    getOpportunities(country.id),
    getGuidesForCountry(country.id),
    payload.findGlobal({ slug: 'economics', depth: 1 }),
  ])
  const withReqs = await getPathwaysWithRequirements(pathwayDocs.map((p) => p.id))

  const pathways: KnowledgePathway[] = withReqs.map((p) => ({
    id: String(p.id),
    name: p.name,
    officialCode: p.officialCode,
    url: `/${country.slug}/vias/${p.slug}`,
    eligiblePassports: p.eligiblePassports ?? [],
    verified: p.verification?.reviewStatus === 'verified',
    requirements: p.requirementDocs.map((r) => {
      const src = (r.sources ?? [])[0]
      return {
        id: String(r.id),
        title: r.title,
        statement: renderStatement(r.statement, r.rule),
        details: r.details,
        rule: {
          mode: r.rule.mode,
          criterion: r.rule.criterion,
          operator: r.rule.operator,
          min: r.rule.min,
          max: r.rule.max,
          values: r.rule.values,
          unit: r.rule.unit,
          question: r.rule.question,
        },
        scopePassports: r.scope?.passports ?? [],
        verified: r.verification?.reviewStatus === 'verified',
        volatility: r.volatility,
        source: src ? { title: src.title, url: src.url } : null,
      }
    }),
  }))

  // Guías: necesitamos sus vías relacionadas (getGuidesForCountry no las trae).
  const { docs: guidesFull } = await payload.find({
    collection: 'guides',
    where: { id: { in: guideDocs.map((g) => g.id) } },
    depth: 0,
    limit: 200,
    select: { title: true, slug: true, relatedPathways: true },
  })

  const rates: ExchangeRate[] = (economics.exchangeRates ?? [])
    .filter((r) => typeof r.source === 'object' && r.source)
    .map((r) => ({
      from: r.from.toUpperCase(),
      to: r.to.toUpperCase(),
      rate: r.rate,
      observedAt: r.observedAt,
      source: { title: (r.source as Source).title, url: (r.source as Source).url },
    }))

  return {
    pathways,
    opportunities: opportunityDocs.map((o) => ({
      id: String(o.id),
      title: o.title,
      sector: o.sector,
      summary: o.summary,
      adjacentProfiles: o.adjacentProfiles ?? [],
      barriers: o.barriers,
      regions: asDocs<Region>(o.regions).map((r) => r.name),
      signalsCount: o.signals?.length ?? 0,
      verified: o.verification?.reviewStatus === 'verified',
    })),
    guides: (guidesFull as Guide[]).map((g) => ({
      title: g.title,
      url: `/${country.slug}/guias/${g.slug}`,
      pathwayIds: (g.relatedPathways ?? []).map((p) => String(typeof p === 'object' ? p.id : p)),
    })),
    rates,
    includesDemo:
      showDemo() &&
      (Boolean(country.isDemo) ||
        pathwayDocs.some((p) => p.isDemo) ||
        opportunityDocs.some((o) => o.isDemo)),
  }
}
