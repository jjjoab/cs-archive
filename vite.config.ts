import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // ✅ makes sure paths are relative and work on Netlify
  plugins: [react()],
})
