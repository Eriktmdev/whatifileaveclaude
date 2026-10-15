import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Pide a Next.js que regenere las páginas públicas tras un cambio.
 * Fuera de Next (scripts de seed) revalidatePath no está disponible; se ignora.
 */
async function revalidate(paths: string[]) {
  try {
    const { revalidatePath } = await import('next/cache')
    for (const p of paths) revalidatePath(p, 'layout')
  } catch {
    // Ejecutado fuera de una petición de Next: nada que revalidar.
  }
}

// Con pocas páginas es más sencillo y seguro revalidar todo el sitio público.
export const revalidateSite: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidate(['/'])
  return doc
}

export const revalidateSiteOnDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidate(['/'])
  return doc
}

export const revalidateSiteGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidate(['/'])
  return doc
}
