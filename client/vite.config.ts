// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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