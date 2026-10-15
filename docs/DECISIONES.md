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

## 2026-10-15 · Rediseño visual (entrega 1.5)

**D12. Dirección visual a partir de los bocetos de Erik**, quitando lo que contradice el brief: cifras inventadas («50+ países», «10K+»), porcentajes de compatibilidad, fechas de verificación ficticias, botones de funciones inexistentes (login, comparar, guardar plan, premium), la vista interna de arquitectura y la interfaz en inglés.

**D13. Imágenes en `public/images/`, no en un servicio de almacenamiento.** El CMS guarda la ruta, el texto alternativo y el crédito/licencia (obligatorios si hay imagen). Sin imagen se muestra una ilustración SVG propia; las tarjetas de guía sin foto no llevan imagen.

**D14. Tipografía Plus Jakarta Sans servida desde el propio proyecto** (`@fontsource-variable/plus-jakarta-sans` 5.3.0), sin peticiones a Google Fonts. Iconos con `lucide-react` 1.55.0 (fijada; versiones de menos de un día las bloquea pnpm 11+).

**D15. «Datos rápidos» del país como lista editable en el CMS** (icono, etiqueta, valor, fuente opcional). Solo datos estables; nada de población u otras cifras cambiantes sin fuente.

## 2026-10-15 · Documento maestro: Fase 0 y Fase 2

**D16. `PROJECT_STATUS.md` en la raíz es el documento de estado** (sustituye a `docs/ESTADO.md`).

**D17. Estado editorial de 5 valores derivado, no un campo más que mantener.** Se calcula a partir de: `archived`, `verification.reviewStatus`, `_status` (borrador/publicado de Payload) y `reviewRequested`. Así no puede contradecir a la publicación real.

**D18. Panel de revisión como componente de la portada de `/admin`** (no una app aparte). Prioridad pura y testeada en `src/lib/review.ts`.

**D19. Oportunidades: cuatro tipos de señal que no se mezclan** (lista oficial, escasez documentada, vacantes actuales, referencia salarial). La «facilidad de acceso» no se guarda: depende de la persona y la calculará el análisis.

**D20. Sin Tailwind, sin renombrar `pathways`, sin búsqueda vectorial por ahora.** Ver PROJECT_STATUS §2.

**D21. Payload no valida campos obligatorios en borradores.** Las garantías (fuente obligatoria en señales y costes) se cumplen al publicar. Probado.

## 2026-10-15 · Fase 3

**D22. El resultado gratuito se calcula en el navegador.** El servidor solo envía conocimiento público (requisitos publicados, oportunidades, guías). Las respuestas no salen del dispositivo: privacidad por diseño, sin coste de servidor, sin cuenta. El informe premium sí será de servidor (Fase 4).

**D23. Sin conversión de moneda inventada.** Los ahorros se piden en euros; solo se comparan con un requisito en otra moneda si hay un tipo de cambio con fuente y fecha en el global «Datos económicos». Si no, «falta comprobar».

**D24. Las oportunidades se muestran solo con motivos explícitos** (tu sector, sectores de interés, experiencia cercana) y se ordenan por número de motivos, nunca con una puntuación.

**D25. Prueba e2e con Playwright** (`pnpm test:e2e`) sobre la demo: recorrido completo en escritorio y móvil.

**D26. Zod 4.6.5** para validar el perfil (fijada; pnpm 11+ bloquea versiones de menos de un día).
