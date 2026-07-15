import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: served under /stella-facilities/ on GitHub Pages (production build),
// but at / during local dev so http://localhost:5173/ keeps working.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/stella-facilities/' : '/',
  plugins: [react(), tailwindcss()],
}))
