import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // In dev, /api is proxied to the local backend so no CORS setup is needed.
    proxy: {
      '/api': { target: process.env.VITE_DEV_API ?? 'http://localhost:8000', changeOrigin: true },
      '/health': { target: process.env.VITE_DEV_API ?? 'http://localhost:8000', changeOrigin: true },
    },
  },
});
