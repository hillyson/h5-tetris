import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // 支持局域网访问
    port: 5173
  }
})