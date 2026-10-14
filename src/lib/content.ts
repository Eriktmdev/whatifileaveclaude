import 'server-only'

import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type Where } from 'payload'

import type { Country, Guide, Pathway, Requirement, Source } from '@/payload-types'

/**
 * Única puerta de entrada del frontend a los datos. Todo lo público pasa por
 * aquí para aplicar siempre las mismas reglas:
 * - solo contenido publicado (salvo vista previa de una persona del equipo);
 * - el contenido demo se oculta salvo que SHOW_DEMO_CONTENT=true.
 */

export const showDemo = () => process.env.SHOW_DEMO_CONTENT === 'true'

const demoFilter = (): Where => (showDemo() ? {} : { isDemo: { not_equals: true } })

/** El Local API ignora el control de acceso: filtramos lo publicado de forma explícita. */
const published = (draft = false): Where => (draft ? {} : { _status: { equals: 'published' } })

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
