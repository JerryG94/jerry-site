import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import adminApi from './admin-api.js'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Admin API middleware - dev only (configureServer hook)
    ...(mode === 'development' ? [adminApi()] : [])
  ],
  // GitHub Pages base path
  base: '/jerry-site/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: false
  }
}))
