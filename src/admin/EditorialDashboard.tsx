import type { CollectionSlug, Payload } from 'payload'
import React from 'react'

import { latestReason, reviewPriority } from '@/lib/review'
import { STALE_AFTER_DAYS, formatDate } from '@/lib/verification'

/**
 * Panel editorial en la portada de /admin.
 * Responde: qué necesita revisión, por qué, desde cuándo, qué depende de ello y quién lo verificó.
 */

type Row = {
  collection: CollectionSlug
  collectionLabel: string
  id: number
  title: string
  reason: string
  since?: string | null
  verifiedBy?: string | null
  lastVerifiedAt?: string | null
  dependents: number
  priority: number
}

const REVIEWABLE: { slug: CollectionSlug; label: string; title: string }[] = [
  { slug: 'sources', label: 'Fuente', title: 'title' },
  { slug: 'requirements', label: 'Requisito', title: 'title' },
  { slug: 'pathways', label: 'Vía', title: 'name' },
  { slug: 'opportunities', label: 'Oportunidad', title: 'title' },
  { slug: 'regions', label: 'Región', title: 'name' },
  { slug: 'guides', label: 'Guía', title: 'title' },
]

type Doc = Record<string, unknown> & {
  id: number
  pathway?: number | { id: number }
  verification?: {
    reviewStatus?: string
    reviewNote?: string
    flaggedAt?: string
    lastVerifiedAt?: string
    verifiedBy?: { name?: string; email?: string } | number | null
  }
  volatility?: string
}

async function countDependents(payload: Payload, slug: CollectionSlug, doc: Doc): Promise<number> {
  const count = async (collection: CollectionSlug, where: Record<string, unknown>) =>
    (await payload.count({ collection, where: where as never })).totalDocs
  if (slug === 'sources') {
    const w = { sources: { contains: doc.id } }
    const counts = await Promise.all(
      (['requirements', 'pathways', 'guides', 'opportunities', 'regions'] as const).map((c) =>
        count(c, w),
      ),
    )
    return counts.reduce((a, b) => a + b, 0)
  }
  if (slug === 'requirements') {
    const pathwayId = typeof doc.pathway === 'object' ? doc.pathway?.id : doc.pathway
    return pathwayId ? count('guides', { relatedPathways: { contains: pathwayId } }) : 0
  }
  if (slug === 'pathways') {
    const [g, r] = await Promise.all([
      count('guides', { relatedPathways: { contains: doc.id } }),
      count('requirements', { pathway: { equals: doc.id } }),
    ])
    return g + r
  }
  return 0
}

const who = (v: Doc['verification']) => {
  const by = v?.verifiedBy
  return by && typeof by === 'object' ? by.name || by.email || null : null
}

async function loadRows(payload: Payload) {
  const staleBefore = new Date(Date.now() - STALE_AFTER_DAYS * 86_400_000).toISOString()
  const needsReview: Row[] = []
  const stale: Row[] = []
  const pending: Row[] = []

  for (const c of REVIEWABLE) {
    const hasDrafts = c.slug !== 'sources'
    const [flagged, old, requested] = await Promise.all([
      payload.find({
        collection: c.slug,
        where: { 'verification.reviewStatus': { equals: 'needs_review' } } as never,
        depth: 1,
        limit: 50,
        pagination: false,
      }),
      payload.find({
        collection: c.slug,
        where: {
          and: [
            { 'verification.reviewStatus': { equals: 'verified' } },
            { 'verification.lastVerifiedAt': { less_than: staleBefore } },
          ],
        } as never,
        depth: 1,
        limit: 50,
        pagination: false,
      }),
      hasDrafts
        ? payload.find({
            collection: c.slug,
            where: { reviewRequested: { equals: true } } as never,
            draft: true,
            depth: 0,
            limit: 50,
            pagination: false,
          })
        : Promise.resolve({ docs: [] }),
    ])

    const toRow = async (d: Doc, reason: string): Promise<Row> => {
      const dependents = await countDependents(payload, c.slug, d)
      return {
        collection: c.slug,
        collectionLabel: c.label,
        id: d.id,
        title: String(d[c.title] ?? `#${d.id}`),
        reason,
        since: d.verification?.flaggedAt,
        verifiedBy: who(d.verification),
        lastVerifiedAt: d.verification?.lastVerifiedAt,
        dependents,
        priority: reviewPriority({
          reviewStatus: d.verification?.reviewStatus,
          volatility: d.volatility,
          dependents,
          flaggedAt: d.verification?.flaggedAt,
          lastVerifiedAt: d.verification?.lastVerifiedAt,
        }),
      }
    }

    for (const d of flagged.docs as unknown as Doc[])
      needsReview.push(await toRow(d, latestReason(d.verification?.reviewNote)))
    for (const d of old.docs as unknown as Doc[])
      stale.push(await toRow(d, `Comprobado hace más de ${STALE_AFTER_DAYS} días`))
    for (const d of requested.docs as unknown as Doc[])
      pending.push(await toRow(d, 'Borrador listo para revisar'))
  }

  const byPriority = (a: Row, b: Row) => b.priority - a.priority
  return { needsReview: needsReview.sort(byPriority), stale: stale.sort(byPriority), pending }
}

const cell: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--theme-elevation-100)',
  verticalAlign: 'top',
}

function Table({ rows, empty }: { rows: Row[]; empty: string }) {
  if (!rows.length) return <p style={{ color: 'var(--theme-elevation-500)' }}>{empty}</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={cell}>Qué</th>
            <th style={cell}>Por qué</th>
            <th style={cell}>Desde</th>
            <th style={cell}>Depende de ello</th>
            <th style={cell}>Última verificación</th>
            <th style={cell}>Historial</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.collection}-${r.id}`}>
              <td style={cell}>
                <span style={{ color: 'var(--theme-elevation-500)' }}>{r.collectionLabel} · </span>
                <a href={`/admin/collections/${r.collection}/${r.id}`}>{r.title}</a>
              </td>
              <td style={cell}>{r.reason}</td>
              <td style={cell}>{formatDate(r.since) ?? '—'}</td>
              <td style={cell}>{r.dependents ? `${r.dependents} contenido(s)` : '—'}</td>
              <td style={cell}>
                {formatDate(r.lastVerifiedAt) ?? 'Nunca'}
                {r.verifiedBy ? ` · ${r.verifiedBy}` : ''}
              </td>
              <td style={cell}>
                {r.collection === 'sources' ? (
                  '—'
                ) : (
                  <a href={`/admin/collections/${r.collection}/${r.id}/versions`}>Ver cambios</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export async function EditorialDashboard({ payload }: { payload: Payload }) {
  const { needsReview, stale, pending } = await loadRows(payload)
  const unverifiedSources = (
    await payload.count({
      collection: 'sources',
      where: { 'verification.reviewStatus': { equals: 'unverified' } },
    })
  ).totalDocs

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 4 }}>Revisión editorial</h2>
      <p style={{ color: 'var(--theme-elevation-500)', marginTop: 0 }}>
        {needsReview.length} necesitan revisión · {stale.length} comprobados hace tiempo ·{' '}
        {pending.length} borradores listos para revisar · {unverifiedSources} fuentes sin verificar
      </p>

      <h3>Necesita revisión</h3>
      <Table rows={needsReview} empty="Nada pendiente. 🎉" />

      <h3>Pendiente de revisión (borradores)</h3>
      <Table rows={pending} empty="No hay borradores marcados como listos." />

      <h3>Comprobado hace más de {STALE_AFTER_DAYS} días</h3>
      <Table rows={stale} empty="Todo lo verificado está al día." />
    </section>
  )
}
