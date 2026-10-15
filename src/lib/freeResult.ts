/**
 * Resultado gratuito: compone la evaluación de vías con oportunidades, obstáculos,
 * información que falta y siguientes pasos. Todo determinista y explicable.
 */
import {
  type ExchangeRate,
  type KnowledgePathway,
  type PathwayResult,
  evaluatePathway,
} from './evaluation'
import { ENGLISH_LEVELS, EXPERIENCE, GOALS, type Profile, labelOf } from './profile'
import { sectorLabel } from './sectors'

export type KnowledgeOpportunity = {
  id: string
  title: string
  sector: string
  summary: string
  adjacentProfiles: string[]
  barriers?: string | null
  regions: string[]
  signalsCount: number
  verified: boolean
}

export type KnowledgeGuide = { title: string; url: string; pathwayIds: string[] }

export type Knowledge = {
  pathways: KnowledgePathway[]
  opportunities: KnowledgeOpportunity[]
  guides: KnowledgeGuide[]
  rates: ExchangeRate[]
  /** Hay contenido demo mezclado: el resultado lo dirá. */
  includesDemo: boolean
}

export type OpportunityMatch = {
  opportunity: KnowledgeOpportunity
  reasons: string[]
  cautions: string[]
}

export type NextStep = { title: string; why: string; href?: string }

export type FreeResult = {
  goals: string[]
  pathways: PathwayResult[]
  opportunities: OpportunityMatch[]
  obstacles: string[]
  missing: string[]
  nextSteps: NextStep[]
  guides: KnowledgeGuide[]
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Oportunidades con al menos un motivo explícito. Sin puntuaciones: se ordenan por número de motivos. */
export function matchOpportunities(
  opps: KnowledgeOpportunity[],
  profile: Profile,
): OpportunityMatch[] {
  const experienceText = norm(
    [profile.profession, profile.skills, profile.studyField].filter(Boolean).join(' '),
  )
  return opps
    .map((o) => {
      const reasons: string[] = []
      if (profile.sector && o.sector === profile.sector)
        reasons.push(`Es tu sector actual (${sectorLabel(o.sector)}).`)
      if (profile.sectorsOfInterest?.includes(o.sector as never) && o.sector !== profile.sector)
        reasons.push(`Has dicho que te interesa ${sectorLabel(o.sector).toLowerCase()}.`)
      const adjacent = o.adjacentProfiles.filter(
        (a) => experienceText && experienceText.includes(norm(a)),
      )
      if (adjacent.length)
        reasons.push(`Tu experiencia en ${adjacent.map((a) => `«${a}»`).join(', ')} es cercana.`)

      const cautions: string[] = []
      if (!o.signalsCount)
        cautions.push('Todavía no tenemos evidencia de mercado verificada para esta oportunidad.')
      if (!o.verified) cautions.push('Ficha pendiente de verificar.')
      if (profile.remoteOk === 'no' && o.barriers && /remot|rural|alejad/i.test(o.barriers))
        cautions.push('Suele implicar zonas remotas o rurales, y has dicho que prefieres ciudad.')
      return { opportunity: o, reasons, cautions }
    })
    .filter((m) => m.reasons.length > 0)
    .sort(
      (a, b) =>
        b.reasons.length - a.reasons.length ||
        a.opportunity.title.localeCompare(b.opportunity.title),
    )
}

export function buildFreeResult(profile: Profile, k: Knowledge): FreeResult {
  const pathways = k.pathways.map((p) => evaluatePathway(p, profile, k.rates))
  const allResults = pathways.flatMap((p) => p.results)
  const fails = allResults.filter((r) => r.outcome === 'fails')
  const unknowns = allResults.filter((r) => r.outcome === 'unknown')

  const obstacles: string[] = fails.map((f) => `${f.requirement.title}: ${f.explanation}`)
  if (profile.english === 'none' || profile.english === 'basic')
    obstacles.push(
      'Inglés: con un nivel básico, buscar trabajo y acreditar el idioma será más difícil. Es orientativo, no una regla oficial.',
    )
  if (pathways.length && pathways.every((p) => p.summary === 'not_covered'))
    obstacles.push(
      'Nuestro recorrido actual no cubre tu pasaporte. La información de las vías puede no aplicarse a ti.',
    )

  const missing: string[] = []
  if (profile.age == null) missing.push('Tu edad')
  if (!profile.passport) missing.push('La nacionalidad de tu pasaporte')
  if (profile.savingsEur == null) missing.push('Tus ahorros disponibles')
  if (!profile.english || profile.english === 'unknown') missing.push('Tu nivel de inglés')
  if (!profile.experience) missing.push('Tu experiencia laboral')
  for (const u of unknowns) missing.push(`${u.requirement.title}: ${u.explanation}`)

  const nextSteps: NextStep[] = []
  const firstFail = fails[0]
  if (firstFail)
    nextSteps.push({
      title: `Revisa «${firstFail.requirement.title}»`,
      why: 'Según tus respuestas no se cumple. Comprueba en la fuente oficial si hay excepciones o explora otras vías.',
      href: firstFail.requirement.source?.url,
    })
  for (const u of unknowns) {
    if (nextSteps.length >= 2) break
    nextSteps.push({
      title: `Confirma «${u.requirement.title}»`,
      why: 'Es un requisito que todavía no sabemos si cumples. Resolverlo antes evita sorpresas al solicitar.',
      href: u.requirement.source?.url,
    })
  }
  if (
    nextSteps.length < 3 &&
    profile.english !== 'advanced' &&
    profile.englishCertificate !== 'yes'
  )
    nextSteps.push({
      title: 'Averigua qué pruebas de inglés acepta la vía',
      why: 'Te sirve para acreditar el requisito de idioma y, de paso, para presentarte mejor al buscar trabajo.',
    })
  const coveredIds = new Set(pathways.filter((p) => p.coversPassport).map((p) => p.pathway.id))
  const guides = k.guides.filter((g) => g.pathwayIds.some((id) => coveredIds.has(id)))
  if (nextSteps.length < 3 && guides[0])
    nextSteps.push({
      title: `Lee «${guides[0].title}»`,
      why: 'Explica la vía con más contexto y enlaza las fuentes.',
      href: guides[0].url,
    })

  return {
    goals: (profile.goals ?? []).map((g) => labelOf(GOALS, g) ?? g),
    pathways,
    opportunities: matchOpportunities(k.opportunities, profile),
    obstacles,
    missing,
    nextSteps: nextSteps.slice(0, 3),
    guides,
  }
}

/** Frase de resumen del perfil, en lenguaje natural y sin datos que la persona no haya dado. */
export function profileSummary(p: Profile): string {
  const parts: string[] = []
  if (p.age != null) parts.push(`${p.age} años`)
  if (p.passport === 'ES') parts.push('pasaporte español')
  if (p.profession) parts.push(p.profession.toLowerCase())
  const exp = labelOf(EXPERIENCE, p.experience)
  if (exp && p.experience !== 'none') parts.push(`${exp.toLowerCase()} de experiencia`)
  const eng = labelOf(ENGLISH_LEVELS, p.english)
  if (eng && p.english !== 'unknown')
    parts.push(`inglés ${eng.toLowerCase().replace(/\s*\(.*\)/, '')}`)
  if (p.savingsEur != null)
    parts.push(`${new Intl.NumberFormat('es-ES').format(p.savingsEur)} € ahorrados`)
  return parts.length ? parts.join(' · ') : 'Todavía no nos has contado mucho sobre ti.'
}
