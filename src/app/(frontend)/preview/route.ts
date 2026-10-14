import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

/**
 * Vista previa de borradores. Solo para personas con sesión en el CMS:
 * se comprueba la cookie de Payload antes de activar el modo borrador.
 */
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Necesitas iniciar sesión en el CMS para ver borradores.', { status: 401 })
  }

  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  const collection = req.nextUrl.searchParams.get('collection')
  if (collection !== 'guides' || !slug) {
    return new Response('Vista previa no disponible para este contenido.', { status: 400 })
  }

  const { docs } = await payload.find({
    collection: 'guides',
    where: { slug: { equals: slug } },
    draft: true,
    depth: 1,
    limit: 1,
    user,
    overrideAccess: false,
  })
  const guide = docs[0]
  const country = guide && typeof guide.country === 'object' ? guide.country.slug : null
  if (!guide || !country) return new Response('No se encontró la guía.', { status: 404 })

  ;(await draftMode()).enable()
  redirect(`/${country}/guias/${guide.slug}`)
}
