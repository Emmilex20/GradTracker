// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add the proxy configuration here
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // The rewrite rule is optional, but useful if your backend
        // doesn't have an '/api' prefix in its routes.
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // This creates a 'vendor' chunk for all dependencies from node_modules.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})