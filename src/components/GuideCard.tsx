import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { getTopic } from '@/lib/topics'
import type { Guide } from '@/payload-types'

import { HeroMedia } from './HeroMedia'
import { Icon, TOPIC_ICONS } from './icons'

export function GuideCard({
  guide,
  countrySlug,
}: {
  guide: Pick<Guide, 'id' | 'title' | 'slug' | 'topic' | 'summary' | 'image'>
  countrySlug: string
}) {
  const topic = getTopic(guide.topic)
  const TopicIcon = TOPIC_ICONS[guide.topic]
  return (
    <article className="guide-card">
      {/* Sin foto propia, la tarjeta va sin imagen: no repetimos la ilustración. */}
      {guide.image?.src ? (
        <HeroMedia
          image={guide.image}
          className="guide-card-media"
          sizes="(min-width: 960px) 33vw, 100vw"
        />
      ) : null}
      <div className="guide-card-body">
        {topic ? (
          <span className="tag">
            {TopicIcon ? <Icon icon={TopicIcon} size={14} /> : null}
            {topic.short}
          </span>
        ) : null}
        <h3>
          <Link href={`/${countrySlug}/guias/${guide.slug}`} className="stretched">
            {guide.title}
          </Link>
        </h3>
        <p>{guide.summary}</p>
        <span className="read-more" aria-hidden="true">
          Leer guía <ArrowRight size={16} />
        </span>
      </div>
    </article>
  )
}
