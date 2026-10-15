# WhatIfILeave — notas para sesiones de desarrollo

Lee primero `PROJECT_STATUS.md` (estado, backlog y siguiente paso) y `docs/DECISIONES.md`.

- Stack: Next.js 16 + Payload 3 + PostgreSQL, un solo proyecto. Idioma del producto y la documentación: español.
- Todo acceso a datos desde la web pública pasa por `src/lib/content.ts` (filtra publicado + demo).
- Lógica pura y testeable en `src/lib/`; reglas editoriales en `src/hooks/editorial.ts`.
- Tras cambiar colecciones: `pnpm generate:types` y `pnpm migrate:create <nombre>`.
- Antes de commit: `pnpm lint && pnpm typecheck && pnpm test`.
- No inventar datos, fuentes ni fechas de verificación. El contenido de ejemplo va con `isDemo: true`.
- El usuario (Erik) prefiere explicaciones en pasos cortos, separando lo necesario ahora de lo futuro.
