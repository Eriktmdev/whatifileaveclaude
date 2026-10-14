/**
 * Nacionalidades (pasaportes) que el modelo conoce. Se amplía cuando se
 * incorpore un nuevo perfil. Ojo: pasaporte ≠ país de residencia ≠ idioma.
 */
export const PASSPORTS = [{ label: 'España', value: 'ES' }] as const

export type PassportCode = (typeof PASSPORTS)[number]['value']
