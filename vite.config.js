/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { compression } from 'vite-plugin-compression2'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    }),
    compression({ algorithm: 'gzip', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', threshold: 1024 })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`
      }
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api/h5': {
        // Dev-only proxy target. In production, Nginx or the deployed backend handles /api/h5.
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
