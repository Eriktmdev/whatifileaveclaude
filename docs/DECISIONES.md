# Registro de decisiones

Formato: fecha · decisión · por qué · coste o riesgo. Las reversibles se pueden cambiar sin drama.

## 2026-10-14 · Entrega 1

**D1. Next.js 16 + Payload CMS 3 + PostgreSQL en un único proyecto.**
Por qué: Payload 3 se instala dentro de la app Next.js, así que web, CMS y API son un solo despliegue. PostgreSQL es estándar, barato en servicios gestionados y sirve para datos relacionales (fuentes ↔ requisitos ↔ guías).
Versiones comprobadas en npm el 2026-10-14: `payload` 3.90.2 (latest), `@payloadcms/next` 3.90.2 exige `next >=16.3.3 <17`; se usa `next` 16.3.3 de la plantilla oficial `create-payload-app@3.90.2`.
Coste: un servidor Node + una base PostgreSQL. Payload 4 está en beta: no se adopta hasta que sea estable.

**D2. Sin Tailwind ni librería de componentes.** Una hoja CSS con variables. Menos dependencias, diseño sobrio. Tipografía del sistema (sin cargar fuentes externas).

**D3. Temas del hub fijos en código** (`src/lib/topics.ts`), no en el CMS. Cambian poco y forman parte de las URLs.

**D4. Requisitos como colección propia con «regla» estructurada.** El valor (p. ej. edad máxima) se guarda una vez en la regla; el texto usa `{min}`/`{max}`/`{values}`. Guías y herramienta leen lo mismo.

**D5. Verificación ≠ edición.** Bloque `verification` en vías, requisitos, guías y fuentes. Publicar contenido real exige «Verificado» + fecha + ≥1 fuente (validado en servidor, con pruebas).

**D6. Dependencias por hooks, no por servicio aparte.** Fuente a revisión → requisitos/vías/guías a revisión. Requisito publicado cambia → guías de su vía a revisión. Nunca despublica ni publica.

**D7. Contenido demo con bandera `isDemo`** en la misma base, oculto por `SHOW_DEMO_CONTENT=false`, con `noindex` y fuera del sitemap. Alternativa descartada: base separada (más piezas).

**D8. GraphQL desactivado y colección Media eliminada.** No se usan. Subir imágenes exigiría almacenamiento externo: se añadirá cuando haga falta.

**D9. Páginas de país y guía renderizadas en servidor por petición** (consultan `draftMode` para la vista previa). Suficiente para el volumen actual; si el tráfico crece se puede pasar a estático + revalidación.

**D10. Pruebas con Vitest** (unidad + integración contra una base `whatifileave_test`). Se eliminaron las pruebas e2e de la plantilla para no mantener dos herramientas; Playwright queda como dependencia de desarrollo para capturas.

**D11. Sin analítica de momento.** Cuando se añada, sin datos personales y sin respuestas de la herramienta.
