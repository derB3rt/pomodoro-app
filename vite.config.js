import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Passe den base-Pfad an deinen GitHub-Repository-Namen an
// z.B. '/pomodoro-app/' wenn dein Repo 'pomodoro-app' heißt
export default defineConfig({
  plugins: [react()],
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
