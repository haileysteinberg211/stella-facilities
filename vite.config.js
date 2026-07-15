import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base ('./') for production so the built app works anywhere —
// GitHub Pages project subpath, Netlify root, or a double-clicked file.
// Dev stays at '/' so http://localhost:5173/ keeps working.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react(), tailwindcss()],
}))
