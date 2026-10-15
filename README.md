# WhatIfILeave

Web para pasar de «me gustaría irme a vivir a otro país» a «entiendo mis opciones, qué encaja con mi perfil, qué me falta y cómo prepararme».

Primera versión: **Australia**, contenido en español, primer recorrido para personas con **pasaporte español**.

Un solo proyecto: **Next.js 16 + Payload CMS 3 + PostgreSQL**. La web pública y el panel de edición (`/admin`) viven en la misma aplicación.

---

## 1. Puesta en marcha en local

Necesitas **Node.js 20.18 o superior**, **pnpm** y **PostgreSQL 16** (instalado o con Docker).

```bash
# 1. Dependencias
pnpm install

# 2. Base de datos (si usas Docker; si tienes PostgreSQL instalado, crea
#    las bases «whatifileave» y «whatifileave_test» con el usuario «wil»)
docker compose up -d

# 3. Variables de entorno
cp .env.example .env        # y edita PAYLOAD_SECRET

# 4. Datos de demostración (opcional, recomendable la primera vez)
pnpm seed

# 5. Arrancar
pnpm dev
```

- Web: http://localhost:3000
- CMS: http://localhost:3000/admin → la primera vez te pide crear tu usuario. **La primera persona registrada es administradora.**

En desarrollo, Payload adapta la base de datos automáticamente al modelo. En producción se usan migraciones (ver §5).

## 2. Variables de entorno

| Variable | Para qué | Ejemplo local |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgres://wil:wil@localhost:5432/whatifileave` |
| `PAYLOAD_SECRET` | Firma las sesiones del CMS. Largo y aleatorio. **Nunca** en el repositorio | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | URL pública (canonical, sitemap). Sin barra final | `http://localhost:3000` |
| `SHOW_DEMO_CONTENT` | `true` muestra el contenido de demostración. **En producción: `false`** | `true` |
| `TEST_DATABASE_URL` | Opcional. Base para las pruebas. Por defecto `whatifileave_test` local | — |

`.env` está en `.gitignore`. Las credenciales solo se usan en el servidor; ninguna variable sin el prefijo `NEXT_PUBLIC_` llega al navegador.

## 3. Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm seed` | Crea el contenido de demostración si no existe |
| `pnpm seed:reset` | Borra **solo** el contenido marcado como demo y lo vuelve a crear |
| `pnpm test` | Pruebas unitarias e integración (necesita la base `whatifileave_test`) |
| `pnpm test:e2e` | Recorrido completo en el navegador (necesita `pnpm seed`; arranca `pnpm dev` si no está en marcha) |
| `pnpm lint` / `pnpm typecheck` | Revisión de código y tipos |
| `pnpm build` / `pnpm start` | Compilar y arrancar en modo producción |
| `pnpm generate:types` | Regenera `src/payload-types.ts` tras cambiar colecciones |
| `pnpm migrate:create nombre` | Crea una migración tras cambiar colecciones |
| `pnpm migrate` | Aplica migraciones pendientes |

## 4. Gestión de contenido

Resumen; el detalle está en [`docs/CONTENIDO.md`](docs/CONTENIDO.md).

**Qué hay en el CMS**

- **Guías** — los artículos. Resumen, puntos clave, texto, vías relacionadas y fuentes.
- **Países** — cada destino y su hub.
- **Vías de estancia** — visados u otras vías (p. ej. Trabajo y Vacaciones 462).
- **Requisitos** — cada requisito de una vía, **escrito una sola vez**. Las guías lo muestran automáticamente y la futura herramienta lo evaluará con su regla.
- **Regiones** y **Oportunidades** — zonas del país y profesiones con señales de mercado (cada una con fuente y fecha).
- **Portada** (global) — título, subtítulo, guías destacadas y preguntas frecuentes.
- **Panel de revisión** — en la portada de `/admin`: lo que necesita revisión, por qué, desde cuándo y qué depende de ello.
- **Fuentes** — cada fuente se registra una vez y se cita desde requisitos, vías y guías.

