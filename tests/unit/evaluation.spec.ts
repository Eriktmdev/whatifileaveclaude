import { describe, expect, it } from 'vitest'

import {
  type ExchangeRate,
  type KnowledgePathway,
  type KnowledgeRequirement,
  evaluatePathway,
  evaluateRequirement,
} from '@/lib/evaluation'
import { buildFreeResult, matchOpportunities } from '@/lib/freeResult'
import { DEMO_PROFILE, type Profile } from '@/lib/profile'

const req = (
  over: Partial<KnowledgeRequirement> & { rule: KnowledgeRequirement['rule'] },
): KnowledgeRequirement => ({
  id: 'r1',
  title: 'Req',
  statement: 's',
  scopePassports: [],
  verified: false,
  ...over,
})

const age = req({
  id: 'age',
  title: 'Edad',
  rule: { mode: 'rule', criterion: 'age', operator: 'between', min: 18, max: 30, unit: 'años' },
})
const funds = req({
  id: 'funds',
  title: 'Fondos',
  rule: { mode: 'rule', criterion: 'funds', operator: 'gte', min: 5000, unit: 'AUD' },
})
const english = req({ id: 'eng', title: 'Inglés', rule: { mode: 'self_declared', question: '¿?' } })
const health = req({ id: 'health', title: 'Salud', rule: { mode: 'not_evaluated' } })
const children = req({
  id: 'kids',
  title: 'Hijos',
  rule: { mode: 'rule', criterion: 'dependentChildren', operator: 'isFalse' },
})

const out = (r: KnowledgeRequirement, p: Profile, rates: ExchangeRate[] = []) =>
  evaluateRequirement(r, p, rates).outcome

describe('regla de edad (entre 18 y 30, incluidos)', () => {
  it.each([
    [17, 'fails'],
    [18, 'meets'],
    [30, 'meets'],
    [31, 'fails'],
  ])('%i años → %s', (a, expected) => {
    expect(out(age, { age: a })).toBe(expected)
  })
  it('sin edad → falta comprobar (nunca «no cumple»)', () => {
    expect(out(age, {})).toBe('unknown')
    expect(out(age, { age: null })).toBe('unknown')
  })
})

describe('fondos en otra moneda', () => {
  it('sin tipo de cambio verificado no se convierte: falta comprobar', () => {
    const r = evaluateRequirement(funds, { savingsEur: 7000 })
    expect(r.outcome).toBe('unknown')
    expect(r.explanation).toMatch(/tipo de cambio verificado/)
  })
  const rate: ExchangeRate = {
    from: 'EUR',
    to: 'AUD',
    rate: 1.5,
    observedAt: '2026-10-01',
    source: { title: 'Banco X', url: 'https://example.org' },
  }
  it('con tipo de cambio con fuente: compara y lo explica', () => {
    const r = evaluateRequirement(funds, { savingsEur: 4000 }, [rate])
    expect(r.outcome).toBe('meets')
    expect(r.explanation).toMatch(/Banco X/)
  })
  it('justo en el mínimo cumple', () => {
    expect(out(funds, { savingsEur: 5000 / 1.5 }, [rate])).toBe('meets')
  })
  it('por debajo no cumple', () => {
    expect(out(funds, { savingsEur: 3000 }, [rate])).toBe('fails')
  })
  it('requisito en euros no necesita conversión', () => {
    const eur = req({
      rule: { mode: 'rule', criterion: 'funds', operator: 'gte', min: 1000, unit: 'EUR' },
    })
    expect(out(eur, { savingsEur: 1000 })).toBe('meets')
  })
})

describe('comprobaciones que confirma la persona', () => {
  it('sí → cumple; no → no cumple; no lo sé → falta comprobar; sin respuesta → falta comprobar', () => {
    expect(out(english, { checks: { eng: 'yes' } })).toBe('meets')
    expect(out(english, { checks: { eng: 'no' } })).toBe('fails')
    expect(out(english, { checks: { eng: 'unknown' } })).toBe('unknown')
    expect(out(english, {})).toBe('unknown')
  })
})

describe('otros casos', () => {
  it('no evaluado se mantiene como no evaluado', () => {
    expect(out(health, DEMO_PROFILE)).toBe('not_evaluated')
  })
  it('booleano: hijos a cargo', () => {
    expect(out(children, { dependentChildren: 'no' })).toBe('meets')
    expect(out(children, { dependentChildren: 'yes' })).toBe('fails')
    expect(out(children, { dependentChildren: 'unknown' })).toBe('unknown')
  })
  it('un requisito acotado a otro pasaporte no aplica', () => {
    const r = req({
      scopePassports: ['XX'],
      rule: { mode: 'rule', criterion: 'age', operator: 'lte', max: 35 },
    })
    expect(out(r, { passport: 'ES', age: 20 })).toBe('not_applicable')
  })
  it('regla incompleta en el CMS → falta comprobar, no inventa', () => {
    const r = req({ rule: { mode: 'rule', criterion: 'age', operator: 'between', min: 18 } })
    expect(out(r, { age: 20 })).toBe('unknown')
  })
})

const pathway: KnowledgePathway = {
  id: 'p1',
  name: 'Vía',
  url: '/australia/vias/x',
  eligiblePassports: ['ES'],
  verified: false,
  requirements: [age, funds, english, health, children],
}

describe('resumen de una vía', () => {
  it('si algo no se cumple, lo dice', () => {
    expect(evaluatePathway(pathway, { passport: 'ES', age: 40 }).summary).toBe('fails_some')
  })
  it('si nada falla pero hay dudas, «falta comprobar»', () => {
    expect(evaluatePathway(pathway, { passport: 'ES', age: 25 }).summary).toBe('pending_checks')
  })
  it('pasaporte no cubierto por el recorrido', () => {
    const r = evaluatePathway(pathway, { passport: 'other', age: 25 })
    expect(r.summary).toBe('not_covered')
    expect(r.results).toEqual([])
  })
})

describe('resultado gratuito', () => {
  const opps = [
    {
      id: 'o1',
      title: 'Soporte TI industrial',
      sector: 'mineria-energia',
      summary: '',
      adjacentProfiles: ['soporte técnico', 'redes'],
      regions: [],
      signalsCount: 0,
      verified: false,
      barriers: 'Zonas remotas',
    },
    {
      id: 'o2',
      title: 'Agricultura',
      sector: 'agricultura',
      summary: '',
      adjacentProfiles: ['trabajo físico'],
      regions: [],
      signalsCount: 0,
      verified: false,
    },
  ]

  it('solo muestra oportunidades con motivos explícitos', () => {
    const m = matchOpportunities(opps, DEMO_PROFILE)
    expect(m.map((x) => x.opportunity.id)).toEqual(['o1'])
    expect(m[0].reasons.join(' ')).toMatch(/soporte técnico/)
    expect(m[0].cautions.join(' ')).toMatch(/evidencia de mercado/)
  })

  it('el perfil demo produce pasos concretos y lista lo que falta', () => {
    const r = buildFreeResult(DEMO_PROFILE, {
      pathways: [pathway],
      opportunities: opps,
      guides: [{ title: 'Guía', url: '/g', pathwayIds: ['p1'] }],
      rates: [],
      includesDemo: true,
    })
    expect(r.nextSteps.length).toBeGreaterThan(0)
    expect(r.nextSteps.length).toBeLessThanOrEqual(3)
    expect(r.missing.join(' ')).toMatch(/Fondos/)
    expect(r.pathways[0].summary).toBe('pending_checks')
  })
})
