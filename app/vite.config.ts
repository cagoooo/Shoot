import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { normalizeBasePath } from './src/app/basePath.js'
import { readFileSync } from 'node:fs'

const pwaVersionPlugin = (): Plugin => ({
  name: 'earth-guardian-pwa-version',
  generateBundle() {
    const buildVersion = process.env.GITHUB_SHA?.slice(0, 12) ?? `local-${Date.now()}`
    const swTemplate = readFileSync(new URL('./pwa/sw.template.js', import.meta.url), 'utf8')
    this.emitFile({
      type: 'asset',
      fileName: 'sw.js',
      source: swTemplate.replace('__BUILD_VERSION__', buildVersion),
    })
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({
        version: '0.1.0-vertical-slice',
        buildId: buildVersion,
        mission: 'recycling-storm',
      }),
    })
  },
})

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_REPO_NAME ?? ''),
  plugins: [react(), pwaVersionPlugin()],
})
