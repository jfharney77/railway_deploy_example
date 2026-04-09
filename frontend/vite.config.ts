import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to the backend during local development.
    // In production, set VITE_API_BASE_URL to the backend Railway URL.
    proxy: {
      '/health': 'http://localhost:8000',
      '/hello': 'http://localhost:8000',
    },
  },
})
