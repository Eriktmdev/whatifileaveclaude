/**
 * Reglas editoriales contra una base de datos real (whatifileave_test).
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { Pathway } from '@/payload-types'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let countryId: number
let sourceId: number

const unverified = { reviewStatus: 'unverified' as const }
const verified = { reviewStatus: 'verified' as const, lastVerifiedAt: '2026-01-15T00:00:00.000Z' }

async function wipe() {
  for (const collection of [
    'guides',
    'requirements',
    'pathways',
    'sources',
    'countries',
  ] as const) {
    await payload.delete({
      collection,
      where: { id: { exists: true } },
      context: { skipDependents: true },
    })
  }
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await wipe()
  const country = await payload.create({
    collection: 'countries',
    data: {
      name: 'Testlandia',
      slug: 'testlandia',
      isoCode: 'TL',
      tagline: 't',
      intro: 'i',
      _status: 'published',
    },
  })
  countryId = country.id
  const source = await payload.create({
    collection: 'sources',
    data: {
      title: 'Fuente oficial de prueba',
      publisher: 'Gobierno de prueba',
      kind: 'official_government',
      url: 'https://example.org/oficial',
      verification: verified,
    },
  })
  sourceId = source.id
})

afterAll(async () => {
  await wipe()
})

type PathwayInput = Omit<Pathway, 'id' | 'createdAt' | 'updatedAt' | 'requirements'>

const pathwayData = (overrides: Partial<PathwayInput> & { slug: string }): PathwayInput => ({
  name: 'Vía de prueba',
  country: countryId,
  category: 'working_holiday',
  summary: 'Resumen',
  verification: { reviewStatus: 'unverified' },
  ...overrides,
})

describe('publicación', () => {
  it('un borrador sin verificar se puede guardar', async () => {
    const doc = await payload.create({
      collection: 'pathways',
      data: pathwayData({ slug: 'borrador', verification: unverified, _status: 'draft' }),
      draft: true,
    })
    expect(doc._status).toBe('draft')
  })

  it('no se publica contenido real sin verificar', async () => {
    await expect(
      payload.create({
        collection: 'pathways',
        data: pathwayData({
          slug: 'sin-verificar',
          verification: unverified,
          sources: [sourceId],
          _status: 'published',
        }),
      }),
    ).rejects.toThrow()
  })

  it('no se publica contenido real verificado pero sin fuentes', async () => {
    await expect(
      payload.create({
        collection: 'pathways',
        data: pathwayData({ slug: 'sin-fuentes', verification: verified, _status: 'published' }),
      }),
    ).rejects.toThrow()
  })

  it('no se puede marcar «Verificado» sin fecha, ni siquiera en borrador', async () => {
    await expect(
      payload.create({
        collection: 'sources',
        data: {
          title: 'x',
          publisher: 'x',
          kind: 'other',
          url: 'https://example.org/x',
          verification: { reviewStatus: 'verified' },
        },
      }),
    ).rejects.toThrow()
  })

  it('se publica contenido verificado, fechado y con fuente', async () => {
    const doc = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'ok',
        verification: verified,
        sources: [sourceId],
        _status: 'published',
      }),
    })
    expect(doc._status).toBe('published')
  })

  it('el contenido demo se puede publicar sin verificar', async () => {
    const doc = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'demo',
        isDemo: true,
        verification: unverified,
        _status: 'published',
      }),
    })
    expect(doc._status).toBe('published')
  })

  it('el público solo ve lo publicado por la API', async () => {
    const res = await payload.find({ collection: 'pathways', overrideAccess: false, depth: 0 })
    expect(res.docs.every((d) => d._status === 'published')).toBe(true)
    expect(res.docs.find((d) => d.slug === 'borrador')).toBeUndefined()
  })

  it('el público no ve las notas internas de una fuente', async () => {
    const res = await payload.findByID({
      collection: 'sources',
      id: sourceId,
      overrideAccess: false,
    })
    expect(res.internalNotes).toBeUndefined()
    expect(res.verification?.reviewNote).toBeUndefined()
  })
})

describe('dependencias', () => {
  it('si una fuente pasa a «Necesita revisión», sus requisitos y guías también, sin despublicarse', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: {
        title: 'Dep',
        publisher: 'Gob',
        kind: 'official_government',
        url: 'https://example.org/dep',
        verification: verified,
      },
    })
    const pathway = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'dep',
        verification: verified,
        sources: [source.id],
        _status: 'published',
      }),
    })
    const requirement = await payload.create({
      collection: 'requirements',
      data: {
        title: 'Edad',
        pathway: pathway.id,
        statement: 'Entre {min} y {max}',
        rule: { mode: 'rule', criterion: 'age', operator: 'between', min: 18, max: 30 },
        sources: [source.id],
        verification: verified,
        _status: 'published',
      },
    })

    await payload.update({
      collection: 'sources',
      id: source.id,
      data: { verification: { ...verified, reviewStatus: 'needs_review' } },
    })

    const req = await payload.findByID({ collection: 'requirements', id: requirement.id })
    expect(req.verification.reviewStatus).toBe('needs_review')
    expect(req.verification.reviewNote).toMatch(/Dep/)
    expect(req._status).toBe('published')
    // Se conservan la fecha y el resto del bloque de verificación.
    expect(req.verification.lastVerifiedAt).toBe(verified.lastVerifiedAt)

    const pw = await payload.findByID({ collection: 'pathways', id: pathway.id })
    expect(pw.verification.reviewStatus).toBe('needs_review')
  })

  it('si cambia un requisito publicado, las guías de su vía pasan a revisión', async () => {
    const pathway = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'dep2',
        verification: verified,
        sources: [sourceId],
        _status: 'published',
      }),
    })
    const requirement = await payload.create({
      collection: 'requirements',
      data: {
        title: 'Fondos',
        pathway: pathway.id,
        statement: 'Al menos {min}',
        rule: { mode: 'rule', criterion: 'funds', operator: 'gte', min: 5000 },
        sources: [sourceId],
        verification: verified,
        _status: 'published',
      },
    })
    const guide = await payload.create({
      collection: 'guides',
      data: {
        title: 'Guía dependiente',
        slug: 'guia-dependiente',
        country: countryId,
        topic: 'visados',
        summary: 's',
        body: {
          root: {
            type: 'root',
            direction: null,
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'paragraph',
                version: 1,
                direction: null,
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    text: 'Texto',
                    version: 1,
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                  },
                ],
              },
            ],
          },
        },
        relatedPathways: [pathway.id],
        sources: [sourceId],
        verification: verified,
        _status: 'published',
      },
    })

    await payload.update({
      collection: 'requirements',
      id: requirement.id,
      data: {
        rule: { mode: 'rule', criterion: 'funds', operator: 'gte', min: 6000 },
        _status: 'published',
      },
    })

    const g = await payload.findByID({ collection: 'guides', id: guide.id })
    expect(g.verification.reviewStatus).toBe('needs_review')
    expect(g._status).toBe('published')
  })
})

describe('flujo editorial', () => {
  it('«En revisión desde» se fija al marcar para revisión y se borra al resolver', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: {
        title: 'Flag',
        publisher: 'Gob',
        kind: 'official_government',
        url: 'https://example.org/flag',
        verification: verified,
      },
    })
    const flagged = await payload.update({
      collection: 'sources',
      id: source.id,
      data: { verification: { ...verified, reviewStatus: 'needs_review' } },
    })
    expect(flagged.verification.flaggedAt).toBeTruthy()
    const firstFlag = flagged.verification.flaggedAt

    // Volver a guardar sin resolver no reinicia la fecha.
    const again = await payload.update({
      collection: 'sources',
      id: source.id,
      data: { title: 'Flag 2' },
    })
    expect(again.verification.flaggedAt).toBe(firstFlag)

    const resolved = await payload.update({
      collection: 'sources',
      id: source.id,
      data: { verification: { ...verified, lastVerifiedAt: '2026-10-01T00:00:00.000Z' } },
    })
    expect(resolved.verification.flaggedAt).toBeFalsy()
  })

  it('las dependencias marcadas también registran desde cuándo', async () => {
    const source = await payload.create({
      collection: 'sources',
      data: {
        title: 'Dep3',
        publisher: 'Gob',
        kind: 'official_government',
        url: 'https://example.org/dep3',
        verification: verified,
      },
    })
    const pathway = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'dep3',
        verification: verified,
        sources: [source.id],
        _status: 'published',
      }),
    })
    await payload.update({
      collection: 'sources',
      id: source.id,
      data: { verification: { ...verified, reviewStatus: 'needs_review' } },
    })
    const pw = await payload.findByID({ collection: 'pathways', id: pathway.id })
    expect(pw.verification.flaggedAt).toBeTruthy()
    expect(pw.editorialState).toBe('needs_review')
  })

  it('al publicar se desmarca «Pendiente de revisión»', async () => {
    const draft = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'pendiente',
        reviewRequested: true,
        verification: verified,
        sources: [sourceId],
      }),
      draft: true,
    })
    expect(draft.editorialState).toBe('pending_review')
    const published = await payload.update({
      collection: 'pathways',
      id: draft.id,
      data: { _status: 'published' },
    })
    expect(published.reviewRequested).toBe(false)
    expect(published.editorialState).toBe('published')
  })

  it('archivado se ve como tal y no se pierde', async () => {
    const doc = await payload.create({
      collection: 'pathways',
      data: pathwayData({
        slug: 'archivada',
        verification: verified,
        sources: [sourceId],
        archived: true,
        _status: 'published',
      }),
    })
    expect(doc.editorialState).toBe('archived')
  })

  // Payload no exige campos obligatorios en borradores; sí al publicar.
  it('una señal de mercado sin fuente no se puede publicar', async () => {
    await expect(
      payload.create({
        collection: 'opportunities',
        data: {
          isDemo: true,
          _status: 'published',
          title: 'Sin fuente',
          slug: 'sin-fuente',
          country: countryId,
          sector: 'tecnologia',
          summary: 's',
          verification: unverified,
          signals: [{ kind: 'shortage_evidence', observedAt: '2026-01-01', statement: 'x' }],
        } as never,
      }),
    ).rejects.toThrow()
  })
})
