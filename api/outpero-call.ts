/**
 * Production server endpoint: POST /api/outpero-call
 *
 * The browser calls THIS endpoint (same origin). This server reads the secret
 * from process.env.OUTPERO_API_KEY and forwards to Outpero. The key never
 * appears in the client bundle. Deployed automatically by Vercel (any file in
 * /api becomes a function); the handler is written against minimal, portable
 * request/response shapes so it also works on Netlify/Express with small edits.
 */
import { forwardOutperoCall } from "./_outpero";

interface MinimalRequest {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

interface MinimalResponse {
  status(code: number): MinimalResponse;
  json(body: unknown): void;
  setHeader?(key: string, value: string): void;
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  // Permissive CORS for local dev / preview. In production you can lock this
  // to your site's origin.
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader?.("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const idemHeader = req.headers?.["idempotency-key"];
  const idempotencyKey = typeof idemHeader === "string" ? idemHeader : undefined;

  const { status, json } = await forwardOutperoCall(
    req.body ?? {},
    process.env.OUTPERO_API_KEY,
    idempotencyKey
  );

  res.status(status).json(json);
}