**Reglas que aplica el sistema**

1. **Editar ≠ verificar.** «Editado el…» lo pone el sistema. «Fecha real de comprobación» la escribes tú solo cuando has abierto la fuente y confirmado el dato.
2. **No se puede publicar** contenido real si no está «Verificado», con fecha de comprobación y al menos una fuente.
3. **No se puede marcar «Verificado»** sin fecha, ni con una fecha futura.
4. **Dependencias:** si una fuente pasa a «Necesita revisión» o cambia de URL, sus requisitos, vías y guías pasan también a «Necesita revisión». Si cambia un requisito publicado, las guías de su vía también. Nada se despublica ni se publica solo: la web muestra un aviso de revisión.
5. **Borradores** solo visibles para el equipo. Botón «Vista previa» en cada guía.
6. **Demo:** todo lo marcado como «Contenido de demostración» se oculta en la web si `SHOW_DEMO_CONTENT=false` y nunca va al sitemap.

## 4b. Cuestionario y resultado gratuito

- `/analisis` → 8 pasos cortos. `/analisis/resultado` → resultado.
- Las respuestas se guardan **solo en el navegador** y el resultado se calcula ahí con los requisitos publicados.
- Lo que el cuestionario sabe evaluar sale del CMS: en cada **Requisito**, el bloque «Regla para la herramienta» (regla automática, «la persona lo confirma» con su pregunta, o «no lo evalúa»).
- Para comparar ahorros en euros con un requisito en AUD hace falta un **tipo de cambio con fuente** en «Datos económicos». Sin él, el resultado dice «falta comprobar».
- «Usar un perfil de ejemplo» carga un perfil ficticio para demostraciones.

## 5. Despliegue

Hace falta: **un servidor Node.js** que ejecute la app y **una base PostgreSQL gestionada**. Nada más (sin colas, sin almacenamiento de ficheros: de momento no hay subida de imágenes).

Pasos genéricos para cualquier proveedor:

1. Crear la base PostgreSQL y copiar su URL a `DATABASE_URL`.
2. Definir `PAYLOAD_SECRET` (nuevo, distinto del local), `NEXT_PUBLIC_SITE_URL` con el dominio y `SHOW_DEMO_CONTENT=false`.
3. Comando de build: `pnpm ci` (aplica migraciones y compila). Comando de arranque: `pnpm start`.
4. Abrir `/admin` y crear la cuenta de administración **en cuanto despliegues** (la primera persona registrada es admin).

Elegir proveedor implica coste mensual: está en [`PROJECT_STATUS.md`](PROJECT_STATUS.md) como decisión pendiente.

## 6. Estructura

```
src/
  app/(frontend)/      Web pública: inicio, /[pais], /[pais]/guias/[slug], vista previa
  app/(payload)/       Panel /admin y API (generado por Payload, no tocar)
  app/sitemap.ts, robots.ts
  collections/         Modelo de contenido (Guías, Países, Vías, Requisitos, Fuentes, Equipo)
  fields/              Campos compartidos: verificación, demo, slug
  hooks/               Reglas editoriales, dependencias, revalidación
  lib/                 Lógica pura (verificación, temas, criterios) y acceso a datos (content.ts)
  components/          Piezas de la web pública
  migrations/          Migraciones de base de datos
  seed/                Contenido de demostración
tests/                 Pruebas (unit + integración con base de datos)
docs/                  Decisiones, estado, contenido y hoja de ruta
```

## 7. Documentación

- [`PROJECT_STATUS.md`](PROJECT_STATUS.md) — estado real, backlog por fases y siguiente paso. **Empieza aquí al retomar.**
- [`docs/DECISIONES.md`](docs/DECISIONES.md) — registro de decisiones y por qué.
- [`docs/CONTENIDO.md`](docs/CONTENIDO.md) — modelo de conocimiento y flujo editorial.
- [`docs/HOJA-DE-RUTA.md`](docs/HOJA-DE-RUTA.md) — fases posteriores (sin implementar).
