import 'server-only'

import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type Where } from 'payload'

import type {
  Country,
  Guide,
  Opportunity,
  Pathway,
  Region,
  Requirement,
  Source,
} from '@/payload-types'

/**
 * Única puerta de entrada del frontend a los datos. Todo lo público pasa por
 * aquí para aplicar siempre las mismas reglas:
 * - solo contenido publicado (salvo vista previa de una persona del equipo);
 * - el contenido demo se oculta salvo que SHOW_DEMO_CONTENT=true.
 */

export const showDemo = () => process.env.SHOW_DEMO_CONTENT === 'true'

const demoFilter = (): Where => (showDemo() ? {} : { isDemo: { not_equals: true } })

/** El Local API ignora el control de acceso: filtramos lo publicado de forma explícita. */
const published = (draft = false): Where =>
  draft ? {} : { and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }] }

const and = (...conds: Where[]): Where => ({ and: conds.filter((c) => Object.keys(c).length) })

async function client() {
  return getPayload({ config })
}

/** La vista previa solo se activa desde /preview tras comprobar la sesión del CMS. */
async function isPreview() {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

export async function getCountries(): Promise<Country[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'countries',
    where: and(published(), demoFilter()),
    sort: 'name',
    depth: 0,
    limit: 50,
  })
  return docs
}

export async function getCountry(slug: string): Promise<Country | null> {
  const payload = await client()
  const draft = await isPreview()
  const { docs } = await payload.find({
    collection: 'countries',
    where: and({ slug: { equals: slug } }, published(draft), demoFilter()),
    depth: 0,
    limit: 1,
    draft,
  })
  return docs[0] ?? null
}

export async function getGuidesForCountry(countryId: number): Promise<Guide[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'guides',
    where: and({ country: { equals: countryId } }, published(), demoFilter()),
    sort: 'title',
    depth: 0,
    limit: 200,
    select: {
      title: true,
      slug: true,
      topic: true,
      image: true,
      summary: true,
      isDemo: true,
      verification: true,
    },
  })
  return docs as Guide[]
}

export async function getPathwaysForCountry(countryId: number): Promise<Pathway[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'pathways',
    where: and({ country: { equals: countryId } }, published(), demoFilter()),
    sort: 'name',
    depth: 0,
    limit: 100,
  })
  return docs
}

export async function getGuide(countrySlug: string, slug: string): Promise<Guide | null> {
  const payload = await client()
  const draft = await isPreview()
  const { docs } = await payload.find({
    collection: 'guides',
    where: and(
      { slug: { equals: slug } },
      { 'country.slug': { equals: countrySlug } },
      published(draft),
      demoFilter(),
    ),
    depth: 1,
    limit: 1,
    draft,
  })
  return docs[0] ?? null
}

export type PathwayWithRequirements = Pathway & {
  requirementDocs: (Omit<Requirement, 'sources'> & { sources?: Source[] | null })[]
}

/** Requisitos de las vías citadas por una guía: el texto sale de la colección, no de la guía. */
export async function getPathwaysWithRequirements(
  ids: number[],
): Promise<PathwayWithRequirements[]> {
  if (!ids.length) return []
  const payload = await client()
  const draft = await isPreview()
  const [{ docs: pathways }, { docs: requirements }] = await Promise.all([
    payload.find({
      collection: 'pathways',
      where: and({ id: { in: ids } }, published(draft), demoFilter()),
      depth: 1,
      limit: ids.length,
      draft,
    }),
    payload.find({
      collection: 'requirements',
      where: and({ pathway: { in: ids } }, published(draft), demoFilter()),
      depth: 1,
      sort: 'order',
      limit: 500,
      draft,
    }),
  ])
  return pathways.map((p) => ({
    ...p,
    requirementDocs: requirements.filter(
      (r) => (typeof r.pathway === 'object' ? r.pathway.id : r.pathway) === p.id,
    ) as PathwayWithRequirements['requirementDocs'],
  }))
}

export async function getAllPublicGuidePaths(): Promise<
  { country: string; slug: string; updatedAt: string }[]
> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'guides',
    where: and(published(), demoFilter()),
    depth: 1,
    limit: 1000,
    select: { slug: true, country: true, updatedAt: true },
  })
  return docs
    .filter((d) => typeof d.country === 'object')
    .map((d) => ({ country: (d.country as Country).slug, slug: d.slug, updatedAt: d.updatedAt }))
}

