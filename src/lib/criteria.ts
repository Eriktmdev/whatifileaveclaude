/**
 * Criterios que la herramienta «Explora tus opciones» sabe preguntar.
 * Un requisito del CMS puede enlazarse a uno de estos criterios para que la
 * herramienta lo evalúe con una regla explícita. Si un requisito no tiene
 * criterio, la herramienta lo mostrará como «no evaluado».
 *
 * La lógica de evaluación llegará en la siguiente entrega; aquí solo se
 * define el vocabulario compartido entre CMS y herramienta.
 */
export const CRITERIA = [
  { value: 'age', label: 'Edad al presentar la solicitud (años)', kind: 'number' },
  { value: 'passport', label: 'Pasaporte (nacionalidad)', kind: 'choice' },
  { value: 'funds', label: 'Fondos disponibles (moneda local del destino)', kind: 'number' },
  { value: 'education', label: 'Nivel de estudios', kind: 'choice' },
  { value: 'english', label: 'Nivel de inglés', kind: 'choice' },
  { value: 'dependentChildren', label: 'Viaja con hijos a cargo', kind: 'boolean' },
  { value: 'previousVisa', label: 'Ha tenido antes este visado', kind: 'boolean' },
] as const

export type CriterionValue = (typeof CRITERIA)[number]['value']

export const OPERATORS = [
  { label: 'Entre mínimo y máximo (incluidos)', value: 'between' },
  { label: 'Mayor o igual que el mínimo', value: 'gte' },
  { label: 'Menor o igual que el máximo', value: 'lte' },
  { label: 'Es uno de los valores permitidos', value: 'in' },
  { label: 'Debe ser «sí»', value: 'isTrue' },
  { label: 'Debe ser «no»', value: 'isFalse' },
] as const
