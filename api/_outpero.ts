/**
 * Shared SERVER-SIDE logic for placing Outpero voice-agent calls.
 *
 * This runs only in a server context (Vite dev middleware in development,
 * a serverless function in production). The secret OUTPERO_API_KEY is read
 * from the server environment here and is NEVER sent to or stored in the
 * browser. The web page calls our own "/api/outpero-call" endpoint; this
 * module forwards to https://api.outpero.com with the Bearer key.
 *
 * See: https://api.outpero.com — "The API is for servers and automation
 * tools. Never put an API key in a web page."
 */

const OUTPERO_URL = "https://api.outpero.com/v1/calls";

export type OutperoCallBody = {
  phone?: string;
  employee_id?: string;
  variables?: Record<string, unknown>;
};

export type OutperoForwardResult = {
  status: number;
  json: unknown;
};

function normalizePhone(phone: string): string {
  return String(phone ?? "").replace(/[\s\-()]/g, "");
}

export async function forwardOutperoCall(
  body: OutperoCallBody,
  apiKey: string | undefined,
  idempotencyKey?: string
): Promise<OutperoForwardResult> {
  if (!apiKey) {
    return {
      status: 500,
      json: { message: "Server is not configured: set OUTPERO_API_KEY in the server environment." },
    };
  }

  const phone = normalizePhone(body.phone ?? "");
  const employeeId = String(body.employee_id ?? "").trim();

  if (!/^\+?\d{7,15}$/.test(phone)) {
    return { status: 400, json: { message: "Enter a valid phone number, e.g. +919876543210" } };
  }
  if (!employeeId) {
    return { status: 400, json: { message: "employee_id is required." } };
  }

  try {
    const res = await fetch(OUTPERO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey || `estateforge-${Date.now()}`,
      },
      body: JSON.stringify({
        employee_id: employeeId,
        phone,
        variables: body.variables ?? {},
      }),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { message: text?.slice(0, 200) || `Upstream error (HTTP ${res.status})` };
    }
    return { status: res.status, json };
  } catch (e: any) {
    return {
      status: 502,
      json: { message: `Could not reach Outpero: ${e?.message || "network error"}` },
    };
  }
}
