import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import UnoCSS from 'unocss/vite'
import react from '@vitejs/plugin-react'

const host = process.env.TAURI_DEV_HOST

export default defineConfig(async () => ({
  plugins: [react(), UnoCSS()],

  clearScreen: false,
  server: {
    port: 327,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 327
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}))
