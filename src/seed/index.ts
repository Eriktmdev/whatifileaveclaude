/**
 * Datos de DEMOSTRACIÓN para desarrollo local.
 *
 * - Todo se crea con isDemo = true y estado «Sin verificar».
 * - Ninguna fecha de verificación se rellena: nadie ha comprobado aún estas fuentes.
 * - Los valores de los requisitos son orientativos y DEBEN contrastarse con la
 *   fuente oficial antes de crear contenido real.
 *
 * Uso: pnpm seed        (crea si no existe)
 *      pnpm seed:reset  (borra SOLO el contenido demo y lo vuelve a crear)
 */
import config from '@payload-config'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

const DEMO_NOTE =
  'Contenido demo creado por el script de seed. Fuente NO abierta durante la creación: comprobar URL y datos antes de usar.'

async function main() {
  const payload = await getPayload({ config })
  const reset = process.env.SEED_RESET === 'true'
  const ctx = { skipDependents: true }

  if (reset) {
    for (const collection of [
      'guides',
      'opportunities',
      'requirements',
      'pathways',
      'regions',
      'sources',
      'countries',
    ] as const) {
      const res = await payload.delete({
        collection,
        where: { isDemo: { equals: true } },
        context: ctx,
      })
      if (res.errors.length)
        throw new Error(`No se pudo borrar ${collection}: ${JSON.stringify(res.errors)}`)
      payload.logger.info(`Borrados ${res.docs.length} de ${collection}`)
    }
    payload.logger.info('Contenido demo borrado.')
  }

  const existing = await payload.count({
    collection: 'countries',
    where: { slug: { equals: 'australia' } },
  })
  if (existing.totalDocs > 0) {
    payload.logger.info('Ya existe Australia. Usa pnpm seed:reset para recrear el contenido demo.')
    process.exit(0)
  }

  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown })

  const unverified = { reviewStatus: 'unverified' as const, reviewNote: DEMO_NOTE }
  const base = { isDemo: true, _status: 'published' as const }

  const australia = await payload.create({
    collection: 'countries',
    context: ctx,
    data: {
      ...base,
      name: 'Australia',
      slug: 'australia',
      isoCode: 'AU',
      tagline: 'Visados, trabajo, vivienda y vida diaria, explicados con sus fuentes.',
      intro:
        'Empieza por entender qué vías de estancia existen y qué piden. Después, cómo se busca trabajo, cuánto cuesta empezar y cómo es el día a día.',
      heroImage: {
        src: '/images/australia/costa.webp',
        alt: 'Costa con playa de arena, acantilados ocres y vegetación autóctona al atardecer.',
        credit: 'Imagen generada con IA',
      },
      quickFacts: [
        { icon: 'capital', label: 'Capital', value: 'Canberra' },
        { icon: 'language', label: 'Idioma principal', value: 'Inglés' },
        { icon: 'currency', label: 'Moneda', value: 'Dólar australiano (AUD)' },
        {
          icon: 'time',
          label: 'Hora respecto a España',
          value: 'Por delante; varía según estado y época',
        },
      ],
      topicIntros: [
        {
          topic: 'visados',
          text: 'Qué vías existen para una persona con pasaporte español y qué requisitos tienen.',
        },
        { topic: 'preparacion', text: 'Lo que conviene resolver antes de solicitar nada.' },
      ],
    },
  })

  const srcVisa = await payload.create({
    collection: 'sources',
    context: ctx,
    data: {
      isDemo: true,
      title: 'Work and Holiday visa (subclass 462)',
      publisher: 'Department of Home Affairs (Gobierno de Australia)',
      kind: 'official_government',
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462',
      country: australia.id,
      limitations:
        'Página oficial de la vía. Los requisitos pueden variar según el pasaporte y cambian con el tiempo.',
      internalNotes: DEMO_NOTE,
      verification: unverified,
    },
  })

  const srcFirst = await payload.create({
    collection: 'sources',
    context: ctx,
    data: {
      isDemo: true,
      title: 'Work and Holiday visa (subclass 462) — First Work and Holiday visa',
      publisher: 'Department of Home Affairs (Gobierno de Australia)',
      kind: 'official_government',
      url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462/first-work-holiday-462',
      country: australia.id,
      limitations:
        'Detalle de requisitos para la primera solicitud. Revisar la sección específica de España.',
      internalNotes: DEMO_NOTE,
      verification: unverified,
    },
  })

  const sources = [srcVisa.id, srcFirst.id]

  const pathway = await payload.create({
    collection: 'pathways',
    context: ctx,
    data: {
      ...base,
      name: 'Visado de Trabajo y Vacaciones',
      slug: 'trabajo-y-vacaciones-462',
      officialName: 'Work and Holiday visa',
      officialCode: 'Subclase 462',
      country: australia.id,
      category: 'working_holiday',
      eligiblePassports: ['ES'],
      summary:
        'Permite pasar una temporada en Australia combinando viaje y trabajo temporal. Es una vía de estancia temporal, no de residencia permanente.',
      notCovered:
        'Segunda y tercera solicitud, requisitos de trabajo específico para renovar, y casos de personas con doble nacionalidad.',
      advantages: [
        { text: 'Permite viajar y trabajar de forma temporal.' },
        {
          text: 'Sirve para conocer el país y su mercado laboral antes de decidir algo a largo plazo.',
        },
      ],
      restrictions: [
        { text: 'Es temporal: no da residencia permanente.' },
        {
          text: 'Puede haber límites de tiempo trabajando para un mismo empleador (pendiente de verificar).',
        },
      ],
      limits:
        'Duración, cupos anuales y número de solicitudes posibles: pendientes de verificar en la fuente oficial.',
      officialBodies: [
        {
          name: 'Department of Home Affairs (Gobierno de Australia)',
          url: 'https://immi.homeaffairs.gov.au/',
        },
      ],
      sources,
      verification: unverified,
    },
  })

  const req = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'requirements',
      context: ctx,
      data: { ...base, pathway: pathway.id, sources, verification: unverified, ...data } as never,
    })

  await req({
    title: 'Edad',
    order: 10,
    volatility: 'medium',
    statement: 'Tener entre {min} y {max} años, ambos incluidos, cuando presentas la solicitud.',
    details:
      'Valor de demostración: el límite de edad depende del pasaporte. Confirmarlo en la fuente oficial.',
    scope: { passports: ['ES'] },
    rule: { mode: 'rule', criterion: 'age', operator: 'between', min: 18, max: 30, unit: 'años' },
  })
  await req({
    title: 'Pasaporte',
    order: 20,
    statement:
      'Tener un pasaporte válido de un país con acuerdo para esta vía. En este recorrido: {values}.',
    details: 'Lo que cuenta es la nacionalidad del pasaporte, no el país donde vives.',
    rule: { mode: 'rule', criterion: 'passport', operator: 'in', values: ['ES'] },
  })
  await req({
    title: 'Inglés funcional',
    order: 30,
    statement:
      'Poder acreditar un nivel de inglés funcional por alguno de los medios que acepta el Gobierno australiano.',
    details:
      'Valor de demostración: la lista de pruebas o certificados aceptados está pendiente de verificar.',
    rule: {
      mode: 'self_declared',
      question:
        '¿Puedes acreditar un nivel de inglés funcional con un certificado o prueba aceptados?',
    },
  })
  await req({
    title: 'Estudios',
    order: 40,
    statement: 'Cumplir el requisito de estudios que se exige a tu pasaporte.',
    details:
      'Valor de demostración: el nivel exacto exigido para pasaporte español está pendiente de verificar.',
    scope: { passports: ['ES'] },
    rule: {
      mode: 'self_declared',
      question: '¿Tienes el nivel de estudios que se exige para tu pasaporte?',
    },
  })
  await req({
    title: 'Fondos suficientes',
    order: 50,
    type: 'financial',
    volatility: 'high',
    statement: 'Disponer de al menos {min} AUD para mantenerte al principio de la estancia.',
    details:
      'Valor de demostración: importe orientativo pendiente de verificar. Puede pedirse además un billete de salida o fondos para comprarlo.',
    rule: { mode: 'rule', criterion: 'funds', operator: 'gte', min: 5000, unit: 'AUD' },
  })
  await req({
    title: 'Sin hijos a cargo durante la estancia',
    order: 60,
    statement: 'No viajar acompañado de hijos a cargo.',
    rule: { mode: 'rule', criterion: 'dependentChildren', operator: 'isFalse' },
  })
  await req({
    title: 'Salud y antecedentes',
    order: 70,
    type: 'health_character',
    volatility: 'low',
    statement:
      'Cumplir los requisitos de salud y de carácter (antecedentes) que establece el Gobierno australiano.',
    rule: { mode: 'not_evaluated' },
  })
  await req({
    title: 'Plazas limitadas',
    order: 80,
    type: 'quota',
    volatility: 'high',
    statement:
      'Las plazas para cada país pueden estar limitadas cada año. Que cumplas los requisitos no asegura una plaza.',
    rule: { mode: 'not_evaluated' },
  })

  const region = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'regions',
      context: ctx,
      data: { ...base, country: australia.id, verification: unverified, ...data } as never,
    })

  const wa = await region({
    name: 'Australia Occidental',
    slug: 'australia-occidental',
    mainCity: 'Perth',
    summary:
      'Estado muy extenso con un peso importante de la minería y los recursos. Fuera de Perth, muchas zonas son remotas.',
    characteristics: [
      { text: 'Gran parte del empleo en recursos está en zonas alejadas de la ciudad.' },
      { text: 'Las distancias son enormes: el transporte condiciona dónde puedes trabajar.' },
    ],
    mobility: 'Fuera del área metropolitana, normalmente hace falta coche.',
  })
  await region({
    name: 'Nueva Gales del Sur',
    slug: 'nueva-gales-del-sur',
    mainCity: 'Sídney',
    summary:
      'El estado más poblado. Mercado laboral amplio y diverso, con costes de vivienda que conviene estudiar bien.',
    characteristics: [{ text: 'Mucha oferta de servicios, tecnología y hostelería en la ciudad.' }],
  })
  await region({
    name: 'Queensland',
    slug: 'queensland',
    mainCity: 'Brisbane',
    summary: 'Clima más cálido y mucho turismo en la costa. Zonas agrícolas en el interior.',
    characteristics: [{ text: 'Turismo y hostelería con fuerte componente estacional.' }],
  })

  const opportunity = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'opportunities',
      context: ctx,
      data: {
        ...base,
        country: australia.id,
        verification: unverified,
        relatedPathways: [pathway.id],
        ...data,
      } as never,
    })

  await opportunity({
    title: 'Soporte TI en entornos industriales y de recursos',
    slug: 'soporte-ti-industrial',
    sector: 'mineria-energia',
    summary:
      'Puestos de soporte de sistemas, redes y comunicaciones en operaciones mineras, energéticas o industriales. Un camino poco conocido para perfiles de soporte técnico.',
    adjacentProfiles: ['soporte técnico', 'sistemas', 'redes', 'integraciones'],
    skills: ['Redes', 'Soporte a usuarios', 'Sistemas Windows/Linux'],
    entryRequirements:
      'Pendiente de verificar: certificaciones habituales del sector, requisitos de seguridad y experiencia previa.',
    barriers:
      'Suelen estar en zonas remotas y pueden exigir experiencia local o requisitos de seguridad laboral. Con un visado temporal puede haber límites de tiempo con un mismo empleador.',
    regions: [wa.id],
  })
  await opportunity({
    title: 'Hostelería y turismo de temporada',
    slug: 'hosteleria-turismo-temporada',
    sector: 'hosteleria-turismo',
    summary:
      'Trabajos de servicio en cafeterías, restaurantes y alojamientos, muy ligados a la temporada turística.',
    adjacentProfiles: ['atención al cliente', 'hostelería', 'comercio'],
    skills: ['Atención al cliente', 'Inglés conversacional'],
    entryRequirements:
      'Pendiente de verificar: certificaciones obligatorias según el estado para servir alcohol.',
    barriers: 'Alta competencia en temporada y horarios variables.',
  })
  await opportunity({
    title: 'Trabajo agrícola estacional',
    slug: 'trabajo-agricola-estacional',
    sector: 'agricultura',
    summary: 'Recolección y tareas de campo en zonas rurales, según campaña.',
    adjacentProfiles: ['trabajo físico', 'sin experiencia específica'],
    barriers:
      'Ubicaciones rurales, alojamiento y transporte propios, condiciones físicas exigentes.',
  })

  const guideVisa = await payload.create({
    collection: 'guides',
    context: ctx,
    data: {
      ...base,
      title: 'Visado de Trabajo y Vacaciones (462) con pasaporte español',
      faqs: [
        {
          question: '¿Tener el visado garantiza encontrar trabajo?',
          answer:
            'No. El visado te permite trabajar, pero encontrar empleo depende del mercado, de tu perfil y de dónde busques.',
        },
        {
          question: '¿Cuenta dónde vivo ahora o solo mi pasaporte?',
          answer:
            'Los requisitos de esta vía dependen sobre todo de la nacionalidad de tu pasaporte. Comprueba en la fuente oficial si hay condiciones adicionales para tu caso.',
        },
        {
          question: '¿Cuánto cuesta solicitarlo?',
          answer:
            'No mostramos importes hasta verificarlos en la fuente oficial. Consulta la página del Department of Home Affairs.',
        },
      ],
      slug: 'visado-trabajo-y-vacaciones-462',
      country: australia.id,
      topic: 'visados',
      image: {
        src: '/images/guias/escritorio-pasaporte.webp',
        alt: 'Mesa de madera junto a una ventana con un pasaporte cerrado, una libreta, un portátil y una taza.',
        credit: 'Imagen generada con IA',
      },
      summary:
        'Es una vía para pasar una temporada en Australia con pasaporte español. Permite viajar y trabajar de forma temporal, pero no garantiza empleo ni es una vía de residencia permanente.',
      keyPoints: [
        {
          text: 'Es un visado temporal: sirve para conocer el país, no para quedarse de forma indefinida.',
        },
        {
          text: 'Los requisitos dependen de tu pasaporte, no de dónde vives ni del idioma que hablas.',
        },
        {
          text: 'Cumplir los requisitos no asegura una plaza: puede haber un número limitado cada año.',
        },
        { text: 'Comprueba siempre la página oficial antes de presentar la solicitud.' },
      ],
      body: md(`## Qué es

El visado de Trabajo y Vacaciones permite a personas jóvenes de algunos países pasar una temporada en Australia combinando viaje y trabajo temporal. España es uno de esos países.

## Para quién puede tener sentido

- Si quieres conocer el país y su mercado laboral antes de plantearte algo a largo plazo.
- Si te encaja trabajar en empleos temporales mientras te orientas.
- Si cumples los requisitos de edad de tu pasaporte y puedes reunir los fondos iniciales.

## Lo que no es

No es una vía de residencia permanente ni una oferta de trabajo. Tener el visado no garantiza encontrar empleo ni que una empresa te patrocine después.

## Cómo leer los requisitos de esta página

Los requisitos de abajo se gestionan en un único lugar de nuestra base de conocimiento y muestran su fuente. Si un requisito aparece como «Sin verificar», todavía no lo hemos contrastado con la fuente oficial.`),
      relatedPathways: [pathway.id],
      sources,
      verification: unverified,
    },
  })

  const guidePrep = await payload.create({
    collection: 'guides',
    context: ctx,
    data: {
      ...base,
      title: 'Qué preparar antes de solicitar el visado 462',
      relatedGuides: [guideVisa.id],
      slug: 'preparar-solicitud-visado-462',
      country: australia.id,
      topic: 'preparacion',
      image: {
        src: '/images/guias/mochila-preparada.webp',
        alt: 'Mochila de viaje a medio hacer sobre una cama, con ropa doblada, zapatillas y una toalla de playa.',
        credit: 'Imagen generada con IA',
      },
      summary:
        'Antes de solicitar conviene reunir la documentación que acredita cada requisito y revisar los que todavía no tienes claros.',
      keyPoints: [
        { text: 'Revisa la lista de requisitos y marca los que aún no puedes acreditar.' },
        {
          text: 'Si no sabes si cumples algo, compruébalo en la fuente oficial antes de pagar ninguna tasa.',
        },
      ],
      body: md(`## Antes de empezar

Lee la ficha oficial completa. Nuestra guía resume y ordena, pero la decisión la toma la administración australiana.

## Reúne la documentación

Para cada requisito, piensa qué documento lo demuestra: pasaporte en vigor, acreditación de idioma, títulos de estudios y extractos bancarios.

## Lo que no sabes también cuenta

Si dudas de si cumples un requisito, anótalo como pendiente. Es mejor resolverlo antes que descubrirlo con la solicitud ya enviada.`),
      relatedPathways: [pathway.id],
      sources: [srcVisa.id],
      verification: unverified,
    },
  })

  await payload.update({
    collection: 'guides',
    id: guideVisa.id,
    data: { relatedGuides: [guidePrep.id] },
    context: ctx,
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroTitle: '¿Y si te fueras?',
      heroSubtitle:
        'Descubre oportunidades reales para vivir y trabajar fuera, entiende qué te pedirían y convierte la idea en un plan.',
      featuredGuides: [guideVisa.id, guidePrep.id],
      faqs: [
        {
          question: '¿WhatIfILeave sustituye a un agente o abogado de inmigración?',
          answer:
            'No. Te ayudamos a entender tus opciones y a prepararte con información y fuentes oficiales. La decisión sobre un visado la toma siempre la administración del país.',
        },
        {
          question: '¿De dónde sale la información?',
          answer:
            'Los requisitos salen de fuentes oficiales enlazadas en cada página, con la fecha en que una persona los comprobó. Si algo no está verificado, lo indicamos.',
        },
        {
          question: '¿Tengo que crear una cuenta?',
          answer: 'No. Las guías y las herramientas gratuitas funcionan sin cuenta.',
        },
      ],
    },
  })

  payload.logger.info(
    'Contenido demo creado: Australia, 3 regiones, 1 vía, 8 requisitos, 3 oportunidades, 2 guías, 2 fuentes y portada.',
  )
  process.exit(0)
}

// `payload run` termina al acabar de evaluar el módulo: hay que esperar aquí.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
