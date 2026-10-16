import React, { useState, useRef } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  Download,
  Printer,
  CheckCircle2,
  RotateCcw,
  Camera,
  ImagePlus,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fileToPhoto, validatePhotoFile, MAX_PHOTOS_PER_LISTING } from "../utils/imageUpload";

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  tip: string;
  critical: boolean;
}

const CHECKLIST_DATA: ChecklistItem[] = [
  { id: "w1", category: "Water & Plumbing", label: "Adequate Water Pressure in Washroom & Shower", tip: "Turn on both tap and shower simultaneously to verify pump pressure.", critical: true },
  { id: "w2", category: "Water & Plumbing", label: "Geyser / Water Heater Functional & Fast Heating", tip: "Turn on for 5 mins to ensure water turns warm without tripping MCB.", critical: false },
  { id: "w3", category: "Water & Plumbing", label: "Clean Drain Flow with Zero Stagnation", tip: "Pour water in bathroom drain; ensure no slow pool forming.", critical: false },
  { id: "w4", category: "Water & Plumbing", label: "RO Drinking Water Dispenser on Floor", tip: "Check if filters were serviced recently and taste water sample.", critical: true },

  { id: "e1", category: "Electrical & Connectivity", label: "Power Socket Near Study Desk & Bed Headboard", tip: "Essential for laptop charging without trailing extension cords.", critical: false },
  { id: "e2", category: "Electrical & Connectivity", label: "Strong 4G / 5G Mobile Signal Inside Room", tip: "Check your phone signal bars in all corners with door closed.", critical: true },
  { id: "e3", category: "Electrical & Connectivity", label: "Dedicated Sub-Meter Installed & Transparent Unit Rate", tip: "Ensure owner quotes official state per-unit tariff (usually ₹7-₹9/unit).", critical: true },
  { id: "e4", category: "Electrical & Connectivity", label: "24/7 Power Backup (DG or Inverter for Laptops)", tip: "Verify if AC or only fans/lights run on backup generator.", critical: false },

  { id: "v1", category: "Ventilation & Hygiene", label: "Adequate Natural Sunlight & Fresh Air Window", tip: "Vital for physical health and preventing musty smell.", critical: true },
  { id: "v2", category: "Ventilation & Hygiene", label: "Zero Wall Dampness, Seepage, or Paint Peeling", tip: "Inspect baseboards and under window sill for hidden mold.", critical: true },
  { id: "v3", category: "Ventilation & Hygiene", label: "Clean, Odor-Free Mattress & Pest-Free Wardrobe", tip: "Check bed seams and inner wardrobe corners for bedbugs or roaches.", critical: true },

  { id: "s1", category: "Safety & Security", label: "Solid Main Door Latch & Sturdy Internal Room Lock", tip: "Ensure you receive a private key that cannot be opened from outside master key.", critical: true },
  { id: "s2", category: "Safety & Security", label: "CCTV Cameras in Corridors & Entry Gate", tip: "Provides safety for late night returns and package deliveries.", critical: false },
  { id: "s3", category: "Safety & Security", label: "Safe, Well-Lit Access Road at Night", tip: "Ask neighbors or watch street lighting leading up to main road.", critical: true },

  { id: "f1", category: "Financial & Lease Terms", label: "Deposit Refund Terms Stated in Writing (Painting deduction)", tip: "Confirm standard painting deduction does not exceed 1 month rent.", critical: true },
  { id: "f2", category: "Financial & Lease Terms", label: "Notice Period Clearly Fixed at 30 Days", tip: "Avoid contracts demanding 2+ months notice or penalty forfeit.", critical: false }
];

const CHECKLIST_STORAGE_KEY = "rentright_checklist_state";

type PhotoProofs = Record<string, { name: string; dataUrl: string }[]>;

