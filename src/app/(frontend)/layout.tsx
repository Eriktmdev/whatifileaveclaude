import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import React from 'react'

import { siteUrl } from '@/lib/site'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'WhatIfILeave · Entiende tus opciones para vivir en otro país',
    template: '%s · WhatIfILeave',
  },
  description:
    'Guías claras sobre visados, trabajo, vivienda y dinero para vivir en otro país, con fuentes oficiales y fecha de comprobación.',
  openGraph: { siteName: 'WhatIfILeave', locale: 'es_ES', type: 'website' },
}

export const viewport: Viewport = { themeColor: '#faf8f3' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              WhatIf<span>I</span>Leave
            </Link>
            <nav aria-label="Principal" className="site-nav">
              <Link href="/australia">Australia</Link>
            </nav>
          </div>
        </header>
        <main id="contenido">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>
              WhatIfILeave ofrece información general para ayudarte a entender tus opciones. No es
              asesoramiento legal ni migratorio: la decisión sobre un visado la toma siempre la
              administración del país. Comprueba cada requisito en la fuente oficial enlazada.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
