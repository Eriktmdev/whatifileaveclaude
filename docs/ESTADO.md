# Estado del proyecto

_Actualizado: 2026-10-15 (entrega 1.5: rediseño visual)._

## Qué funciona

- Inicio, hub `/australia` y guías `/australia/guias/[slug]`, en móvil y escritorio, con el diseño de los bocetos: imagen de cabecera (o ilustración), datos rápidos del país, temas con iconos, índice «En esta página», fichas de requisitos.
- CMS en `/admin` (en español) con Guías, Países, Vías, Requisitos, Fuentes y Equipo (roles admin/editor).
- Reglas editoriales: verificación, bloqueo de publicación, dependencias, borradores con vista previa.
- SEO básico: títulos, descripciones, canonical, sitemap, robots, migas con datos estructurados, `noindex` en demo.
- Imágenes: 4 generadas con IA (portada, Australia y las dos guías demo), acreditadas como «Imagen generada con IA». La portada está en código (`src/app/(frontend)/page.tsx`); el resto, en el CMS.
- 32 pruebas (`pnpm test`): reglas de verificación, publicación, acceso público y dependencias.
- Migración inicial en `src/migrations/`.

## Pendiente (por orden)

1. **Entrega 2: herramienta «Explora tus opciones»** (ver HOJA-DE-RUTA).
2. **Verificar las fuentes demo** y crear el primer contenido real (tarea de Erik: requiere abrir las webs oficiales).
3. Escribir las primeras guías reales (objetivo 15–25 en total, sin relleno).
4. **Decidir proveedor de despliegue** (implica coste mensual → decisión de Erik).
5. Página «Cómo trabajamos / metodología» y aviso legal/privacidad antes de publicar.
6. Revisión de accesibilidad con lector de pantalla.

## Avisos

- Los datos demo (edad 18–30, 5.000 AUD, etc.) **no están verificados**. Las URLs de Home Affairs no se pudieron abrir desde el entorno de desarrollo.
- En la base local de desarrollo existe un usuario de pruebas `admin@example.com` creado durante las comprobaciones. Bórralo o cambia su contraseña si reutilizas esa base.

## Siguiente paso

Construir la herramienta sobre la colección **Requisitos** (`rule.mode`, `rule.criterion`, `rule.min/max/values`), empezando por el motor de reglas en `src/lib/` con pruebas de límites.
