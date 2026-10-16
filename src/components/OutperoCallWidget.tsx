import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PhoneCall, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { placeOutperoCall, type OutperoCallResult } from "../utils/outperoApi";
import { toast } from "sonner";

const DEFAULT_EMPLOYEE_ID =
  (import.meta.env.VITE_OUTPERO_EMPLOYEE_ID as string) || "";

type CallIntent =
  | "Property enquiry follow-up"
  | "Viewing confirmation"
  | "Deposit & agreement clarification"
  | "Maintenance update";

/**
 * OutperoCallWidget: one-click trigger that asks Outpero's AI voice agent to
 * place a real outbound call to a phone number (rental follow-ups, viewing
 * confirmations, etc). The secret key stays server-side via the Vite proxy.
 */
export const OutperoCallWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<CallIntent>("Property enquiry follow-up");
  const [property, setProperty] = useState("");
  const [employeeId, setEmployeeId] = useState(DEFAULT_EMPLOYEE_ID);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<OutperoCallResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const handleCall = async () => {
    reset();
    setBusy(true);
    try {
      const call = await placeOutperoCall({
        phone,
        employeeId,
        variables: { intent, property },
      });
      setResult(call);
      toast.success(`AI agent is calling ${phone} (${call.status})`);
    } catch (e: any) {
      const msg = e?.message || "Could not place the call.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-5 h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg z-50 p-0"
        aria-label="Have the AI voice agent call a number"
        title="AI voice agent phone call (Outpero)"
      >
        <PhoneCall className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <PhoneCall className="w-4 h-4 text-indigo-600" /> AI Voice Agent Call
            </DialogTitle>
            <DialogDescription className="text-xs">
              Outpero's AI agent will place a live call to the number below using your configured
              rental script. Calls are signed server-side — your API key never leaves the dev proxy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Phone number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                inputMode="tel"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Call purpose</label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value as CallIntent)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
              >
                {(["Property enquiry follow-up", "Viewing confirmation", "Deposit & agreement clarification", "Maintenance update"] as CallIntent[]).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Property / locality <span className="text-slate-400 font-normal">(optional, passed to the agent)</span>
              </label>
              <Input
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                placeholder="e.g. 2 BHK, Koramangala"
                className="h-9 text-sm"
              />
            </div>

            <details className="text-[11px] text-slate-500">
              <summary className="cursor-pointer select-none font-medium">Advanced: agent (employee) ID</summary>
              <Input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee ID"
                className="h-8 text-[11px] mt-1.5 font-mono"
              />
            </details>

            {result && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Call placed — status <strong>{result.status}</strong>
                  {result.id && <span className="block text-[10px] text-emerald-700 font-mono mt-0.5">id: {result.id}</span>}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400 flex items-start gap-1.5">
              <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5 text-emerald-600" />
              <span>
                If this fails with an auth error, set a fresh <code>OUTPERO_API_KEY</code> in{" "}
                <code>.env</code> (server-side only) and restart <code>npm run dev</code>.
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="text-xs">
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleCall}
              disabled={busy || phone.trim() === ""}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
            >
              {busy ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Calling…</>
              ) : (
                <><PhoneCall className="w-3.5 h-3.5" /> Place AI Call</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OutperoCallWidget;
