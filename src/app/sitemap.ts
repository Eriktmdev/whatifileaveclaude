import type { MetadataRoute } from 'next'

import { getAllPublicGuidePaths, getCountries, getPathwayPaths, showDemo } from '@/lib/content'
import { siteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // El contenido demo nunca se ofrece a buscadores.
  if (showDemo()) return [{ url: `${siteUrl()}/` }]
  const [countries, guides, pathways] = await Promise.all([
    getCountries(),
    getAllPublicGuidePaths(),
    getPathwayPaths(),
  ])
  return [
    { url: `${siteUrl()}/` },
    ...countries.map((c) => ({ url: `${siteUrl()}/${c.slug}`, lastModified: c.updatedAt })),
    ...guides.map((g) => ({
      url: `${siteUrl()}/${g.country}/guias/${g.slug}`,
      lastModified: g.updatedAt,
    })),
    ...pathways.map((p) => ({ url: `${siteUrl()}/${p.country}/vias/${p.slug}`, lastModified: p.updatedAt })),
  ]
}
