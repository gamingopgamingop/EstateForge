import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (including the non-VITE_ OUTPERO_API_KEY) for server-side use.
  const env = loadEnv(mode, process.cwd(), "");

  return {
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
        // Outpero places outbound AI voice-agent calls and requires a secret
        // Bearer key. The key is injected SERVER-SIDE here (from OUTPERO_API_KEY
        // in .env, no VITE_ prefix) so it is NEVER shipped in the browser bundle.
        // The frontend only calls the relative "/outpero-api/v1/calls" path.
        "/outpero-api": {
          target: "https://api.outpero.com",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/outpero-api/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (env.OUTPERO_API_KEY) {
                proxyReq.setHeader("Authorization", `Bearer ${env.OUTPERO_API_KEY}`);
              }
            });
          },
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
  };
});
