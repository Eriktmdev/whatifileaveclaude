/** Sectores para clasificar oportunidades. Vocabulario compartido CMS ↔ explorador ↔ cuestionario. */
export const SECTORS = [
  { value: 'tecnologia', label: 'Tecnología e informática' },
  { value: 'mineria-energia', label: 'Minería, energía y recursos' },
  { value: 'construccion', label: 'Construcción y oficios' },
  { value: 'sanidad', label: 'Sanidad y cuidados' },
  { value: 'hosteleria-turismo', label: 'Hostelería y turismo' },
  { value: 'agricultura', label: 'Agricultura y campo' },
  { value: 'educacion', label: 'Educación' },
  { value: 'logistica', label: 'Logística y transporte' },
  { value: 'administracion', label: 'Administración y oficina' },
  { value: 'otros', label: 'Otros' },
] as const

export type SectorValue = (typeof SECTORS)[number]['value']

export const sectorLabel = (v: string | null | undefined) =>
  SECTORS.find((s) => s.value === v)?.label ?? v ?? ''

/**
 * Tipos de señal de mercado. NO son intercambiables:
 * estar en una lista oficial no prueba escasez, y la escasez no prueba vacantes
 * ni que esta persona en concreto pueda acceder al puesto.
 */
export const SIGNAL_KINDS = [
  { value: 'listed_occupation', label: 'Profesión incluida en una lista oficial' },
  { value: 'shortage_evidence', label: 'Escasez documentada' },
  { value: 'current_vacancies', label: 'Vacantes actuales' },
  { value: 'salary_reference', label: 'Referencia salarial' },
] as const

export const signalLabel = (v: string | null | undefined) =>
  SIGNAL_KINDS.find((s) => s.value === v)?.label ?? v ?? ''
