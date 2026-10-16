import React, { useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, ShieldCheck, AlertTriangle, Download, Printer, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  tip: string;
  critical: boolean;
}

const CHECKLIST_DATA: ChecklistItem[] = [
  // 1. Water & Plumbing
  { id: "w1", category: "Water & Plumbing", label: "Adequate Water Pressure in Washroom & Shower", tip: "Turn on both tap and shower simultaneously to verify pump pressure.", critical: true },
  { id: "w2", category: "Water & Plumbing", label: "Geyser / Water Heater Functional & Fast Heating", tip: "Turn on for 5 mins to ensure water turns warm without tripping MCB.", critical: false },
  { id: "w3", category: "Water & Plumbing", label: "Clean Drain Flow with Zero Stagnation", tip: "Pour water in bathroom drain; ensure no slow pool forming.", critical: false },
  { id: "w4", category: "Water & Plumbing", label: "RO Drinking Water Dispenser on Floor", tip: "Check if filters were serviced recently and taste water sample.", critical: true },

  // 2. Electrical & Connectivity
  { id: "e1", category: "Electrical & Connectivity", label: "Power Socket Near Study Desk & Bed Headboard", tip: "Essential for laptop charging without trailing extension cords.", critical: false },
  { id: "e2", category: "Electrical & Connectivity", label: "Strong 4G / 5G Mobile Signal Inside Room", tip: "Check your phone signal bars in all corners with door closed.", critical: true },
  { id: "e3", category: "Electrical & Connectivity", label: "Dedicated Sub-Meter Installed & Transparent Unit Rate", tip: "Ensure owner quotes official state per-unit tariff (usually ₹7-₹9/unit).", critical: true },
  { id: "e4", category: "Electrical & Connectivity", label: "24/7 Power Backup (DG or Inverter for Laptops)", tip: "Verify if AC or only fans/lights run on backup generator.", critical: false },

  // 3. Ventilation & Hygiene
  { id: "v1", category: "Ventilation & Hygiene", label: "Adequate Natural Sunlight & Fresh Air Window", tip: "Vital for physical health and preventing musty smell.", critical: true },
  { id: "v2", category: "Ventilation & Hygiene", label: "Zero Wall Dampness, Seepage, or Paint Peeling", tip: "Inspect baseboards and under window sill for hidden mold.", critical: true },
  { id: "v3", category: "Ventilation & Hygiene", label: "Clean, Odor-Free Mattress & Pest-Free Wardrobe", tip: "Check bed seams and inner wardrobe corners for bedbugs or roaches.", critical: true },

  // 4. Safety & Security
  { id: "s1", category: "Safety & Security", label: "Solid Main Door Latch & Sturdy Internal Room Lock", tip: "Ensure you receive a private key that cannot be opened from outside master key.", critical: true },
  { id: "s2", category: "Safety & Security", label: "CCTV Cameras in Corridors & Entry Gate", tip: "Provides safety for late night returns and package deliveries.", critical: false },
  { id: "s3", category: "Safety & Security", label: "Safe, Well-Lit Access Road at Night", tip: "Ask neighbors or watch street lighting leading up to main road.", critical: true },

  // 5. Financial & Agreement Transparency
  { id: "f1", category: "Financial & Lease Terms", label: "Deposit Refund Terms Stated in Writing (Painting deduction)", tip: "Confirm standard painting deduction does not exceed 1 month rent.", critical: true },
  { id: "f2", category: "Financial & Lease Terms", label: "Notice Period Clearly Fixed at 30 Days", tip: "Avoid contracts demanding 2+ months notice or penalty forfeit.", critical: false }
];

export const InspectionChecklistPage: React.FC = () => {
  const [propertyName, setPropertyName] = useState("Stanza Living / Koramangala Flat");
  const [checkedIds, setCheckedIds] = useState<string[]>(["w1", "w4", "e1", "e2", "v1", "s1"]);

  const toggleItem = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const totalItems = CHECKLIST_DATA.length;
  const passedItems = checkedIds.length;
  const scorePercent = Math.round((passedItems / totalItems) * 100);

  // Critical failure check
  const criticalItems = CHECKLIST_DATA.filter(i => i.critical);
  const missedCritical = criticalItems.filter(i => !checkedIds.includes(i.id));

  let verdictTitle = "High Quality Accommodation";
  let verdictColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  let verdictDesc = "This property meets critical safety, hygiene, and living standards. Safe to proceed with advance token.";

  if (missedCritical.length >= 3 || scorePercent < 55) {
    verdictTitle = "High Risk - Major Deficiencies Found";
    verdictColor = "text-rose-700 bg-rose-50 border-rose-200";
    verdictDesc = `Warning: ${missedCritical.length} critical checkpoints failed (e.g. ${missedCritical.slice(0, 2).map(m => m.label).join(", ")}). Recommend negotiating fixes or inspecting other options.`;
  } else if (missedCritical.length > 0 || scorePercent < 75) {
    verdictTitle = "Moderate - Negotiate Repairs Before Payment";
    verdictColor = "text-amber-800 bg-amber-50 border-amber-200";
    verdictDesc = "Good potential, but has a few unverified critical items. Request the owner to repair or write commitments in lease before paying deposit.";
  }

  const categories = Array.from(new Set(CHECKLIST_DATA.map((i) => i.category)));

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setCheckedIds([]);
    toast.info("Checklist reset");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <ClipboardCheck className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Property Inspection Checklist
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Interactive 15-point verification guide to use during in-person property tours. Avoid surprises after paying your deposit.
            </p>
          </div>

          {/* Sticky Score Banner */}
          <Card className="border-slate-200 shadow-md mb-8 overflow-hidden sticky top-20 z-20 backdrop-blur-md bg-white/95">
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${verdictColor}`}>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scorePercent >= 75 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>{verdictTitle}</span>
                </div>
                <p className="text-xs mt-1 max-w-xl opacity-90 leading-relaxed">{verdictDesc}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black">{scorePercent}%</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {passedItems} of {totalItems} Passed
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1 bg-white">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 text-xs text-slate-500">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Property Name Input */}
          <div className="mb-6 flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-xs font-bold text-slate-700 shrink-0">Inspecting Property:</label>
            <Input
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="text-xs h-8"
              placeholder="e.g. Koramangala 4th Block Room #204"
            />
          </div>

          {/* Categories List */}
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
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item.id)}
                          className={`p-4 flex items-start gap-3.5 cursor-pointer transition ${
                            isChecked ? "bg-violet-50/40" : "hover:bg-slate-50"
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-0.5 data-[state=checked]:bg-violet-600"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold ${isChecked ? "text-violet-900" : "text-slate-800"}`}>
                                {item.label}
                              </span>
                              {item.critical && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  Critical
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              💡 Pro-tip: {item.tip}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default InspectionChecklistPage;
