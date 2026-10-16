import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { forwardOutperoCall } from "./api/_outpero";

/**
 * Dev-only SERVER middleware that mirrors the production serverless function
 * at api/outpero-call.ts. It serves POST /api/outpero-call, reads the secret
 * from the server env, and forwards to Outpero — so the browser never holds
 * or sends the API key, in dev or prod. This is a real Node server handler,
 * not a passthrough proxy.
 */
function outperoDevServer(apiKey: string | undefined): Plugin {
  return {
    name: "outpero-dev-server",
    configureServer(server) {
      server.middlewares.use("/api/outpero-call", (req, res) => {
        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(Buffer.from(c)));
        req.on("end", async () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf-8");
            const body = raw ? JSON.parse(raw) : {};
            const idem = req.headers["idempotency-key"];
            const { status, json } = await forwardOutperoCall(
              body,
              apiKey,
              typeof idem === "string" ? idem : undefined
            );
            res.statusCode = status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(json));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: e?.message || "Server error" }));
          }
        });
      });
    },
  };
}

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
        // NOTE: Outpero is NOT proxied here. It is served by the
        // outperoDevServer() middleware (see plugins) at /api/outpero-call,
        // which mirrors the production serverless function and keeps the
        // secret strictly server-side.
      },
    },
    plugins: [
      react(),
      basicSsl(),
      outperoDevServer(env.OUTPERO_API_KEY),
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
