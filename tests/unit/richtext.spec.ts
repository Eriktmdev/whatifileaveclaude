import { describe, expect, it } from 'vitest'

import { tableOfContents } from '@/lib/richtext'

describe('tableOfContents', () => {
  it('extrae solo los títulos h2, con id estable', () => {
    const body = {
      root: {
        children: [
          { type: 'heading', tag: 'h2', children: [{ text: 'Qué es' }] },
          { type: 'paragraph', children: [{ text: 'texto' }] },
          { type: 'heading', tag: 'h3', children: [{ text: 'Detalle' }] },
          { type: 'heading', tag: 'h2', children: [{ text: 'Lo que ' }, { text: 'no es' }] },
        ],
      },
    }
    expect(tableOfContents(body)).toEqual([
      { id: 's-que-es', text: 'Qué es' },
      { id: 's-lo-que-no-es', text: 'Lo que no es' },
    ])
  })

  it('sin contenido devuelve una lista vacía', () => {
    expect(tableOfContents(null)).toEqual([])
  })
})
