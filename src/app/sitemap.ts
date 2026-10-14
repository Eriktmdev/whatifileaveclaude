import type { MetadataRoute } from 'next'

import { getAllPublicGuidePaths, getCountries, showDemo } from '@/lib/content'
import { siteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // El contenido demo nunca se ofrece a buscadores.
  if (showDemo()) return [{ url: `${siteUrl()}/` }]
  const [countries, guides] = await Promise.all([getCountries(), getAllPublicGuidePaths()])
  return [
    { url: `${siteUrl()}/` },
    ...countries.map((c) => ({ url: `${siteUrl()}/${c.slug}`, lastModified: c.updatedAt })),
    ...guides.map((g) => ({
      url: `${siteUrl()}/${g.country}/guias/${g.slug}`,
      lastModified: g.updatedAt,
    })),
  ]
}
