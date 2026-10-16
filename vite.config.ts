import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // NOTE: basicSsl is enabled below, so the dev server serves HTTPS on the
    // same port. Browser mic/voice features need a secure context: use
    // https://localhost:8080 or the https:// Network URL (for phones on the LAN).
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
    basicSsl(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
