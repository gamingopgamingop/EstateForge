import React, { useState, useMemo } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Wallet,
  Users,
  Plus,
  Trash2,
  IndianRupee,
  PieChart,
  Zap,
  Droplets,
  Wifi,
  Home,
  CalendarDays,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Roommate {
  id: string;
  name: string;
  avatarColor: string;
  daysHome: number; // for prorated split
}

interface Expense {
  id: string;
  label: string;
  category: "rent" | "deposit" | "electricity" | "wifi" | "water" | "groceries" | "other";
  amount: number;
  paidByRoommateId: string;
  splitAmong: string[]; // roommate IDs
  dueDate: string;
  settled: boolean;
}

const CATEGORY_ICONS: Record<Expense["category"], React.ReactNode> = {
  rent: <Home className="w-4 h-4" />,
  deposit: <IndianRupee className="w-4 h-4" />,
  electricity: <Zap className="w-4 h-4" />,
  wifi: <Wifi className="w-4 h-4" />,
  water: <Droplets className="w-4 h-4" />,
  groceries: <Wallet className="w-4 h-4" />,
  other: <PieChart className="w-4 h-4" />,
};

const AVATAR_COLORS = ["bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600"];

export const SplitRentManagerPage: React.FC = () => {
  const [roommates, setRoommates] = useState<Roommate[]>([
    { id: "rm1", name: "Aarav", avatarColor: "bg-violet-600", daysHome: 30 },
    { id: "rm2", name: "Bhavana", avatarColor: "bg-blue-600", daysHome: 30 },
    { id: "rm3", name: "Chirag", avatarColor: "bg-emerald-600", daysHome: 22 },
  ]);
  const [newRoommateName, setNewRoommateName] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "e1", label: "Monthly Rent (Oct)", category: "rent", amount: 25000, paidByRoommateId: "rm1", splitAmong: ["rm1", "rm2", "rm3"], dueDate: "2026-10-05", settled: true },
    { id: "e2", label: "Electricity Bill", category: "electricity", amount: 2400, paidByRoommateId: "rm2", splitAmong: ["rm1", "rm2", "rm3"], dueDate: "2026-10-10", settled: false },
    { id: "e3", label: "Broadband WiFi", category: "wifi", amount: 1200, paidByRoommateId: "rm1", splitAmong: ["rm1", "rm2", "rm3"], dueDate: "2026-10-08", settled: false },
  ]);
  const [newExp, setNewExp] = useState({ label: "", amount: 0, category: "electricity" as Expense["category"], paidBy: "rm1", dueDate: new Date().toISOString().split("T")[0] });

  const addRoommate = () => {
    if (!newRoommateName.trim() || roommates.length >= 6) {
      toast.error(newRoommateName.trim() ? "Max 6 roommates" : "Enter a name");
      return;
    }
    const id = `rm${Date.now()}`;
    setRoommates([...roommates, { id, name: newRoommateName.trim(), avatarColor: AVATAR_COLORS[roommates.length % AVATAR_COLORS.length], daysHome: 30 }]);
    setNewRoommateName("");
    toast.success("Roommate added");
  };

  const removeRoommate = (id: string) => {
    if (roommates.length <= 2) { toast.error("Minimum 2 roommates needed"); return; }
    setRoommates(roommates.filter((r) => r.id !== id));
    setExpenses(expenses.map((e) => ({ ...e, splitAmong: e.splitAmong.filter((s) => s !== id) })));
  };

  const addExpense = () => {
    if (!newExp.label.trim() || newExp.amount <= 0) { toast.error("Fill label & amount"); return; }
    const id = `e${Date.now()}`;
    setExpenses([...expenses, {
      id, label: newExp.label, category: newExp.category, amount: newExp.amount,
      paidByRoommateId: newExp.paidBy, splitAmong: roommates.map((r) => r.id),
      dueDate: newExp.dueDate, settled: false
    }]);
    setNewExp({ ...newExp, label: "", amount: 0 });
    toast.success("Expense added & split equally");
  };

  const toggleSettled = (id: string) => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)));
  };

  const removeExpense = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  // Per-roommate balance calculation
  const balances = useMemo(() => {
    const map = new Map<string, { paid: number; owed: number; net: number }>();
    roommates.forEach((r) => map.set(r.id, { paid: 0, owed: 0, net: 0 }));

    expenses.forEach((e) => {
      if (!e.settled) return;
      const participants = e.splitAmong.filter((id) => map.has(id));
      if (participants.length === 0) return;
      const share = e.amount / participants.length;
      participants.forEach((id) => {
        const entry = map.get(id)!;
        entry.owed += share;
      });
      if (map.has(e.paidByRoommateId)) {
        map.get(e.paidByRoommateId)!.paid += e.amount;
      }
    });

    Array.from(map.entries()).forEach(([id, v]) => map.set(id, { ...v, net: v.paid - v.owed }));
    return map;
  }, [expenses, roommates]);

  const totalSpent = expenses.filter((e) => e.settled).reduce((s, e) => s + e.amount, 0);
  const outstanding = expenses.filter((e) => !e.settled).reduce((s, e) => s + e.amount, 0);

  const nameOf = (id: string) => roommates.find((r) => r.id === id)?.name || "Unknown";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Split Rent & Expense Manager</h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Auto-split rent, deposit, electricity & WiFi among 2-6 roommates. See who owes whom at a glance.
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-violet-600" />
              <div><div className="text-xl font-black">{roommates.length}</div><div className="text-[10px] text-slate-500 uppercase">Roommates</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div><div className="text-xl font-black">₹{totalSpent.toLocaleString()}</div><div className="text-[10px] text-slate-500 uppercase">Settled</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <Wallet className="w-5 h-5 text-amber-600" />
              <div><div className="text-xl font-black">₹{outstanding.toLocaleString()}</div><div className="text-[10px] text-slate-500 uppercase">Outstanding</div></div>
            </CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3">
              <PieChart className="w-5 h-5 text-blue-600" />
              <div><div className="text-xl font-black">{expenses.length}</div><div className="text-[10px] text-slate-500 uppercase">Total Bills</div></div>
            </CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Roommates panel */}
            <Card className="lg:col-span-4 border-slate-200 shadow-sm">
              <CardHeader className="py-3"><CardTitle className="text-sm font-bold">Roommates & Balance</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">
                {roommates.map((r) => {
                  const bal = balances.get(r.id) || { paid: 0, owed: 0, net: 0 };
                  return (
                    <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={`w-9 h-9 rounded-full ${r.avatarColor} text-white grid place-items-center font-bold text-sm shrink-0`}>
                        {r.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-slate-900">{r.name}</div>
                        <div className="text-[10px] text-slate-500">Paid ₹{bal.paid.toLocaleString()} · Share ₹{bal.owed.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={bal.net > 0 ? "outline" : bal.net < 0 ? "secondary" : "outline"} className={`text-[10px] ${bal.net > 0 ? "text-emerald-700 border-emerald-300 bg-emerald-50" : bal.net < 0 ? "text-rose-700 bg-rose-100 border-rose-300" : ""}`}>
                          {bal.net > 0 ? `+₹${bal.net.toLocaleString()} to get` : bal.net < 0 ? `owes ₹${Math.abs(bal.net).toLocaleString()}` : "Settled"}
                        </Badge>
                      </div>
                      <button onClick={() => removeRoommate(r.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
                <div className="flex gap-2 pt-2">
                  <Input placeholder="New roommate name" value={newRoommateName} onChange={(e) => setNewRoommateName(e.target.value)} className="h-8 text-xs" />
                  <Button size="sm" onClick={addRoommate} className="bg-violet-600 hover:bg-violet-700 text-white h-8"><Plus className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>

            {/* Expense list & form */}
            <div className="lg:col-span-8 space-y-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3"><CardTitle className="text-sm font-bold">Add New Expense</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Input placeholder="Expense label (e.g. WiFi)" value={newExp.label} onChange={(e) => setNewExp({ ...newExp, label: e.target.value })} className="h-8 text-xs" />
                    <Input type="number" placeholder="Amount ₹" value={newExp.amount || ""} onChange={(e) => setNewExp({ ...newExp, amount: Number(e.target.value) })} className="h-8 text-xs" />
                    <select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      <option value="electricity">Electricity</option>
                      <option value="wifi">WiFi</option>
                      <option value="water">Water</option>
                      <option value="groceries">Groceries</option>
                      <option value="rent">Rent</option>
                      <option value="other">Other</option>
                    </select>
                    <select value={newExp.paidBy} onChange={(e) => setNewExp({ ...newExp, paidBy: e.target.value })} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      {roommates.map((r) => <option key={r.id} value={r.id}>Paid by {r.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Split equally among {roommates.length} → ₹{newExp.amount > 0 ? Math.round(newExp.amount / roommates.length).toLocaleString() : 0} each
                    </span>
                    <Button size="sm" onClick={addExpense} className="bg-violet-600 hover:bg-violet-700 text-white h-8 gap-1 text-xs"><Plus className="w-3.5 h-3.5" /> Add & Split</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3"><CardTitle className="text-sm font-bold">Monthly Bills Ledger</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {expenses.length === 0 && <p className="text-xs text-slate-500 italic">No expenses yet. Add one above.</p>}
                  {expenses.map((e) => {
                    const per = e.splitAmong.length > 0 ? e.amount / e.splitAmong.length : 0;
                    return (
                      <div key={e.id} className={`p-3 rounded-xl border ${e.settled ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 grid place-items-center shrink-0">
                              {CATEGORY_ICONS[e.category]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 truncate">{e.label}</span>
                                <Badge variant="outline" className="text-[9px]">{e.category}</Badge>
                                {e.settled && <Badge className="text-[9px] bg-emerald-600 text-white">Settled</Badge>}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Paid by <span className="font-semibold">{nameOf(e.paidByRoommateId)}</span> · Split among {e.splitAmong.map(nameOf).join(", ")} · {e.dueDate}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-extrabold text-sm text-slate-900">₹{e.amount.toLocaleString()}</div>
                            <div className="text-[10px] text-violet-700 font-semibold">₹{Math.round(per).toLocaleString()}/person</div>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <Button size="sm" variant={e.settled ? "outline" : "default"} onClick={() => toggleSettled(e.id)} className="h-6 text-[10px] px-2">
                              {e.settled ? "Unsettle" : "Settle"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => removeExpense(e.id)} className="h-6 text-[10px] px-2 text-rose-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> Pro-Tip for Flatmates</div>
                <p>Use this ledger every month before payment day. Everyone can see who paid, who owes, and what's settled. Reduces disputes and awkward money conversations.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default SplitRentManagerPage;
