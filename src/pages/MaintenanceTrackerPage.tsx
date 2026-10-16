import React, { useMemo, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Droplets,
  Home,
  Bug,
  Shield,
  Package,
  Camera,
  Filter,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useProperties, MaintenanceTicket } from "../contexts/PropertiesContext";
import { toast } from "sonner";
import { fileToPhoto, validatePhotoFile } from "../utils/imageUpload";

const CATEGORY_ICON: Record<MaintenanceTicket["category"], React.ReactNode> = {
  Plumbing: <Droplets className="w-4 h-4" />,
  Electrical: <Zap className="w-4 h-4" />,
  Appliance: <Package className="w-4 h-4" />,
  Structural: <Home className="w-4 h-4" />,
  "Pest Control": <Bug className="w-4 h-4" />,
  Security: <Shield className="w-4 h-4" />,
  Other: <Wrench className="w-4 h-4" />,
};

const PRIORITY_STYLES: Record<MaintenanceTicket["priority"], string> = {
  low: "bg-slate-100 text-slate-700 border-slate-300",
  medium: "bg-amber-50 text-amber-800 border-amber-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  urgent: "bg-rose-100 text-rose-800 border-rose-300",
};

const STATUS_STYLES: Record<MaintenanceTicket["status"], { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-rose-600 text-white" },
  acknowledged: { label: "Acknowledged", cls: "bg-amber-500 text-white" },
  in_progress: { label: "In Progress", cls: "bg-blue-600 text-white" },
  resolved: { label: "Resolved", cls: "bg-emerald-600 text-white" },
};

