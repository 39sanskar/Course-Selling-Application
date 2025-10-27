import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,              // optional, ensures consistent port
    open: true,              // optional, auto opens browser
    historyApiFallback: true // 👈 important for React Router routes
  }
})
