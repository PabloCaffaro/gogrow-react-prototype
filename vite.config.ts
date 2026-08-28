import react from '@vitejs/plugin-react'
import inertia from '@inertiajs/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import path from 'node:path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    RubyPlugin(),
    inertia(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './app/javascript'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3036,
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
    hmr: {
      host: 'localhost',
      port: 3036,
    },
  },
})
