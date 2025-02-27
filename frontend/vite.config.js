import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@revicons': '/node_modules/react-multi-carousel/lib/revicons.woff'
    }
  }
})
