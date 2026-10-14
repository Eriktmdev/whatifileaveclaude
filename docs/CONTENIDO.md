# Modelo de conocimiento y flujo editorial

## Idea central

Cada dato vive **en un solo sitio**. Las guías y la herramienta leen de ahí.

```
Fuente ──citada por──▶ Requisito ──pertenece a──▶ Vía de estancia ──de──▶ País
   │                       │                            ▲
   └──citada por──▶ Guía ──┴──── relacionada con ───────┘
```

- La **guía** no copia requisitos: enlaza la vía y la página muestra sus requisitos publicados desde la colección.
- El **requisito** guarda su valor en la **regla** (p. ej. edad mín. 18 / máx. 30). El texto usa marcadores: `Tener entre {min} y {max} años`. Si cambias el número, cambia en todas partes.

## Campos de control (en Vías, Requisitos, Guías y Fuentes)

| Campo | Significado |
| --- | --- |
| Estado de verificación | `Sin verificar` / `Verificado` / `Necesita revisión` |
| Fecha real de comprobación | Día en que una persona abrió la fuente y confirmó el dato. **No** la fecha de edición |
| Comprobado por | Quién lo hizo |
| Vigente desde / hasta | Para importes o reglas con fecha (p. ej. año fiscal). Fuera de vigencia, un requisito no se muestra |
| Nota de revisión | Interna. Qué falta o qué cambió. Los avisos automáticos se añaden aquí |
| Contenido de demostración | Datos de ejemplo. Nunca son evidencia |
| Estado editorial | Borrador / Publicado (botones de Payload) |

Ámbito de un requisito: **pasaportes** a los que aplica (nacionalidad) + nota libre. País de residencia e idioma son otra cosa y se tratarán como criterios distintos.

## Tipos de fuente

Para **requisitos**: fuentes oficiales (gobierno). Para **empleo o costes**, cualquier tipo, pero rellena siempre «Naturaleza y limitaciones»: qué mide, de cuándo es y qué no permite concluir. Una escasez de trabajadores no garantiza empleo, patrocinio ni visado.

## Flujo para publicar un requisito real

1. **Fuentes → Crear.** Título, organismo, tipo, URL. Abre la URL, comprueba, rellena «Fecha real de comprobación», estado «Verificado», notas internas con lo que viste.
2. **Requisitos → Crear.** Vía, enunciado con marcadores, regla (modo, criterio, valores), fuentes.
3. Rellena la verificación del requisito y pulsa **Publicar**. Si falta algo, el sistema te dice qué.
4. Revisa la guía que trata esa vía (Vista previa).

## Flujo para una guía

1. Crear como borrador. Resumen (2–3 frases), 3–5 puntos clave, texto.
2. Relacionar vías (los requisitos aparecen solos) y fuentes.
3. «Vista previa» para verla como en la web.
4. Verificar y publicar.

## Cuando algo pasa a «Necesita revisión»

1. Filtra en el CMS por estado de verificación = «Necesita revisión».
2. Lee la nota de revisión: indica qué lo provocó.
3. Comprueba la fuente, corrige si hace falta, actualiza la fecha de comprobación y vuelve a «Verificado».

La web muestra un aviso en las guías en revisión; no se despublican solas.

## Contenido de demostración

`pnpm seed` crea Australia, la vía 462, 8 requisitos, 2 guías y 2 fuentes, **todo como demo y sin verificar**. Las URLs apuntan a páginas oficiales del Department of Home Affairs pero **no se abrieron** al crearlas (el entorno de desarrollo no tenía acceso a esa web). Los valores (edad, fondos…) son orientativos y **deben comprobarse** antes de crear contenido real. No conviertas contenido demo en real: crea el real desde cero con su verificación.
