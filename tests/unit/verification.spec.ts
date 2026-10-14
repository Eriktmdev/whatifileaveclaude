import { describe, expect, it } from 'vitest'

import {
  freshness,
  isInForce,
  renderStatement,
  validatePublishable,
  validateVerification,
} from '@/lib/verification'

const NOW = new Date('2026-10-14T12:00:00Z')

describe('validateVerification', () => {
  it('no permite «Verificado» sin fecha real de comprobación', () => {
    expect(validateVerification({ reviewStatus: 'verified' }, NOW)).toHaveLength(1)
  })

  it('acepta «Verificado» con fecha pasada', () => {
    expect(
      validateVerification({ reviewStatus: 'verified', lastVerifiedAt: '2026-10-01' }, NOW),
    ).toEqual([])
  })

  it('rechaza fechas de verificación en el futuro', () => {
    const errors = validateVerification(
      { reviewStatus: 'verified', lastVerifiedAt: '2026-12-01' },
      NOW,
    )
    expect(errors.join()).toMatch(/futuro/)
  })

  it('rechaza una vigencia que termina antes de empezar', () => {
    expect(
      validateVerification({ validFrom: '2026-07-01', validUntil: '2026-06-30' }, NOW),
    ).toHaveLength(1)
  })

  it('«Sin verificar» sin fecha es un estado válido', () => {
    expect(validateVerification({ reviewStatus: 'unverified' }, NOW)).toEqual([])
  })
})

describe('validatePublishable', () => {
  const verified = { reviewStatus: 'verified' as const, lastVerifiedAt: '2026-10-01' }

  it('contenido real verificado y con fuente: se puede publicar', () => {
    expect(validatePublishable({ verification: verified, sourcesCount: 1 })).toEqual([])
  })

  it('contenido real sin verificar: bloqueado', () => {
    expect(
      validatePublishable({ verification: { reviewStatus: 'unverified' }, sourcesCount: 1 }),
    ).not.toEqual([])
  })

  it('contenido real «en revisión»: bloqueado aunque tenga fecha', () => {
    const v = { reviewStatus: 'needs_review' as const, lastVerifiedAt: '2026-10-01' }
    expect(validatePublishable({ verification: v, sourcesCount: 1 })).toHaveLength(1)
  })

  it('contenido real sin fuentes: bloqueado', () => {
    expect(validatePublishable({ verification: verified, sourcesCount: 0 })).toHaveLength(1)
  })

  it('el contenido demo puede publicarse (la web lo oculta en producción)', () => {
    expect(validatePublishable({ isDemo: true, sourcesCount: 0 })).toEqual([])
  })
})

describe('freshness', () => {
  it('sin fecha → nunca comprobado', () => {
    expect(freshness(null, NOW)).toBe('never')
  })
  it('justo en el límite sigue siendo reciente', () => {
    const d = new Date(NOW.getTime() - 180 * 86_400_000)
    expect(freshness(d, NOW)).toBe('fresh')
  })
  it('pasado el límite se marca como antiguo', () => {
    const d = new Date(NOW.getTime() - 181 * 86_400_000)
    expect(freshness(d, NOW)).toBe('stale')
  })
})

describe('isInForce', () => {
  it('sin fechas de vigencia aplica siempre', () => {
    expect(isInForce({}, NOW)).toBe(true)
  })
  it('caducado no aplica', () => {
    expect(isInForce({ validUntil: '2026-06-30' }, NOW)).toBe(false)
  })
  it('todavía no vigente no aplica', () => {
    expect(isInForce({ validFrom: '2027-01-01' }, NOW)).toBe(false)
  })
})

describe('renderStatement', () => {
  it('inserta los valores de la regla: el dato vive en un solo sitio', () => {
    expect(renderStatement('Entre {min} y {max} años', { min: 18, max: 30 })).toBe(
      'Entre 18 y 30 años',
    )
  })
  it('formatea importes en español', () => {
    expect(renderStatement('Al menos {min} AUD', { min: 5000 })).toBe(
      'Al menos 5000 AUD'.replace('5000', new Intl.NumberFormat('es-ES').format(5000)),
    )
  })
  it('si falta el valor no se inventa: muestra ¿?', () => {
    expect(renderStatement('Hasta {max} años', { min: 18 })).toBe('Hasta ¿? años')
  })
  it('lista de valores', () => {
    expect(renderStatement('Pasaportes: {values}', { values: ['ES'] })).toBe('Pasaportes: ES')
  })
})
