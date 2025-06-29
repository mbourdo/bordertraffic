// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/bordertraffic/', // github repo name
  plugins: [react()],
})
