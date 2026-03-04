import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    strictPort: true, // Fail if port is in use
  },
  build: {
    chunkSizeWarningLimit: 2000, // Increase warning limit to 2MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'recharts', 'jspdf', 'axios'],
        }
      }
    }
  }
})
