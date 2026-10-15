import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Questionnaire } from '@/components/analysis/Questionnaire'
import { getKnowledge } from '@/lib/knowledge'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Analiza tu situación',
  description:
    'Responde unas preguntas cortas y descubre qué vías merece la pena investigar, qué te falta comprobar y tus siguientes pasos. Sin cuenta.',
  alternates: { canonical: '/analisis' },
}

// Destino del recorrido actual. Al añadir países, se elegirá en el primer paso.
const COUNTRY = 'australia'

export default async function AnalysisPage() {
  const knowledge = await getKnowledge(COUNTRY)
  if (!knowledge) notFound()
  return (
    <div className="container narrow section">
      <span className="eyebrow">Análisis gratuito · Australia</span>
      <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)' }}>Analiza tu situación</h1>
      <p className="lead">Unas preguntas cortas. Puedes saltarte las que no sepas. Sin cuenta.</p>
      <Questionnaire knowledge={knowledge} />
    </div>
  )
}
