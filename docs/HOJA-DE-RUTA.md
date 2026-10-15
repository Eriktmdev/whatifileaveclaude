# Hoja de ruta

Principio general: **pocas piezas**. Cada fase añade solo lo que la siguiente prueba con usuarios necesita.

## Entrega 1 — Hecho
Inicio → hub de Australia → guía gestionada desde el CMS. Modelo de conocimiento con verificación y dependencias.

## Entrega 1.5 — Hecho
Rediseño visual de inicio, hub y guía según los bocetos (sin cifras ni funciones inventadas).

## Entrega 2 — Siguiente: herramienta «Explora tus opciones»
- Formulario en pasos cortos, sin cuenta, sin guardar respuestas en servidor ni enviarlas a analítica.
- Preguntas generadas a partir de los requisitos publicados con regla (`rule.mode = rule | self_declared`).
- Respuestas posibles: valor / «No lo sé». «No lo sé» ≠ «No cumplo».
- Motor de reglas puro en `src/lib/` (sin IA), con pruebas en los límites (18, 30, 30 y 1 día, importes exactos…).
- Resultados en cuatro grupos: coincide · parece no coincidir · falta comprobar · no lo evalúa la herramienta. Sin porcentajes.
- Siguientes pasos enlazados a guías.

## Más adelante (documentado, NO implementado)

### Monitorización de cambios en fuentes
Un proceso programado descarga las fuentes oficiales y compara con la última copia. Si cambia, **crea una tarea de revisión** (marca la fuente como «Necesita revisión» y deja la diferencia en la nota). Nunca publica ni modifica requisitos. El mecanismo de dependencias ya existe: al marcar la fuente, todo lo que depende de ella pasa a revisión.

### Cola de revisión editorial
Vista en el CMS con todo lo «Necesita revisión» o «Comprobado hace más de 180 días», ordenado por impacto (número de guías afectadas).

### Investigación personalizada (premium)
Informe que cruza experiencia y tareas reales, formación, idiomas, presupuesto, plazos, vías, mercado laboral documentado, zonas, barreras y cambios recientes. La IA **sintetiza y explica evidencia registrada en la base**, citándola; no inventa requisitos ni decide elegibilidad (eso lo hacen las reglas verificadas). Cada conclusión con su porqué y su fuente.

### Preguntas sobre el informe
Chat acotado al informe del usuario y a las fuentes registradas.

### Planes guardados y alertas
Requiere cuentas de usuario final. Alertas cuando cambie un requisito de una vía guardada (reutiliza las dependencias).

### Pagos
Modalidad sin decidir (pago único por informe, suscripción…). Se valida con uso real antes de construir.

### Otros países y perfiles
El modelo ya separa país, vía, pasaporte y ámbito. Añadir un país = crear su registro y contenido. Añadir un pasaporte = ampliar `src/lib/passports.ts`.
