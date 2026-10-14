/**
 * Temas fijos de navegación de un país. Viven en código (no en el CMS) porque
 * cambian muy poco y las URLs dependen de ellos.
 */
export const TOPICS = [
  {
    value: 'visados',
    label: 'Visados y vías de estancia',
    short: 'Visados',
    description: 'Qué vías existen para vivir o trabajar allí y qué piden.',
  },
  {
    value: 'trabajo',
    label: 'Trabajo',
    short: 'Trabajo',
    description: 'Cómo funciona el mercado laboral y cómo buscar empleo.',
  },
  {
    value: 'vivienda',
    label: 'Vivienda',
    short: 'Vivienda',
    description: 'Dónde y cómo encontrar alojamiento.',
  },
  {
    value: 'dinero',
    label: 'Dinero y costes',
    short: 'Dinero',
    description: 'Cuánto necesitas, impuestos y cuentas bancarias.',
  },
  {
    value: 'vida-cotidiana',
    label: 'Vida cotidiana',
    short: 'Vida diaria',
    description: 'Sanidad, transporte, trámites y día a día.',
  },
  {
    value: 'preparacion',
    label: 'Preparar la salida',
    short: 'Preparación',
    description: 'Qué hacer antes de irte y en las primeras semanas.',
  },
] as const

export type TopicValue = (typeof TOPICS)[number]['value']

export const topicOptions = TOPICS.map((t) => ({ label: t.label, value: t.value }))

export function getTopic(value: string | null | undefined) {
  return TOPICS.find((t) => t.value === value)
}
