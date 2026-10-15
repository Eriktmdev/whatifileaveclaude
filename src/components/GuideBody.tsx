import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { headingId, nodeText } from '@/lib/richtext'

// Los títulos h2 llevan id para que funcione el índice «En esta página».
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const Tag = (['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : 'h3') as 'h2' | 'h3' | 'h4'
    const id = Tag === 'h2' ? headingId(nodeText(node as never)) : undefined
    return <Tag id={id}>{children}</Tag>
  },
})

export function GuideBody({ data }: { data: SerializedEditorState }) {
  return <RichText data={data} converters={converters} />
}
