# PROJECT_STATUS — WhatIfILeave

_Estado real del proyecto. Se actualiza al cerrar cada fase. Última actualización: 2026-10-15 (Fase 3 cerrada)._

## ▶ Siguiente paso

**Fase 4 (motor premium)** necesita una decisión de Erik: qué proveedor de IA usar y con qué presupuesto mensual. Sin eso se puede construir todo lo determinista (cálculos económicos con escenarios, recuperación de conocimiento con citas, comparador de estrategias, hoja de ruta) y dejar la IA en modo demo etiquetado.

**En paralelo (tarea de Erik):** verificar las fuentes oficiales del visado 462 y convertir la demo en contenido real.

> Regla: nada se marca como hecho si solo existe la interfaz. «Hecho» = funciona, tiene pruebas cuando aplica y está documentado.

---

## 1. Resumen en 30 segundos

| Bloque | Estado |
| --- | --- |
| Fase 0 · Auditoría | ✅ Hecha (este documento) |
| Fase 1 · Fundación técnica | ✅ Hecha |
| Fase 2 · Plataforma editorial | ✅ Hecha (con contenido demo; falta contenido verificado) |
| Fase 3 · Cuestionario y resultado gratuito | ✅ Hecha (sobre contenido demo) |
| Fase 4 · Motor premium | ⬜ Pendiente — necesita proveedor de IA (coste → aprobación de Erik) |
| Fase 5 · Pagos (Stripe) | ⬜ Pendiente — necesita cuenta Stripe en modo prueba (aprobación de Erik) |
| Fase 6 · Cuenta y seguimiento | ⬜ Pendiente |
| Fase 7 · Automatización y calidad | ⬜ Pendiente |
| Fase 8 · Lanzamiento | ⬜ Pendiente — hosting y dominio implican coste (aprobación de Erik) |

**Hitos de negocio**

- **MVP publicable** = Fases 1–3 ✅ + **contenido verificado de Australia (pendiente: tarea editorial)** + aviso legal/privacidad + despliegue.
- **MVP monetizable** = + Fases 4–5.
- **Producto evolucionado** = + Fases 6–7.

---

## 2. Auditoría (Fase 0)

### Lo que ya funciona

- **Stack**: Next.js 16.3.3 + Payload 3.90.2 + PostgreSQL, una sola app (`/` y `/admin`). TypeScript estricto. pnpm 10 y 11+.
- **Modelo de conocimiento**: Países, Vías de estancia (`pathways`), Requisitos (con regla estructurada para evaluación), Fuentes, Guías, Equipo (roles admin/editor).
- **Rigor editorial**: verificación ≠ edición; no se publica contenido real sin «Verificado» + fecha + fuente; dependencias Fuente → Requisito/Vía → Guía marcan «Necesita revisión»; borradores con vista previa; contenido demo aislado (`isDemo`, oculto con `SHOW_DEMO_CONTENT=false`, `noindex`).
- **Web pública**: inicio, hub `/australia`, guías `/australia/guias/[slug]` con índice, puntos clave, fichas de requisitos y fuentes. Diseño responsive, tipografía local, iconos, imágenes con crédito.
- **SEO base**: metadatos, canonical, Open Graph, sitemap, robots, migas con JSON-LD.
- **Calidad**: 32 pruebas (unidad + integración con BD), lint, typecheck, build, migraciones verificadas sobre base vacía.

### Lo que falta respecto al documento maestro

| Área | Falta |
| --- | --- |
| CMS | Regiones, Oportunidades, campos ampliados de vías (ventajas, restricciones, límites, organismos, costes) y requisitos (tipo, volatilidad); estados «Pendiente de revisión» y «Archivado»; panel de revisión («qué, por qué, desde cuándo, qué depende»); portada configurable; FAQ en guías |
| Web | Páginas de vías, regiones y sectores en el hub; FAQ; CTA al análisis; explorador de oportunidades; comparador de estrategias |
| Producto | Cuestionario, resultado gratuito, informe premium, pagos, cuentas, exportación |
| Plataforma | Analítica mínima sin datos personales, rate limiting, política de privacidad/cookies, n8n, despliegue |

### Decisiones y posibles bloqueos

1. **Tailwind**: no se adopta. Ya hay un sistema CSS propio con variables; migrar sería reescribir sin beneficio para el usuario. Se puede reconsiderar.
2. **«MigrationRoutes»** se mantiene como la colección `pathways` (etiqueta «Vías migratorias»). Renombrar la tabla no aporta valor y arriesga datos.
3. **Búsqueda semántica / vectores**: no por ahora. Primero recuperación estructurada (relaciones + filtros en PostgreSQL). `pgvector` solo si las pruebas del motor premium lo justifican.
4. **IA (Fase 4)**: se implementará un adaptador con modo «demo» claramente etiquetado. Conectar un proveedor real implica coste por uso → **requiere aprobación**.
5. **Stripe (Fase 5)**: requiere que Erik cree una cuenta (gratuita) y pase claves de prueba. Nunca se marcará un pago por la redirección del navegador: solo por webhook verificado.
6. **Datos sin verificar**: este entorno de desarrollo no puede abrir webs oficiales australianas. Todo el contenido actual es demo. **Publicar contenido real requiere que Erik verifique las fuentes.**
7. **Privacidad**: el cuestionario gratuito no guardará respuestas en servidor; se calcula sin persistir y el progreso se guarda solo en el navegador.

---

## 3. Arquitectura modular (monolito)

