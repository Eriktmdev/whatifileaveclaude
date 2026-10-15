/**
 * Motor de evaluación determinista del resultado gratuito.
 *
 * - Solo usa reglas publicadas en el CMS (colección Requisitos) y el perfil.
 * - Nunca decide una elegibilidad migratoria: clasifica cada requisito evaluado.
 * - «No lo sé» produce «Falta comprobar», nunca «No cumple».
 * - Sin porcentajes ni puntuaciones.
 */
import type { Profile } from './profile'

export type Outcome = 'meets' | 'fails' | 'unknown' | 'not_evaluated' | 'not_applicable'

export type KnowledgeRequirement = {
  id: string
  title: string
  statement: string
  details?: string | null
  rule: {
    mode: 'rule' | 'self_declared' | 'not_evaluated'
    criterion?: string | null
    operator?: string | null
    min?: number | null
    max?: number | null
    values?: string[] | null
    unit?: string | null
    question?: string | null
  }
  scopePassports: string[]
  verified: boolean
  volatility?: string | null
  source?: { title: string; url: string } | null
}

export type KnowledgePathway = {
  id: string
  name: string
  officialCode?: string | null
  url: string
  eligiblePassports: string[]
  verified: boolean
  requirements: KnowledgeRequirement[]
}

export type ExchangeRate = {
  from: string
  to: string
  rate: number
  observedAt: string
  source: { title: string; url: string }
}

export type RequirementResult = {
  requirement: KnowledgeRequirement
  outcome: Outcome
  explanation: string
}

export type PathwayResult = {
  pathway: KnowledgePathway
  coversPassport: boolean
  results: RequirementResult[]
  summary: 'fails_some' | 'pending_checks' | 'meets_evaluated' | 'not_covered'
}

const fmt = (n: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n)

/** Valor del perfil para un criterio. `undefined` = la persona no lo sabe o no lo ha dicho. */
function profileValue(
  criterion: string | null | undefined,
  profile: Profile,
  unit: string | null | undefined,
  rates: ExchangeRate[],
): { value?: number | string | boolean; note?: string } {
  switch (criterion) {
    case 'age':
      return { value: profile.age ?? undefined }
    case 'passport':
      return {
        value: profile.passport && profile.passport !== 'other' ? profile.passport : undefined,
      }
    case 'education':
      return {
        value: profile.education && profile.education !== 'unknown' ? profile.education : undefined,
      }
    case 'english':
      return {
        value: profile.english && profile.english !== 'unknown' ? profile.english : undefined,
      }
    case 'dependentChildren':
      return {
        value:
          profile.dependentChildren === 'yes'
            ? true
            : profile.dependentChildren === 'no'
              ? false
              : undefined,
      }
    case 'funds': {
      if (profile.savingsEur === null || profile.savingsEur === undefined) return {}
      const currency = (unit ?? '').toUpperCase()
      if (!currency || currency === 'EUR') return { value: profile.savingsEur }
      const rate = rates.find((r) => r.from === 'EUR' && r.to === currency)
      if (!rate) {
        return {
          note: `No convertimos tus ${fmt(profile.savingsEur)} € a ${currency} porque no tenemos un tipo de cambio verificado. Compruébalo con un conversor oficial o tu banco.`,
        }
      }
      return {
        value: profile.savingsEur * rate.rate,
        note: `Conversión con el tipo de cambio del ${rate.observedAt.slice(0, 10)} (${rate.source.title}). Puede variar.`,
      }
    }
    default:
      return {}
  }
}