export const MaintenanceTrackerPage: React.FC = () => {
  const { properties, tickets, addTicket, updateTicketStatus } = useProperties();
  const [filter, setFilter] = useState<MaintenanceTicket["status"] | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    propertyId: String(properties[0]?.id || ""),
    tenantName: "Rahul Verma",
    category: "Plumbing" as MaintenanceTicket["category"],
    priority: "medium" as MaintenanceTicket["priority"],
    title: "",
    details: "",
    photoUrl: "",
  });

  const filtered = useMemo(
    () => tickets.filter((t) => filter === "all" || t.status === filter).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [tickets, filter]
  );

  const statusCounts = useMemo(() => {
    const c = { open: 0, acknowledged: 0, in_progress: 0, resolved: 0 };
    tickets.forEach((t) => c[t.status]++);
    return c;
  }, [tickets]);

  const handlePhotoUpload = async (file: File) => {
    const err = validatePhotoFile(file);
    if (err) { toast.error(err); return; }
    try {
      const photo = await fileToPhoto(file);
      setForm({ ...form, photoUrl: photo.dataUrl });
      toast.success("Photo attached to ticket");
    } catch (e: any) {
      toast.error(e?.message || "Failed to process photo");
    }
  };

  const submitTicket = () => {
    if (!form.title.trim() || !form.details.trim()) { toast.error("Fill title and details"); return; }
    addTicket({
      propertyId: Number(form.propertyId),
      tenantName: form.tenantName,
      category: form.category,
      priority: form.priority,
      title: form.title,
      details: form.details,
      photoUrl: form.photoUrl || undefined,
    });
    setForm({ ...form, title: "", details: "", photoUrl: "" });
    setShowForm(false);
  };

  const advanceStatus = (t: MaintenanceTicket) => {
    const next: Record<MaintenanceTicket["status"], MaintenanceTicket["status"]> = {
      open: "acknowledged",
      acknowledged: "in_progress",
      in_progress: "resolved",
      resolved: "resolved",
    };
    updateTicketStatus(t.id, next[t.status]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Wrench className="w-3.5 h-3.5" /> Renter Empowerment
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Maintenance Complaint Tracker</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Log issues with photos, priority, and timestamps. Every ticket creates an auditable trail — no more "I never got your call" excuses from landlords.
            </p>
          </div>

          {/* Top bar */}
          <Card className="border-slate-200 shadow-sm mb-6">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-violet-600" />
                {(["all", "open", "acknowledged", "in_progress", "resolved"] as const).map((s) => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${filter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}>
                    <span className="capitalize">{s.replace("_", " ")}</span>
                    {s !== "all" && <span className="ml-1 opacity-70">({statusCounts[s]})</span>}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1">
                {showForm ? <><X className="w-3.5 h-3.5" /> Close</> : <><PlusCircle className="w-3.5 h-3.5" /> New Complaint</>}
              </Button>
            </CardContent>
          </Card>

          {/* New ticket form */}
          {showForm && (
            <Card className="border-violet-200 shadow-md mb-6 animate-fade-in">
              <CardHeader className="py-3 bg-violet-50/50"><CardTitle className="text-sm font-bold">File New Maintenance Complaint</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Your Property</label>
                    <Select value={form.propertyId} onValueChange={(v) => setForm({ ...form, propertyId: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {properties.slice(0, 30).map((p) => (
                          <SelectItem key={p.id} value={String(p.id)} className="text-xs">{p.title.slice(0, 50)} · {p.locality}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Your Name</label>
                    <Input value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} className="h-8 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Category</label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["Plumbing", "Electrical", "Appliance", "Structural", "Pest Control", "Security", "Other"] as const).map((c) => (
                          <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Priority</label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as any })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["low", "medium", "high", "urgent"] as const).map((p) => (
                          <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-xs" placeholder="e.g. Bathroom drain blocked since 2 days" /></div>
                <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Details</label><Textarea rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="text-xs" placeholder="Describe the issue, when it started, and any temporary arrangement made." /></div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Photo Evidence (optional)</label>
                  <div className="flex items-center gap-2">
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ""; }} />
                    <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center gap-1 px-3 h-8 rounded-md border border-slate-300 bg-white text-[11px] font-semibold hover:bg-slate-50">
                      <Camera className="w-3.5 h-3.5" /> Attach Photo
                    </label>
                    {form.photoUrl && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-violet-300">
                        <img src={form.photoUrl} alt="Proof" className="w-full h-full object-cover" />
                        <button onClick={() => setForm({ ...form, photoUrl: "" })} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-rose-600 text-white grid place-items-center"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs h-8">Cancel</Button>
                  <Button size="sm" onClick={submitTicket} className="text-xs h-8 bg-violet-600 hover:bg-violet-700 text-white gap-1"><Sparkles className="w-3 h-3" /> File Complaint</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="p-10 text-center">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No complaints match this filter.</p>
              </Card>
            ) : (
              filtered.map((t) => {
                const prop = properties.find((p) => p.id === t.propertyId);
                const st = STATUS_STYLES[t.status];
                return (
                  <Card key={t.id} className="border-slate-200 shadow-sm hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 grid place-items-center shrink-0">
                          {CATEGORY_ICON[t.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-[9px] ${PRIORITY_STYLES[t.priority]}`}>{t.priority.toUpperCase()}</Badge>
                            <Badge className={`text-[9px] ${st.cls}`}>{st.label}</Badge>
                            <span className="text-[10px] text-slate-400 ml-auto">#{t.id}</span>
                          </div>
                          <div className="font-bold text-sm text-slate-900 mt-1">{t.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {t.category} · Filed by <span className="font-semibold">{t.tenantName}</span> {prop ? ` for "${prop.title.slice(0, 40)}"` : ""} · Opened {t.createdAt} · Updated {t.updatedAt}
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{t.details}</p>

                          {t.photoUrl && (
                            <img src={t.photoUrl} alt="Proof" className="mt-2 w-24 h-24 object-cover rounded-lg border border-slate-200" />
                          )}

                          {t.ownerNote && (
                            <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-950 flex items-start gap-1.5">
                              <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                              <div><strong>Owner note:</strong> {t.ownerNote}</div>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex flex-col gap-1.5">
                          {t.status !== "resolved" ? (
                            <Button size="sm" onClick={() => advanceStatus(t)} className="h-7 text-[10px] bg-violet-600 hover:bg-violet-700 text-white">
                              Mark {STATUS_STYLES[t.status === "open" ? "acknowledged" : t.status === "acknowledged" ? "in_progress" : "resolved"].label}
                            </Button>
                          ) : (
                            <Badge className="text-[9px] bg-emerald-600 text-white">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Closed
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[9px] justify-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {Math.round((Date.now() - new Date(t.createdAt).getTime()) / 86400000)}d old
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <div className="font-bold flex items-center gap-1.5 mb-1"><AlertCircle className="w-4 h-4 text-amber-600" /> Legal Timelines</div>
              <p>Under the <strong>Model Tenancy Act 2021</strong>, structural repairs must be done within <strong>7 days</strong>, minor repairs within <strong>30 days</strong>, else tenant is entitled to repair-and-adjust-rent remedy.</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4 text-emerald-600" /> Why This Matters</div>
              <p>Ticket timestamps are your legal evidence. If your landlord later claims "you never reported this", the photo + date + status trail wins the argument and protects your security deposit.</p>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default MaintenanceTrackerPage;
