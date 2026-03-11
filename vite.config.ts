import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/safepay': {
        target: 'https://sandbox.api.getsafepay.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/safepay/, ''),
      },
    },
  },
});
