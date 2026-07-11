import { defineConfig, devices } from '@playwright/test'

const repoName = process.env.VITE_REPO_NAME?.replace(/^\/+|\/+$/g, '')
const basePath = repoName ? `/${repoName}/` : '/'
const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? 5180)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Babylon chunks are intentionally large; serial browser workers keep
  // classroom-flow checks deterministic on lower-memory CI runners.
  workers: Number(process.env.PLAYWRIGHT_WORKERS ?? 1),
  reporter: 'line',
  use: {
    baseURL: `http://127.0.0.1:${previewPort}${basePath}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_SERVER ? undefined : {
    // Rebuild so a prior GitHub Pages build cannot leak into root-path tests.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${previewPort}`,
    port: previewPort,
    reuseExistingServer: !process.env.CI,
  },
})