```
src/
  collections/   Modelo de contenido (Payload)
  globals/       Configuración editorial (portada)
  fields/        Campos compartidos (verificación, editorial, imagen, slug)
  hooks/         Reglas editoriales, dependencias, revalidación
  lib/           Lógica pura y testeable (verificación, reglas, cálculos) + acceso a datos
  components/    UI pública
  admin/         Componentes del panel (revisión editorial)
  app/(frontend) Web pública
  app/(payload)  Panel y API de Payload
```

Fuente de verdad: PostgreSQL vía Payload. Reglas deterministas en `src/lib`. La IA (futura) solo interpretará datos ya recuperados y citados.

---

## 4. Backlog priorizado

### Fase 2 · Plataforma editorial ✅
- [x] Estados editoriales: Borrador · Pendiente de revisión · Publicado · Necesita revisión · Archivado (columna «Estado editorial» en las listas)
- [x] «En revisión desde» + panel «Revisión editorial» en la portada de `/admin` (qué, por qué, desde cuándo, cuántos contenidos dependen, última verificación y quién, enlace al historial de cambios)
- [x] «Última edición por» guardado en cada versión
- [x] Vías: ventajas, restricciones, límites, organismos oficiales, costes (solo con fuente)
- [x] Requisitos: tipo y volatilidad (aviso público si es alta)
- [x] Fuentes: fecha de publicación y de primera consulta; «usada en» vías y oportunidades
- [x] Colecciones Regiones y Oportunidades (señales de mercado separadas por tipo, siempre con fuente y fecha)
- [x] Guías: preguntas frecuentes (JSON-LD FAQPage) y guías relacionadas
- [x] Páginas públicas de vías: `/australia/vias/[slug]` (también en el sitemap)
- [x] Hub: vías, regiones, profesiones y sectores, fuentes oficiales, fecha de última verificación
- [x] Portada configurable desde el CMS (global «Portada»: título, subtítulo, guías destacadas, FAQ) + secciones: cómo funciona, destino, rutas, temas, artículos, gratis vs. análisis personalizado, confianza, FAQ
- [x] 47 pruebas (unidad + integración)
- [ ] Contenido real verificado (tarea editorial de Erik)
- [ ] Páginas individuales de región y de oportunidad (cuando haya contenido que lo justifique)

### Fase 3 · Cuestionario y resultado gratuito ✅
- [x] Cuestionario en 8 pasos cortos (`/analisis`): barra de progreso, «por qué lo preguntamos», «No lo sé», resumen editable, foco accesible al cambiar de paso
- [x] Sin cuenta y sin servidor: el perfil vive en el navegador (localStorage) y el resultado se calcula ahí. Botón «Borrar mis respuestas»
- [x] Perfil validado con Zod (`src/lib/profile.ts`); pasaporte, residencia e idioma por separado
- [x] Motor de reglas determinista (`src/lib/evaluation.ts`): coincide · parece no coincidir · falta comprobar · no evaluado; sin porcentajes
- [x] Comprobaciones «sí / no / no lo sé» generadas desde los requisitos del CMS
- [x] Conversión de moneda solo con tipo de cambio con fuente (global «Datos económicos»); si no hay, «falta comprobar»
- [x] Resultado gratuito (`/analisis/resultado`): perfil, 3 pasos, vías, oportunidades con su porqué, obstáculos, estimación económica honesta, lo que falta, guías, qué aportaría el análisis personalizado
- [x] Explorador de oportunidades (`/australia/oportunidades`) con filtros que explican por qué aparece cada resultado
- [x] Botones «Analizar mi situación» en portada, cabecera, hub, vías y guías
- [x] Perfil de ejemplo ficticio (24 años, soporte técnico, 7.000 €) para demostraciones
- [x] 67 pruebas unitarias/integración + prueba e2e del recorrido completo (escritorio y móvil)
- [ ] Estimación económica real: necesita datos de costes verificados (alquiler, transporte, impuestos)

### Fase 4 · Motor premium
- [ ] Perfil estructurado (Zod) y recuperación de conocimiento con citas
- [ ] Cálculos económicos deterministas con escenarios
- [ ] Adaptador de IA (modo demo etiquetado) + validación de esquemas + verificación de citas
- [ ] Informe versionado, comparador de estrategias, hoja de ruta, preguntas abiertas

### Fase 5 · Pagos
- [ ] Stripe Checkout (prueba), webhook verificado, control de acceso al informe, registro

### Fase 6 · Cuenta
- [ ] Autenticación de usuarios finales, perfiles e informes guardados, hitos, exportación, borrado de datos

### Fase 7 · Automatización y calidad
- [ ] Endpoints para n8n (cambios de fuentes → tareas de revisión), enlaces rotos, rate limiting, analítica mínima, e2e

### Fase 8 · Lanzamiento
- [ ] Hosting, base gestionada, dominio, copias de seguridad, monitorización, checklist legal

---

## 5. Registro de fases cerradas

- **2026-10-14 · Entrega 1** — CMS de conocimiento, hub, guía. (Fase 1 + parte de Fase 2)
- **2026-10-15 · Entrega 1.5** — Rediseño visual e imágenes.
- **2026-10-15 · Fase 0 + Fase 2** — Auditoría, flujo editorial de 5 estados, panel de revisión, Regiones, Oportunidades, páginas de vías, portada configurable.
- **2026-10-15 · Fase 3** — Cuestionario, motor de reglas, resultado gratuito, explorador de oportunidades, prueba e2e.

Decisiones detalladas: [`docs/DECISIONES.md`](docs/DECISIONES.md).
