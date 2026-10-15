import { slugify } from './slug'

type LexicalNode = { type?: string; tag?: string; text?: string; children?: LexicalNode[] }

export function nodeText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(nodeText).join('')
}

export const headingId = (text: string) => `s-${slugify(text)}`

/** Índice «En esta página» a partir de los títulos de nivel 2 del texto. */
export function tableOfContents(body: { root?: LexicalNode } | null | undefined) {
  return (body?.root?.children ?? [])
    .filter((n) => n.type === 'heading' && n.tag === 'h2')
    .map((n) => {
      const text = nodeText(n)
      return { id: headingId(text), text }
    })
    .filter((h) => h.text)
}