export const InspectionChecklistPage: React.FC = () => {
  const [propertyName, setPropertyName] = useState("Stanza Living / Koramangala Flat");
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (saved) { try { return JSON.parse(saved).checked || ["w1", "w4", "e1", "e2", "v1", "s1"]; } catch {} }
    return ["w1", "w4", "e1", "e2", "v1", "s1"];
  });
  const [proofs, setProofs] = useState<PhotoProofs>(() => {
    const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (saved) { try { return JSON.parse(saved).proofs || {}; } catch {} }
    return {};
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const persist = (checked: string[], proofsNext: PhotoProofs) => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify({ checked, proofs: proofsNext }));
    } catch {
      toast.error("Browser storage full — photo proofs kept for this session only.");
    }
  };

  const toggleItem = (id: string) => {
    const next = checkedIds.includes(id) ? checkedIds.filter((x) => x !== id) : [...checkedIds, id];
    setCheckedIds(next);
    persist(next, proofs);
  };

  const handlePhotoUpload = async (itemId: string, file: File) => {
    const err = validatePhotoFile(file);
    if (err) { toast.error(err); return; }
    if ((proofs[itemId]?.length || 0) >= 3) { toast.error("Max 3 photos per checkpoint"); return; }
    try {
      const photo = await fileToPhoto(file);
      const next = { ...proofs, [itemId]: [...(proofs[itemId] || []), { name: photo.name, dataUrl: photo.dataUrl }] };
      setProofs(next);
      persist(checkedIds, next);
      toast.success(`Photo proof attached to checkpoint`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to process photo");
    }
  };

  const removePhoto = (itemId: string, idx: number) => {
    const arr = (proofs[itemId] || []).filter((_, i) => i !== idx);
    const next = { ...proofs, [itemId]: arr };
    if (arr.length === 0) delete next[itemId];
    setProofs(next);
    persist(checkedIds, next);
  };

  const totalItems = CHECKLIST_DATA.length;
  const passedItems = checkedIds.length;
  const scorePercent = Math.round((passedItems / totalItems) * 100);
  const totalPhotos = Object.values(proofs).reduce((s, arr) => s + arr.length, 0);
  const itemsWithPhotos = Object.keys(proofs).length;

  const criticalItems = CHECKLIST_DATA.filter((i) => i.critical);
  const missedCritical = criticalItems.filter((i) => !checkedIds.includes(i.id));

  let verdictTitle = "High Quality Accommodation";
  let verdictColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  let verdictDesc = "This property meets critical safety, hygiene, and living standards. Safe to proceed with advance token.";

  if (missedCritical.length >= 3 || scorePercent < 55) {
    verdictTitle = "High Risk - Major Deficiencies Found";
    verdictColor = "text-rose-700 bg-rose-50 border-rose-200";
    verdictDesc = `Warning: ${missedCritical.length} critical checkpoints failed (e.g. ${missedCritical.slice(0, 2).map((m) => m.label).join(", ")}). Recommend negotiating fixes or inspecting other options.`;
  } else if (missedCritical.length > 0 || scorePercent < 75) {
    verdictTitle = "Moderate - Negotiate Repairs Before Payment";
    verdictColor = "text-amber-800 bg-amber-50 border-amber-200";
    verdictDesc = "Good potential, but has a few unverified critical items. Request the owner to repair or write commitments in lease before paying deposit.";
  }

  const categories = Array.from(new Set(CHECKLIST_DATA.map((i) => i.category)));

  const handlePrint = () => window.print();

  const handleReset = () => {
    setCheckedIds([]);
    setProofs({});
    persist([], {});
    toast.info("Checklist and photo proofs cleared");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <ClipboardCheck className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Property Inspection Checklist <span className="text-violet-600">+ Photo Proof</span>
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Interactive 15-point verification guide with photo evidence capture. Attach visual proof for every checkpoint to defend your deposit later.
            </p>
          </div>

          {/* Sticky Score Banner */}
          <Card className="border-slate-200 shadow-md mb-8 overflow-hidden sticky top-20 z-20 backdrop-blur-md bg-white/95">
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${verdictColor}`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scorePercent >= 75 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  <span>{verdictTitle}</span>
                </div>
                <p className="text-xs mt-1 max-w-xl opacity-90 leading-relaxed">{verdictDesc}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold">
                  <Badge variant="outline" className="bg-white text-[10px]"><Camera className="w-3 h-3 mr-1" /> {totalPhotos} photo proofs across {itemsWithPhotos} checkpoints</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black">{scorePercent}%</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{passedItems} of {totalItems} Passed</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1 bg-white"><Printer className="w-3.5 h-3.5" /> Print</Button>
                  <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 text-xs text-slate-500"><RotateCcw className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-6 flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold text-slate-700 shrink-0">Inspecting Property:</label>
            <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="text-xs h-8" placeholder="e.g. Koramangala 4th Block Room #204" />
          </div>

          <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900">
            <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4 text-violet-600" /> Why Photo Proofs?</div>
            <p>Photos are auto-compressed and stored locally. Attach visual evidence to every passed checkpoint. When the owner claims "wall was already damaged" at move-out, you have timestamped proof to demand a full deposit refund.</p>
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const catItems = CHECKLIST_DATA.filter((i) => i.category === cat);
              return (
                <Card key={cat} className="border-slate-200 shadow-sm">
                  <CardHeader className="py-3 px-5 bg-slate-50/80 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800">{cat}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-slate-100 text-xs">
                    {catItems.map((item) => {
                      const isChecked = checkedIds.includes(item.id);
                      const photos = proofs[item.id] || [];
                      return (
                        <div key={item.id} className={`p-4 ${isChecked ? "bg-violet-50/40" : "hover:bg-slate-50"}`}>
                          <div className="flex items-start gap-3.5 cursor-pointer" onClick={() => toggleItem(item.id)}>
                            <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(item.id)} className="mt-0.5 data-[state=checked]:bg-violet-600" />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-semibold ${isChecked ? "text-violet-900" : "text-slate-800"}`}>{item.label}</span>
                                {item.critical && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Critical</span>}
                                {photos.length > 0 && (
                                  <Badge variant="outline" className="text-[9px] text-violet-700 border-violet-300 bg-violet-50">
                                    <Camera className="w-3 h-3 mr-1" /> {photos.length} photo{photos.length > 1 ? "s" : ""}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 italic">💡 Pro-tip: {item.tip}</p>
                            </div>
                          </div>

                          {/* Photo upload strip */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 flex-wrap">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[item.id] = el; }}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(item.id, f); e.target.value = ""; }}
                            />
                            <Button size="sm" variant="outline" onClick={() => fileInputRefs.current[item.id]?.click()}
                              disabled={photos.length >= 3}
                              className="h-7 text-[10px] gap-1 border-violet-200 text-violet-700 hover:bg-violet-50">
                              <ImagePlus className="w-3 h-3" /> Attach Photo Proof
                            </Button>

                            {photos.map((ph, idx) => (
                              <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-violet-200 shadow-sm">
                                <img src={ph.dataUrl} alt={ph.name} className="w-full h-full object-cover" />
                                <button
                                  onClick={() => removePhoto(item.id, idx)}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition grid place-items-center"
                                  title="Remove photo"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="border-slate-200 shadow-md mt-8">
            <CardHeader className="py-3 bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Move-in Evidence Report</CardTitle>
              <CardDescription className="text-[11px]">Snapshot to save/print and handover to owner</CardDescription>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Property</span><span className="font-bold text-slate-900">{propertyName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Checkpoints Passed</span><span className="font-bold text-emerald-700">{passedItems}/{totalItems} ({scorePercent}%)</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Critical Failures</span><span className={`font-bold ${missedCritical.length ? "text-rose-700" : "text-emerald-700"}`}>{missedCritical.length === 0 ? "None" : missedCritical.map((m) => m.label).join(", ")}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Photo Evidence Attached</span><span className="font-bold text-violet-700">{totalPhotos} photos on {itemsWithPhotos} checkpoints</span></div>
            </CardContent>
          </Card>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default InspectionChecklistPage;
