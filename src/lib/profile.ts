import { z } from 'zod'

import { PASSPORTS } from './passports'
import { SECTORS } from './sectors'

/**
 * Perfil del cuestionario. Todo es opcional: «No lo sé» es una respuesta válida
 * y se distingue de «No cumplo». Pasaporte, residencia e idioma son campos distintos.
 *
 * El perfil vive en el navegador de la persona (localStorage). No se envía al servidor.
 */

export const UNKNOWN = 'unknown' as const

export const EDUCATION_LEVELS = [
  { value: 'secondary', label: 'ESO o Bachillerato' },
  { value: 'vocational', label: 'Formación Profesional (grado medio o superior)' },
  { value: 'university_partial', label: 'Estudios universitarios sin terminar' },
  { value: 'bachelor', label: 'Grado universitario' },
  { value: 'master_plus', label: 'Máster o doctorado' },
  { value: UNKNOWN, label: 'Prefiero no decirlo' },
] as const

export const ENGLISH_LEVELS = [
  { value: 'none', label: 'Nada o casi nada' },
  { value: 'basic', label: 'Básico (A1–A2)' },
  { value: 'intermediate', label: 'Intermedio (B1–B2)' },
  { value: 'advanced', label: 'Avanzado (C1–C2)' },
  { value: UNKNOWN, label: 'No lo sé' },
] as const

export const EXPERIENCE = [
  { value: 'none', label: 'Sin experiencia laboral' },
  { value: 'lt1', label: 'Menos de 1 año' },
  { value: '1to2', label: '1–2 años' },
  { value: '3to5', label: '3–5 años' },
  { value: '6plus', label: '6 años o más' },
] as const

export const GOALS = [
  { value: 'save', label: 'Ahorrar' },
  { value: 'salary', label: 'Mejorar mi salario' },
  { value: 'career', label: 'Desarrollar mi carrera' },
  { value: 'temporary_work', label: 'Trabajar una temporada' },
  { value: 'study', label: 'Estudiar' },
  { value: 'experience', label: 'Vivir la experiencia' },
  { value: 'explore', label: 'Explorar oportunidades' },
  { value: 'entrepreneur', label: 'Emprender' },
] as const

export const DURATIONS = [
  { value: 'lt1y', label: 'Menos de un año' },
  { value: '1to2y', label: 'Entre uno y dos años' },
  { value: 'gt2y', label: 'Más de dos años o indefinido' },
  { value: UNKNOWN, label: 'Aún no lo sé' },
] as const

export const PREP_TIMES = [
  { value: 'lt3m', label: 'Menos de 3 meses' },
  { value: '3to6m', label: '3–6 meses' },
  { value: '6to12m', label: '6–12 meses' },
  { value: 'gt12m', label: 'Más de un año' },
] as const

export const YES_NO_UNKNOWN = [
  { value: 'yes', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: UNKNOWN, label: 'No lo sé' },
] as const

export const REMOTE_WILLINGNESS = [
  { value: 'yes', label: 'Sí, me interesa' },
  { value: 'maybe', label: 'Depende de las condiciones' },
  { value: 'no', label: 'Prefiero ciudad' },
] as const

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as unknown as [T[number]['value'], ...T[number]['value'][]]

const yesNoUnknown = z.enum(values(YES_NO_UNKNOWN))

export const ProfileSchema = z.object({
  // Situación personal
  age: z.number().int().min(14).max(99).nullable().optional(),
  passport: z.enum([...values(PASSPORTS), 'other']).optional(),
  residence: z.enum(['ES', 'other']).optional(),
  dependentChildren: yesNoUnknown.optional(),
  // Formación y experiencia
  education: z.enum(values(EDUCATION_LEVELS)).optional(),
  studyField: z.string().max(120).optional(),
  sector: z.enum(values(SECTORS)).optional(),
  profession: z.string().max(120).optional(),
  experience: z.enum(values(EXPERIENCE)).optional(),
  skills: z.string().max(400).optional(),
  english: z.enum(values(ENGLISH_LEVELS)).optional(),
  englishCertificate: yesNoUnknown.optional(),
  // Economía (en euros; la conversión solo se hace con un tipo de cambio con fuente)
  savingsEur: z.number().min(0).max(10_000_000).nullable().optional(),
  // Objetivos y preferencias
  goals: z
    .array(z.enum(values(GOALS)))
    .max(8)
    .optional(),
  duration: z.enum(values(DURATIONS)).optional(),
  prepTime: z.enum(values(PREP_TIMES)).optional(),
  remoteOk: z.enum(values(REMOTE_WILLINGNESS)).optional(),
  sectorsOfInterest: z
    .array(z.enum(values(SECTORS)))
    .max(10)
    .optional(),
  // Respuestas a requisitos que la persona confirma (id de requisito → sí/no/no lo sé)
  checks: z.record(z.string(), yesNoUnknown).optional(),
})

export type Profile = z.infer<typeof ProfileSchema>

export const PROFILE_STORAGE_KEY = 'wil.profile.v1'

/** Lee y valida un perfil guardado. Si está corrupto o es de otra versión, devuelve null. */
export function parseStoredProfile(raw: string | null): Profile | null {
  if (!raw) return null
  try {
    const parsed = ProfileSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export const labelOf = (
  list: readonly { value: string; label: string }[],
  v: string | undefined | null,
) => list.find((o) => o.value === v)?.label

/** Perfil de demostración (ficticio, etiquetado). Coincide con el recorrido de ejemplo del documento maestro. */
export const DEMO_PROFILE: Profile = {
  age: 24,
  passport: 'ES',
  residence: 'ES',
  dependentChildren: 'no',
  education: 'vocational',
  studyField: 'Sistemas e informática',
  sector: 'tecnologia',
  profession: 'Técnico de soporte',
  experience: '3to5',
  skills: 'soporte técnico, integraciones, redes, sistemas',
  english: 'intermediate',
  englishCertificate: UNKNOWN,
  savingsEur: 7000,
  goals: ['save', 'experience', 'career'],
  duration: '1to2y',
  prepTime: '3to6m',
  remoteOk: 'maybe',
  sectorsOfInterest: ['tecnologia', 'mineria-energia'],
  checks: {},
}
