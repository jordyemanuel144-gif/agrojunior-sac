import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: "/", // 👈 ESTO ES CLAVE
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})