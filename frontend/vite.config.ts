import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified vite config without path alias (avoids @types/node requirement)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://smart-resume-scanner1.onrender.com',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
