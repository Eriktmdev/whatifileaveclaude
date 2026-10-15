import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ResultView } from '@/components/analysis/ResultView'
import { getKnowledge } from '@/lib/knowledge'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tu resultado',
  robots: { index: false, follow: true },
}

const COUNTRY = 'australia'

export default async function ResultPage() {
  const knowledge = await getKnowledge(COUNTRY)
  if (!knowledge) notFound()
  return (
    <div className="container narrow section">
      <span className="eyebrow">Resultado gratuito · Australia</span>
      <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)' }}>Tu resultado</h1>
      <p className="lead">
        Calculado en tu navegador con los requisitos publicados. No guardamos tus respuestas.
      </p>
      <ResultView knowledge={knowledge} />
    </div>
  )
}
