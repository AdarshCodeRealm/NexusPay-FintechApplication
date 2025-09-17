import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    historyApiFallback: {
      // Enable history API fallback for all routes
      rewrites: [
        // Serve index.html for all non-file routes
        { from: /^\/(?!.*\.).*$/, to: '/index.html' }
      ]
    },
    fs: {
      strict: false
    }
  },
  preview: {
    port: 5173,
    host: true,
    historyApiFallback: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})