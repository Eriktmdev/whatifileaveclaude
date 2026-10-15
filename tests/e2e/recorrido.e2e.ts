import { expect, test } from '@playwright/test'

/**
 * Recorrido del documento maestro (§19), con la demo:
 * portada → Australia → guía → cuestionario → resultado gratuito.
 */
test('recorrido principal: de la portada al resultado gratuito', async ({ page, isMobile }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Explorar Australia
  await page
    .getByRole('link', { name: /Explorar Australia/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { level: 1, name: 'Australia' })).toBeVisible()

  // Leer una guía conectada al CMS
  await page
    .getByRole('link', { name: /Visado de Trabajo y Vacaciones \(462\)/ })
    .first()
    .click()
  await expect(page.getByRole('heading', { level: 2, name: /Requisitos/ })).toBeVisible()
  await expect(page.getByText('Fuente oficial').first()).toBeVisible()

  // Iniciar el cuestionario desde la llamada a la acción de la guía
  await page.getByRole('complementary', { name: 'Analiza tu situación' }).getByRole('link').click()
  await expect(page.getByRole('heading', { name: 'Analiza tu situación' })).toBeVisible()

  // Paso 1: sobre ti
  await page.getByLabel('¿Qué edad tienes?').fill('24')
  await page.getByRole('radio', { name: 'España' }).first().check()
  await page
    .getByRole('group', { name: '¿Dónde vives ahora?' })
    .getByRole('radio', { name: 'España' })
    .check()
  await page
    .getByRole('group', { name: /hijos/ })
    .getByRole('radio', { name: 'No', exact: true })
    .check()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 2: formación
  await page.getByRole('radio', { name: /Formación Profesional/ }).check()
  await page.getByRole('radio', { name: /Intermedio/ }).check()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 3: experiencia
  await page.getByLabel(/sector trabajas/).selectOption('tecnologia')
  await page.getByLabel(/profesión o puesto/).fill('Técnico de soporte')
  await page.getByRole('radio', { name: '3–5 años' }).check()
  await page.getByLabel(/Qué sabes hacer/).fill('soporte técnico, integraciones, redes')
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 4: dinero
  await page.getByLabel(/ahorrado/).fill('7000')
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 5: objetivos
  await page.getByRole('checkbox', { name: 'Ahorrar' }).check()
  await page.getByRole('checkbox', { name: 'Vivir la experiencia' }).check()
  await page.getByRole('radio', { name: 'Entre uno y dos años' }).check()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 6: preferencias
  await page.getByRole('radio', { name: 'Depende de las condiciones' }).check()
  await page.getByRole('checkbox', { name: /Minería/ }).check()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 7: comprobaciones (una «Sí» y el resto «No lo sé»)
  await expect(page.getByRole('heading', { name: 'Comprobaciones rápidas' })).toBeVisible()
  const groups = page.locator('fieldset.q')
  const n = await groups.count()
  for (let i = 0; i < n; i++) {
    await groups
      .nth(i)
      .getByRole('radio', { name: i === 0 ? 'Sí' : 'No lo sé' })
      .check()
  }
  await page.getByRole('button', { name: 'Siguiente' }).click()

  // Paso 8: resumen editable
  await expect(page.getByRole('heading', { name: 'Revisa tus respuestas' })).toBeVisible()
  await expect(page.getByText('24 años')).toBeVisible()
  await page.getByRole('button', { name: 'Ver mi resultado' }).click()

  // Resultado gratuito
  await expect(page.getByRole('heading', { level: 1, name: 'Tu resultado' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tus 3 siguientes pasos' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Vías que merece la pena investigar' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: /Coincide/ }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /Falta comprobar/ }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /no lo evalúa/ }).first()).toBeVisible()
  await expect(page.getByText(/Soporte TI en entornos industriales/)).toBeVisible()
  await expect(page.getByText(/no es una aprobación migratoria/i)).toBeVisible()

  // Sin porcentajes de compatibilidad inventados
  const text = await page.locator('main').innerText()
  expect(text).not.toMatch(/\d+\s?%/)

  // Las respuestas viven solo en el navegador
  const stored = await page.evaluate(() => window.localStorage.getItem('wil.profile.v1'))
  expect(stored).toContain('"age":24')

  void isMobile
})

test('el explorador de oportunidades filtra y explica por qué', async ({ page }) => {
  await page.goto('/australia/oportunidades')
  await page.getByLabel('Tu experiencia').fill('soporte técnico')
  await expect(page.getByText(/Cercana a «soporte técnico»/)).toBeVisible()
  await expect(page.getByText(/no es un ranking/)).toBeVisible()
})

test('el resultado sin respuestas invita a empezar', async ({ page }) => {
  await page.goto('/analisis/resultado')
  await expect(page.getByRole('heading', { name: 'Todavía no hay respuestas' })).toBeVisible()
})
