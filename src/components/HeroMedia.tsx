import Image from 'next/image'

type ImageData = {
  src?: string | null
  alt?: string | null
  credit?: string | null
  creditUrl?: string | null
}

/**
 * Imagen con su crédito. Sin imagen, una ilustración neutra (no una foto
 * de relleno de origen desconocido).
 */
export function HeroMedia({
  image,
  priority = false,
  className = '',
  sizes = '(min-width: 960px) 50vw, 100vw',
}: {
  image?: ImageData | null
  priority?: boolean
  className?: string
  sizes?: string
}) {
  if (!image?.src) {
    return (
      <div className={`media media-illustration ${className}`}>
        <Landscape />
      </div>
    )
  }
  return (
    <figure className={`media ${className}`}>
      <Image src={image.src} alt={image.alt ?? ''} fill sizes={sizes} priority={priority} />
      {image.credit ? (
        <figcaption className="media-credit">
          {image.creditUrl ? (
            <a href={image.creditUrl} rel="noopener noreferrer" target="_blank">
              {image.credit}
            </a>
          ) : (
            image.credit
          )}
        </figcaption>
      ) : null}
    </figure>
  )
}

function Landscape() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e7cf" />
          <stop offset="0.55" stopColor="#f3d3b0" />
          <stop offset="1" stopColor="#e9c49c" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc3bf" />
          <stop offset="1" stopColor="#6f9f9a" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#sky)" />
      <circle cx="590" cy="190" r="70" fill="#f9efe0" opacity="0.9" />
      <path d="M0 330 L800 300 L800 500 L0 500 Z" fill="url(#sea)" />
      <path d="M0 300 C120 250 210 270 300 300 L300 500 L0 500 Z" fill="#c98f5f" />
      <path d="M0 340 C90 300 180 320 260 360 L260 500 L0 500 Z" fill="#a8704a" />
      <path d="M520 360 C600 330 700 340 800 320 L800 500 L520 500 Z" fill="#7d9a6c" />
      <path d="M0 420 C200 390 420 430 800 400 L800 500 L0 500 Z" fill="#5f7f55" />
      <rect x="560" y="300" width="18" height="40" rx="6" fill="#b07a52" />
      <rect x="600" y="296" width="12" height="34" rx="5" fill="#c08a60" />
    </svg>
  )
}
