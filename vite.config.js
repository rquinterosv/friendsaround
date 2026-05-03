import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['src', 'public']
    }
  },
  build: {
    rollupOptions: {
      external: (id) => id.includes('/api/')
    }
  },
  optimizeDeps: {
    exclude: ['api']
  }
})

// Note: src/lib/api.js is both statically imported (by components) and dynamically imported (by firebase.js)
// This is expected behavior - Vite warning about dynamic import is harmless
