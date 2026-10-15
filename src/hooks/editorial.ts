import { ValidationError } from 'payload'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionSlug,
  Payload,
} from 'payload'

import {
  validatePublishable,
  validateVerification,
  type VerificationData,
} from '@/lib/verification'

const idsOf = (rel: unknown): (string | number)[] =>
  Array.isArray(rel)
    ? rel.map((r) =>
        typeof r === 'object' && r !== null
          ? (r as { id: string | number }).id
          : (r as string | number),
      )
    : []

/**
 * Comprueba la coherencia de la verificación al guardar y las condiciones
 * para publicar. Las actualizaciones internas (p. ej. marcar dependencias
 * para revisión) pasan `context.skipEditorialRules`.
 */
export const enforceEditorialRules =
  (opts: {
    collection: string
    requiresSources?: boolean
    hasDrafts?: boolean
  }): CollectionBeforeChangeHook =>
  ({ data, originalDoc, context, req }) => {
    trackFlaggedAt(data, originalDoc)
    // Queda registrado en cada versión: el historial muestra quién cambió qué.
    if (req.user && opts.collection !== 'sources') data.lastEditedBy = req.user.id
    if (data._status === 'published') data.reviewRequested = false
    if (context?.skipEditorialRules) return data
    const merged = { ...originalDoc, ...data }
    const verification = merged.verification as VerificationData | undefined

    const errors = validateVerification(verification).map((message) => ({
      message,
      path: 'verification.lastVerifiedAt',
    }))

    const publishing = opts.hasDrafts ? data._status === 'published' : false
    if (publishing) {
      errors.push(
        ...validatePublishable({
          isDemo: merged.isDemo,
          verification,
          sourcesCount: idsOf(merged.sources).length,
          requiresSources: opts.requiresSources,
        }).map((message) => ({ message, path: 'verification.reviewStatus' })),
      )
    }

    if (errors.length) {
      throw new ValidationError({ collection: opts.collection, errors, req })
    }
    return data
  }

/** «En revisión desde»: se fija al entrar en «Necesita revisión» y se borra al salir. */
type WithVerification = {
  verification?: { reviewStatus?: string | null; flaggedAt?: string | null } | null
}

function trackFlaggedAt(data: WithVerification, originalDoc?: WithVerification) {
  if (!data.verification) return
  const before = originalDoc?.verification
  const status = data.verification.reviewStatus ?? before?.reviewStatus
  if (status === 'needs_review') {
    data.verification.flaggedAt =
      before?.reviewStatus === 'needs_review' && before?.flaggedAt
        ? before.flaggedAt
        : new Date().toISOString()
  } else {
    data.verification.flaggedAt = null
  }
}

type Dependent = { collection: CollectionSlug; where: Record<string, unknown> }

/** Marca documentos dependientes como «Necesita revisión», sin publicar nada nuevo. */
export async function flagForReview(payload: Payload, targets: Dependent[], reason: string) {
  const flagged: string[] = []
  for (const target of targets) {
    const { docs } = await payload.find({
      collection: target.collection,
      where: target.where as never,
      depth: 0,
      limit: 200,
      draft: false,
      pagination: false,
    })
    for (const doc of docs as unknown as {
      id: string | number
      verification?: VerificationData
    }[]) {
      if (doc.verification?.reviewStatus === 'needs_review') continue
      const previousNote = doc.verification?.reviewNote ? `${doc.verification.reviewNote}\n` : ''
      await payload.update({
        collection: target.collection,
        id: doc.id,
        data: {
          verification: {
            ...doc.verification,
            reviewStatus: 'needs_review',
            reviewNote: `${previousNote}[${new Date().toISOString().slice(0, 10)}] ${reason}`,
          },
        } as never,
        context: { skipEditorialRules: true, skipDependents: true },
        depth: 0,
      })
      flagged.push(`${target.collection}:${doc.id}`)
    }
  }
  if (flagged.length) payload.logger.info({ flagged }, `Marcados para revisión: ${reason}`)
  return flagged
}

const changed = (a: unknown, b: unknown) => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)

/** Fuente → requisitos, vías y guías que la citan. */
export const sourceDependents: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipDependents || !previousDoc?.id) return doc
  const becameNeedsReview =
    doc.verification?.reviewStatus === 'needs_review' &&
    previousDoc.verification?.reviewStatus !== 'needs_review'
  const urlChanged = changed(doc.url, previousDoc.url)
  if (becameNeedsReview || urlChanged) {
    const where = { sources: { contains: doc.id } }
    await flagForReview(
      req.payload,
      [
        { collection: 'requirements', where },
        { collection: 'pathways', where },
        { collection: 'guides', where },
      ],
      `La fuente «${doc.title}» ${urlChanged ? 'ha cambiado de URL' : 'está marcada para revisión'}.`,
    )
  }
  return doc
}

/** Requisito → guías que tratan su vía. Solo si cambia algo sustantivo de lo publicado. */
export const requirementDependents: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipDependents || !previousDoc?.id) return doc
  if (doc._status !== 'published' || previousDoc._status !== 'published') return doc
  const substantive = ['statement', 'rule', 'scope', 'pathway'].some((k) =>
    changed(doc[k], previousDoc[k]),
  )
  if (!substantive) return doc
  const pathwayId = typeof doc.pathway === 'object' ? doc.pathway?.id : doc.pathway
  if (!pathwayId) return doc
  await flagForReview(
    req.payload,
    [{ collection: 'guides', where: { relatedPathways: { contains: pathwayId } } }],
    `Ha cambiado el requisito «${doc.title}».`,
  )
  return doc
}

/** Vía → guías relacionadas. */
export const pathwayDependents: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipDependents || !previousDoc?.id) return doc
  if (doc._status !== 'published' || previousDoc._status !== 'published') return doc
  const substantive = ['summary', 'eligiblePassports', 'officialCode'].some((k) =>
    changed(doc[k], previousDoc[k]),
  )
  if (!substantive) return doc
  await flagForReview(
    req.payload,
    [{ collection: 'guides', where: { relatedPathways: { contains: doc.id } } }],
    `Ha cambiado la vía «${doc.name}».`,
  )
  return doc
}
