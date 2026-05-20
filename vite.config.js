import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Passe den base-Pfad an deinen GitHub-Repository-Namen an
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/pomodoro-app/',
      manifest: {
        name: 'Pomodoro',
        short_name: 'Pomodoro',
        description: 'Fokus-Timer mit Supabase-Tracking',
        start_url: '/pomodoro-app/',
        scope: '/pomodoro-app/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#D85A30',
        lang: 'de',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/pomodoro-app/index.html',
      },
    }),
  ],
  base: '/pomodoro-app/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
