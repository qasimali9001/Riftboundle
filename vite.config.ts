import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub project page: set env VITE_BASE_PATH=/RepoName/ in CI (see .github/workflows). */
const base = process.env.VITE_BASE_PATH?.replace(/\/?$/, '/') ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/riftcodex': {
        target: 'https://api.riftcodex.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/riftcodex/, ''),
      },
    },
  },
})
