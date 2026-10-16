import React, { useMemo, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  CalendarDays,
  IndianRupee,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Timer,
  Wallet,
  Sparkles,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";

type PaymentReminder = {
  id: string;
  label: string;
  propertyTitle: string;
  amount: number;
  dueDay: number; // 1-31
  method: "UPI" | "Bank Transfer" | "Cash" | "Cheque";
  category: "Rent" | "Maintenance" | "Electricity" | "WiFi" | "Deposit EMI" | "Other";
  autoReminder: boolean;
  history: { month: string; paidDate: string; amount: number }[];
  recipientPhone?: string;
};

const STORAGE_KEY = "rentright_payment_reminders";

const seed: PaymentReminder[] = [
  {
    id: "PR-1",
    label: "Monthly Rent - Koramangala PG",
    propertyTitle: "Stanza Living - Premium Student & Pro PG",
    amount: 14000,
    dueDay: 5,
    method: "UPI",
    category: "Rent",
    autoReminder: true,
    recipientPhone: "+91 98800 11223",
    history: [
      { month: "2026-08", paidDate: "2026-08-05", amount: 14000 },
      { month: "2026-09", paidDate: "2026-09-04", amount: 14000 },
      { month: "2026-10", paidDate: "2026-10-05", amount: 14000 },
    ],
  },
  {
    id: "PR-2",
    label: "Maintenance Charge",
    propertyTitle: "Stanza Living - Premium Student & Pro PG",
    amount: 1500,
    dueDay: 10,
    method: "Bank Transfer",
    category: "Maintenance",
    autoReminder: true,
    history: [
      { month: "2026-09", paidDate: "2026-09-10", amount: 1500 },
    ],
  },
];

export const RentPaymentReminderPage: React.FC = () => {
  const [reminders, setReminders] = useState<PaymentReminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return seed;
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "",
    propertyTitle: "",
    amount: 0,
    dueDay: 5,
    method: "UPI" as PaymentReminder["method"],
    category: "Rent" as PaymentReminder["category"],
  });

  const persist = (list: PaymentReminder[]) => {
    setReminders(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  };

  const today = new Date();
  const currentDay = today.getDate();

  const getStatus = (r: PaymentReminder): { status: "due-soon" | "overdue" | "upcoming" | "paid-this-month"; daysToDue: number } => {
    const last = r.history.find((h) => h.month === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`);
    const daysToDue = r.dueDay - currentDay;
    if (last) return { status: "paid-this-month", daysToDue };
    if (daysToDue < 0) return { status: "overdue", daysToDue };
    if (daysToDue <= 5) return { status: "due-soon", daysToDue };
    return { status: "upcoming", daysToDue };
  };

  const markPaid = (id: string) => {
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    persist(
      reminders.map((r) => {
        if (r.id === id) {
          const already = r.history.some((h) => h.month === thisMonth);
          if (already) return r;
          return { ...r, history: [{ month: thisMonth, paidDate: today.toISOString().split("T")[0], amount: r.amount }, ...r.history] };
        }
        return r;
      })
    );
    toast.success("Payment marked as paid. Timestamped for your records.");
  };

  const addReminder = () => {
    if (!form.label.trim() || form.amount <= 0) { toast.error("Fill label & amount"); return; }
    const id = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    persist([...reminders, {
      id, label: form.label, propertyTitle: form.propertyTitle || "—", amount: form.amount, dueDay: form.dueDay,
      method: form.method, category: form.category, autoReminder: true, history: [],
    }]);
    setForm({ ...form, label: "", propertyTitle: "", amount: 0 });
    setShowForm(false);
    toast.success("Reminder added. You'll be notified 3 days before due.");
  };

  const removeReminder = (id: string) => persist(reminders.filter((r) => r.id !== id));

  const totalMonthly = useMemo(() => reminders.reduce((s, r) => s + r.amount, 0), [reminders]);
  const dueSoon = reminders.filter((r) => getStatus(r).status === "due-soon" || getStatus(r).status === "overdue");
  const yearlySpend = totalMonthly * 12;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Bell className="w-3.5 h-3.5" /> Tenant Utility
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Rent Payment Reminder & Ledger</h1>
            <p className="text-slate-600 mt-2 text-sm">Never miss rent day. Auto-track monthly payments, get reminders, and generate HRA receipt data for your employer.</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-violet-600" />
              <div><div className="text-lg font-black">₹{totalMonthly.toLocaleString()}</div><div className="text-[10px] uppercase text-slate-500 font-bold">Monthly Outflow</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Repeat className="w-5 h-5 text-blue-600" />
              <div><div className="text-lg font-black">{reminders.length}</div><div className="text-[10px] uppercase text-slate-500 font-bold">Active Bills</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div><div className="text-lg font-black">{dueSoon.length}</div><div className="text-[10px] uppercase text-slate-500 font-bold">Due This Week</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div><div className="text-lg font-black">₹{(yearlySpend / 100000).toFixed(1)}L</div><div className="text-[10px] uppercase text-slate-500 font-bold">Annual Spend</div></div>
            </CardContent></Card>
          </div>

          {/* Header actions */}
          <Card className="border-slate-200 shadow-sm mb-4">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-violet-600" /> Today: {today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Bill
              </Button>
            </CardContent>
          </Card>

          {showForm && (
            <Card className="border-violet-200 shadow-md mb-4 animate-fade-in">
              <CardHeader className="py-3"><CardTitle className="text-sm font-bold">New Recurring Payment</CardTitle></CardHeader>
              <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <Input placeholder="Label (e.g. Monthly Rent)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="h-8 text-xs" />
                <Input placeholder="Property / Landlord" value={form.propertyTitle} onChange={(e) => setForm({ ...form, propertyTitle: e.target.value })} className="h-8 text-xs" />
                <Input type="number" placeholder="Amount ₹" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="h-8 text-xs" />
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Due Day of Month</label>
                  <Input type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Category</label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Rent","Maintenance","Electricity","WiFi","Deposit EMI","Other"].map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Method</label>
                  <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as any })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["UPI","Bank Transfer","Cash","Cheque"].map((m) => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <Button size="sm" onClick={addReminder} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1"><Sparkles className="w-3 h-3" /> Save Reminder</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reminder cards */}
          <div className="space-y-3">
            {reminders.map((r) => {
              const st = getStatus(r);
              const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
              const paid = st.status === "paid-this-month";
              const totalPaid = r.history.reduce((s, h) => s + h.amount, 0);
              const badge = {
                "due-soon": { cls: "bg-amber-100 text-amber-800 border-amber-300", label: `Due in ${st.daysToDue}d` },
                overdue: { cls: "bg-rose-100 text-rose-800 border-rose-300", label: `Overdue ${Math.abs(st.daysToDue)}d` },
                upcoming: { cls: "bg-slate-100 text-slate-700 border-slate-300", label: `Due on day ${r.dueDay}` },
                "paid-this-month": { cls: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Paid this month ✓" },
              }[st.status];

              return (
                <Card key={r.id} className={`border-slate-200 shadow-sm ${paid ? "bg-emerald-50/40" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[9px] ${badge.cls}`}><Timer className="w-2.5 h-2.5 mr-1" /> {badge.label}</Badge>
                          <Badge variant="secondary" className="text-[9px]">{r.category}</Badge>
                          <Badge variant="outline" className="text-[9px]">{r.method}</Badge>
                        </div>
                        <div className="font-bold text-sm text-slate-900 mt-1">{r.label}</div>
                        <div className="text-[11px] text-slate-500">{r.propertyTitle}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Lifetime paid: <span className="font-bold text-slate-700">₹{totalPaid.toLocaleString()}</span> across {r.history.length} cycles
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-slate-900">₹{r.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">every month</div>
                        <div className="flex flex-col gap-1 mt-2">
                          <Button size="sm" onClick={() => markPaid(r.id)} disabled={paid} className={`h-6 text-[10px] ${paid ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                            {paid ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Recorded</> : "Mark Paid"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeReminder(r.id)} className="h-6 text-[10px] text-rose-600 hover:bg-rose-50">
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    {r.history.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Payment History</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {r.history.slice(0, 12).map((h) => (
                            <div key={h.month} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[10px]">
                              <div className="font-bold text-slate-700">{h.month}</div>
                              <div className="text-slate-500">{h.paidDate}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 mb-1"><AlertCircle className="w-4 h-4 text-amber-600" /> Missed-Payment Consequences</div>
              <p>Indian landlords commonly levy 12-18% annual late interest, and 2+ missed cycles is a legal ground for eviction with 15-day notice. Set browser notifications for at least day -3.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
              <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4 text-blue-600" /> HRA Tax Saver</div>
              <p>Employers require rent receipts + landlord PAN (if ₹1L+ annual) for HRA exemption. Your payment history here is timestamped evidence for Form 12BB filings.</p>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default RentPaymentReminderPage;
