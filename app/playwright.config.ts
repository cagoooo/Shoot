import { defineConfig, devices } from '@playwright/test'

const repoName = process.env.VITE_REPO_NAME?.replace(/^\/+|\/+$/g, '')
const basePath = repoName ? `/${repoName}/` : '/'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL: `http://127.0.0.1:5180${basePath}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 5180',
    port: 5180,
    reuseExistingServer: !process.env.CI,
  },
})
