import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { normalizeBasePath } from './src/app/basePath.js'

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_REPO_NAME ?? ''),
  plugins: [react()],
})
