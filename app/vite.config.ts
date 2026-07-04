import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: {
      '/store': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, '../PHOTOS'),
        '/home/dmannu/quorin-site/PHOTOS',
        path.resolve(__dirname, 'node_modules'),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: 'public',
});