export function evaluateRequirement(
  req: KnowledgeRequirement,
  profile: Profile,
  rates: ExchangeRate[] = [],
): RequirementResult {
  const r = req.rule
  const passport = profile.passport && profile.passport !== 'other' ? profile.passport : undefined

  if (req.scopePassports.length && passport && !req.scopePassports.includes(passport)) {
    return { requirement: req, outcome: 'not_applicable', explanation: 'No aplica a tu pasaporte.' }
  }

  if (r.mode === 'not_evaluated') {
    return {
      requirement: req,
      outcome: 'not_evaluated',
      explanation: 'La herramienta no evalúa este requisito. Revísalo en la fuente oficial.',
    }
  }

  if (r.mode === 'self_declared') {
    const answer = profile.checks?.[req.id]
    if (answer === 'yes')
      return { requirement: req, outcome: 'meets', explanation: 'Has indicado que lo cumples.' }
    if (answer === 'no')
      return { requirement: req, outcome: 'fails', explanation: 'Has indicado que no lo cumples.' }
    return {
      requirement: req,
      outcome: 'unknown',
      explanation:
        answer === 'unknown'
          ? 'Has indicado que no lo sabes.'
          : 'No has respondido a esta comprobación.',
    }
  }

  // Regla automática
  const { value, note } = profileValue(r.criterion, profile, r.unit, rates)
  const unknown = (why: string): RequirementResult => ({
    requirement: req,
    outcome: 'unknown',
    explanation: note ?? why,
  })
  if (value === undefined) return unknown('Falta este dato en tu perfil.')

  const withNote = (text: string) => (note ? `${text} ${note}` : text)
  const unit = r.unit ? ` ${r.unit}` : ''

  switch (r.operator) {
    case 'between': {
      if (typeof value !== 'number' || r.min == null || r.max == null)
        return unknown('La regla está incompleta.')
      const ok = value >= r.min && value <= r.max
      return {
        requirement: req,
        outcome: ok ? 'meets' : 'fails',
        explanation: withNote(
          ok
            ? `Tu dato (${fmt(value)}${unit}) está entre ${fmt(r.min)} y ${fmt(r.max)}${unit}.`
            : `Tu dato (${fmt(value)}${unit}) está fuera del rango ${fmt(r.min)}–${fmt(r.max)}${unit}.`,
        ),
      }
    }
    case 'gte': {
      if (typeof value !== 'number' || r.min == null) return unknown('La regla está incompleta.')
      const ok = value >= r.min
      return {
        requirement: req,
        outcome: ok ? 'meets' : 'fails',
        explanation: withNote(
          ok
            ? `Tu dato (${fmt(value)}${unit}) alcanza el mínimo de ${fmt(r.min)}${unit}.`
            : `Tu dato (${fmt(value)}${unit}) no llega al mínimo de ${fmt(r.min)}${unit}.`,
        ),
      }
    }
    case 'lte': {
      if (typeof value !== 'number' || r.max == null) return unknown('La regla está incompleta.')
      const ok = value <= r.max
      return {
        requirement: req,
        outcome: ok ? 'meets' : 'fails',
        explanation: withNote(
          ok
            ? `Tu dato (${fmt(value)}${unit}) no supera el máximo de ${fmt(r.max)}${unit}.`
            : `Tu dato (${fmt(value)}${unit}) supera el máximo de ${fmt(r.max)}${unit}.`,
        ),
      }
    }
    case 'in': {
      if (!r.values?.length) return unknown('La regla está incompleta.')
      const ok = r.values.includes(String(value))
      return {
        requirement: req,
        outcome: ok ? 'meets' : 'fails',
        explanation: ok
          ? 'Tu respuesta está entre los valores admitidos.'
          : 'Tu respuesta no está entre los valores admitidos.',
      }
    }
    case 'isTrue':
    case 'isFalse': {
      if (typeof value !== 'boolean') return unknown('Falta este dato en tu perfil.')
      const ok = r.operator === 'isTrue' ? value : !value
      return {
        requirement: req,
        outcome: ok ? 'meets' : 'fails',
        explanation: ok
          ? 'Tu respuesta encaja con el requisito.'
          : 'Tu respuesta no encaja con el requisito.',
      }
    }
    default:
      return unknown('La regla está incompleta.')
  }
}

export function evaluatePathway(
  pathway: KnowledgePathway,
  profile: Profile,
  rates: ExchangeRate[] = [],
): PathwayResult {
  const passport = profile.passport && profile.passport !== 'other' ? profile.passport : undefined
  const coversPassport =
    !pathway.eligiblePassports.length ||
    (!!passport && pathway.eligiblePassports.includes(passport))
  if (!coversPassport) {
    return { pathway, coversPassport, results: [], summary: 'not_covered' }
  }
  const results = pathway.requirements
    .map((r) => evaluateRequirement(r, profile, rates))
    .filter((r) => r.outcome !== 'not_applicable')
  const summary = results.some((r) => r.outcome === 'fails')
    ? 'fails_some'
    : results.some((r) => r.outcome === 'unknown')
      ? 'pending_checks'
      : 'meets_evaluated'
  return { pathway, coversPassport, results, summary }
}

export const groupResults = (results: RequirementResult[]) => ({
  meets: results.filter((r) => r.outcome === 'meets'),
  fails: results.filter((r) => r.outcome === 'fails'),
  unknown: results.filter((r) => r.outcome === 'unknown'),
  notEvaluated: results.filter((r) => r.outcome === 'not_evaluated'),
})
