import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://160.191.245.237/',
        changeOrigin: true,
        secure: false,
      },
      '/facilities': {
        target: 'http://160.191.245.237/',
        changeOrigin: true,
        secure: false,
      },
      '/courts': {
        target: 'http://160.191.245.237/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
