/**
 * Outpero AI voice-agent call client.
 *
 * SECURITY: the secret Bearer key is NOT read here and is NOT sent from the
 * browser. Requests go to the relative "/outpero-api" path, which the Vite dev
 * server proxies to https://api.outpero.com and signs server-side with
 * OUTPERO_API_KEY (see vite.config.ts). Never inline the key in frontend code.
 *
 * NOTE: the dev proxy only exists while running `npm run dev`. For a production
 * static deploy you must front this with a small serverless/edge function that
 * adds the Authorization header, or point VITE_OUTPERO_BASE at such a backend.
 */

const BASE = (import.meta.env.VITE_OUTPERO_BASE as string) || "/outpero-api";
const DEFAULT_EMPLOYEE_ID =
  (import.meta.env.VITE_OUTPERO_EMPLOYEE_ID as string) || "";

export type OutperoCallResult = {
  id: string;
  status: string;
  raw: Record<string, unknown>;
};

export type PlaceCallParams = {
  /** E.164-ish phone number, e.g. +919876543210 */
  phone: string;
  /** AI-agent employee id; falls back to VITE_OUTPERO_EMPLOYEE_ID. */
  employeeId?: string;
  /** Template variables injected into the agent's script. */
  variables?: Record<string, string | number | undefined>;
  /** Dedup token so a double-click can't place two calls. */
  idempotencyKey?: string;
};

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned);
}

export async function placeOutperoCall(
  params: PlaceCallParams
): Promise<OutperoCallResult> {
  const employeeId = (params.employeeId || DEFAULT_EMPLOYEE_ID).trim();
  if (!employeeId) {
    throw new Error(
      "No Outpero employee id configured. Set VITE_OUTPERO_EMPLOYEE_ID or pass one explicitly."
    );
  }
  if (!validatePhone(params.phone)) {
    throw new Error("Enter a valid phone number, e.g. +919876543210");
  }

  const body = {
    employee_id: employeeId,
    phone: params.phone.replace(/[\s\-()]/g, ""),
    // Drop undefined values so the agent only receives filled variables.
    variables: Object.fromEntries(
      Object.entries(params.variables ?? {}).filter(([, v]) => v !== undefined && v !== "")
    ),
  };

  const res = await fetch(`${BASE}/v1/calls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey || `estateforge-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    /* non-JSON response — keep defaults */
  }

  if (!res.ok) {
    const detail =
      (data.message as string) ||
      (data.error as string) ||
      `Outpero request failed (HTTP ${res.status})`;
    // A 401/403 here almost always means OUTPERO_API_KEY is missing/stale in .env
    // (the proxy couldn't sign the request), since the browser holds no key.
    throw new Error(detail);
  }

  return {
    id: (data.id as string) ?? "",
    status: (data.status as string) ?? "unknown",
    raw: data,
  };
}

/** True when running where the dev proxy is expected to sign requests. */
export function isOutperoProxyAvailable(): boolean {
  return BASE.startsWith("/");
}
