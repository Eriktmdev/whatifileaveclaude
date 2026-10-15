import { defineConfig, devices } from '@playwright/test'

/**
 * Prueba del recorrido principal. Necesita la base de datos local con la demo
 * (`pnpm seed`). Reutiliza `pnpm dev` si ya está arrancado.
 * Chromium: si hay un navegador preinstalado, indica su ruta en PW_CHROMIUM_PATH.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
