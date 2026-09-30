import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps the build portable (Vercel, Netlify, GitHub Pages sub-paths).
export default defineConfig({ base: './', plugins: [react()], worker: { format: 'es' } })
