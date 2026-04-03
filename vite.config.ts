import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
