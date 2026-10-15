import { describe, expect, it } from 'vitest'

import { editorialState } from '@/lib/editorial'
import { latestReason, reviewPriority } from '@/lib/review'

const now = new Date('2026-10-15T00:00:00Z')

describe('editorialState', () => {
  it('archivado gana a todo', () => {
    expect(
      editorialState({
        archived: true,
        _status: 'published',
        verification: { reviewStatus: 'needs_review' },
      }),
    ).toBe('archived')
  })
  it('«necesita revisión» se ve aunque esté publicado', () => {
    expect(
      editorialState({ _status: 'published', verification: { reviewStatus: 'needs_review' } }),
    ).toBe('needs_review')
  })
  it('publicado', () => {
    expect(
      editorialState({ _status: 'published', verification: { reviewStatus: 'verified' } }),
    ).toBe('published')
  })
  it('borrador marcado para revisar', () => {
    expect(editorialState({ _status: 'draft', reviewRequested: true })).toBe('pending_review')
  })
  it('borrador', () => {
    expect(editorialState({ _status: 'draft' })).toBe('draft')
  })
})

describe('reviewPriority', () => {
  it('lo marcado para revisión va antes que lo verificado reciente', () => {
    const flagged = reviewPriority({ reviewStatus: 'needs_review', dependents: 0, now })
    const fresh = reviewPriority({
      reviewStatus: 'verified',
      lastVerifiedAt: '2026-10-01',
      dependents: 0,
      now,
    })
    expect(flagged).toBeGreaterThan(fresh)
  })
  it('más dependientes = más prioridad', () => {
    const a = reviewPriority({ reviewStatus: 'needs_review', dependents: 1, now })
    const b = reviewPriority({ reviewStatus: 'needs_review', dependents: 5, now })
    expect(b).toBeGreaterThan(a)
  })
  it('un verificado antiguo sube de prioridad', () => {
    const old = reviewPriority({
      reviewStatus: 'verified',
      lastVerifiedAt: '2025-01-01',
      dependents: 0,
      now,
    })
    expect(old).toBeGreaterThanOrEqual(40)
  })
})

describe('latestReason', () => {
  it('devuelve la última línea no vacía', () => {
    expect(latestReason('[2026-01-01] uno\n[2026-02-01] dos\n')).toBe('[2026-02-01] dos')
  })
  it('sin nota', () => {
    expect(latestReason(null)).toBe('Sin motivo indicado')
  })
})
