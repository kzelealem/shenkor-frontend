import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://api.halwot.com',
        changeOrigin: true,
        // ### FIXED: The 'rewrite' line has been removed. ###
        // This ensures that a request to '/api/auth/login' is proxied to
        // 'https://api.halwot.com/api/auth/login' as your backend expects.
      },
    },
  },
});