export const asDocs = <T extends { id: number }>(rel: (number | T)[] | null | undefined): T[] =>
  (rel ?? []).filter((r): r is T => typeof r === 'object' && r !== null)

export async function getPathway(countrySlug: string, slug: string): Promise<Pathway | null> {
  const payload = await client()
  const draft = await isPreview()
  const { docs } = await payload.find({
    collection: 'pathways',
    where: and(
      { slug: { equals: slug } },
      { 'country.slug': { equals: countrySlug } },
      published(draft),
      demoFilter(),
    ),
    depth: 1,
    limit: 1,
    draft,
  })
  return docs[0] ?? null
}

export async function getGuidesForPathway(pathwayId: number): Promise<Guide[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'guides',
    where: and({ relatedPathways: { contains: pathwayId } }, published(), demoFilter()),
    depth: 0,
    limit: 20,
    select: { title: true, slug: true, topic: true, summary: true, image: true },
  })
  return docs as Guide[]
}

export async function getRegionsForCountry(countryId: number): Promise<Region[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'regions',
    where: and({ country: { equals: countryId } }, published(), demoFilter()),
    sort: 'name',
    depth: 0,
    limit: 50,
  })
  return docs
}

export async function getOpportunities(countryId: number): Promise<Opportunity[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'opportunities',
    where: and({ country: { equals: countryId } }, published(), demoFilter()),
    sort: 'title',
    depth: 1,
    limit: 200,
  })
  return docs
}

/** Fuentes oficiales registradas para el país (para el bloque «Fuentes oficiales» del hub). */
export async function getOfficialSources(countryId: number): Promise<Source[]> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'sources',
    where: and(
      { country: { equals: countryId } },
      { kind: { equals: 'official_government' } },
      demoFilter(),
    ),
    sort: 'title',
    depth: 0,
    limit: 30,
  })
  return docs
}

/** Fecha de verificación más reciente entre el contenido publicado del país, o null si no hay nada verificado. */
export async function getLatestVerification(countryId: number): Promise<string | null> {
  const payload = await client()
  const where = and({ country: { equals: countryId } }, published(), demoFilter(), {
    'verification.reviewStatus': { equals: 'verified' },
  })
  const results = await Promise.all(
    (['guides', 'pathways', 'regions', 'opportunities'] as const).map((collection) =>
      payload.find({ collection, where, sort: '-verification.lastVerifiedAt', depth: 0, limit: 1 }),
    ),
  )
  const dates = results
    .map(
      (r) =>
        (r.docs[0] as { verification?: { lastVerifiedAt?: string | null } } | undefined)
          ?.verification?.lastVerifiedAt,
    )
    .filter((d): d is string => Boolean(d))
    .sort()
  return dates.at(-1) ?? null
}

export async function getPathwayPaths(): Promise<
  { country: string; slug: string; updatedAt: string }[]
> {
  const payload = await client()
  const { docs } = await payload.find({
    collection: 'pathways',
    where: and(published(), demoFilter()),
    depth: 1,
    limit: 500,
    select: { slug: true, country: true, updatedAt: true },
  })
  return docs
    .filter((d) => typeof d.country === 'object')
    .map((d) => ({ country: (d.country as Country).slug, slug: d.slug, updatedAt: d.updatedAt }))
}

export async function getHomepage() {
  const payload = await client()
  return payload.findGlobal({ slug: 'homepage', depth: 1 })
}

export async function getFeaturedGuides(ids: number[], countryId?: number): Promise<Guide[]> {
  const payload = await client()
  const where = ids.length
    ? and({ id: { in: ids } }, published(), demoFilter())
    : and(countryId ? { country: { equals: countryId } } : {}, published(), demoFilter())
  const { docs } = await payload.find({
    collection: 'guides',
    where,
    depth: 1,
    limit: 3,
    sort: '-updatedAt',
  })
  return docs
}

/** Filtra relaciones ya pobladas para no mostrar borradores, archivados ni demo (si no toca). */
export function visibleDocs<
  T extends {
    id: number
    _status?: string | null
    archived?: boolean | null
    isDemo?: boolean | null
  },
>(rel: (number | T)[] | null | undefined): T[] {
  return asDocs<T>(rel).filter(
    (d) => d._status === 'published' && !d.archived && (showDemo() || !d.isDemo),
  )
}
