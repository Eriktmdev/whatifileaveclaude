import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

/** Llamada a la acción hacia el cuestionario gratuito. */
export function AnalysisCta({
  text = '¿Encaja contigo? Responde unas preguntas y mira qué cumples, qué no y qué falta comprobar.',
}: {
  text?: string
}) {
  return (
    <aside className="cta-box" aria-label="Analiza tu situación">
      <p>{text}</p>
      <Link className="button" href="/analisis">
        Analizar mi situación <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </aside>
  )
}
