import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',  // Explicitly set base path for production SPA routing
  plugins: [react()],
  build: {
    outDir: 'dist',  // Explicitly ensure output goes to dist for Vercel
    sourcemap: false, // Do not expose source maps in production builds
    chunkSizeWarningLimit: 1000,  // Suppress warnings for code splitting
    minify: 'terser',  // Better minification
    target: 'esnext',  // Target modern browsers
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
