import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// Custom plugin to handle client-side routing
const historyApiFallbackPlugin = () => {
  return {
    name: 'history-api-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // If the request is for a file (has extension) or API route, let it through
        if (req.url?.includes('.') || req.url?.startsWith('/api')) {
          return next();
        }
        
        // For all other routes, serve index.html to enable client-side routing
        if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
          req.url = '/';
        }
        
        next();
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), historyApiFallbackPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false
    }
  },
  preview: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})