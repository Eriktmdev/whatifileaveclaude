/** Preguntas frecuentes accesibles (details/summary) con datos estructurados FAQPage. */
export function Faq({
  items,
  id = 'faq',
  title = 'Preguntas frecuentes',
}: {
  items: { id?: string | null; question: string; answer: string }[] | null | undefined
  id?: string
  title?: string
}) {
  if (!items?.length) return null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return (
    <section aria-labelledby={id} className="block">
      <h2 id={id}>{title}</h2>
      <div className="faq">
        {items.map((f, i) => (
          <details key={f.id ?? i}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  )
}
