import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // NVIDIA's integrate endpoint does not send CORS headers, so browser
      // calls must be proxied through the dev server in development.
      "/nemotron-api": {
        target: "https://integrate.api.nvidia.com",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/nemotron-api/, ""),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
