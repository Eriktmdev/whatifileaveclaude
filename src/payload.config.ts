import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Countries } from './collections/Countries'
import { Guides } from './collections/Guides'
import { Pathways } from './collections/Pathways'
import { Requirements } from './collections/Requirements'
import { Sources } from './collections/Sources'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('Falta PAYLOAD_SECRET')
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · WhatIfILeave CMS' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { es }, fallbackLanguage: 'es' },
  collections: [Guides, Countries, Pathways, Requirements, Sources, Users],
  editor: lexicalEditor(),
  graphQL: { disable: true },
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // En desarrollo Payload sincroniza el esquema solo; en producción se usan migraciones.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  telemetry: false,
})
