import React, { useMemo, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Package,
  Sofa,
  Home,
  IndianRupee,
  Sparkles,
  Zap,
  Ruler,
  MapPin,
  Users,
  Timer,
  Download,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type MoveSize = "studio" | "1BHK" | "2BHK" | "3BHK" | "PG Room" | "Villa";

const SIZE_META: Record<MoveSize, { baseCost: number; hours: number; items: string; truck: string; icon: React.ReactNode }> = {
  "PG Room": { baseCost: 2500, hours: 3, items: "1 mattress, 1 trunk, 3 boxes, small fan", truck: "32-foot tempo", icon: <Package className="w-4 h-4" /> },
  studio: { baseCost: 4500, hours: 4, items: "Twin bed, wardrobe, fridge, boxes", truck: "40-foot container", icon: <Package className="w-4 h-4" /> },
  "1BHK": { baseCost: 6500, hours: 5, items: "King bed, sofa, fridge, washing machine, boxes", truck: "70-foot truck", icon: <Home className="w-4 h-4" /> },
  "2BHK": { baseCost: 9500, hours: 7, items: "2 beds, dining set, 2 ACs, fridge, WM, boxes", truck: "Full-size 20-foot", icon: <Sofa className="w-4 h-4" /> },
  "3BHK": { baseCost: 14500, hours: 9, items: "3 beds, big sofa, 3 ACs, kitchen set, boxes", truck: "Two 20-foot trucks", icon: <Home className="w-4 h-4" /> },
  Villa: { baseCost: 22000, hours: 12, items: "Full household with garden furniture", truck: "3+ trucks", icon: <Home className="w-4 h-4" /> },
};

type CityTier = 1 | 2 | 3;
const CITY_TIERS: { city: string; tier: CityTier; multiplier: number }[] = [
  { city: "Mumbai", tier: 1, multiplier: 1.35 },
  { city: "Delhi NCR", tier: 1, multiplier: 1.20 },
  { city: "Bengaluru", tier: 1, multiplier: 1.15 },
  { city: "Hyderabad", tier: 1, multiplier: 1.10 },
  { city: "Pune", tier: 1, multiplier: 1.05 },
  { city: "Chennai", tier: 1, multiplier: 1.05 },
  { city: "Kolkata", tier: 2, multiplier: 0.95 },
  { city: "Ahmedabad", tier: 2, multiplier: 0.90 },
  { city: "Jaipur", tier: 2, multiplier: 0.85 },
  { city: "Lucknow", tier: 2, multiplier: 0.80 },
  { city: "Gwalior", tier: 3, multiplier: 0.70 },
  { city: "Mathura / Vrindavan", tier: 3, multiplier: 0.65 },
];

export const MovingCostEstimatorPage: React.FC = () => {
  const [fromCity, setFromCity] = useState("Bengaluru");
  const [toCity, setToCity] = useState("Bengaluru");
  const [size, setSize] = useState<MoveSize>("1BHK");
  const [distanceKm, setDistanceKm] = useState<number>(15);
  const [packersMovers, setPackersMovers] = useState<"Full" | "Partial" | "Labor Only">("Partial");
  const [insurance, setInsurance] = useState(true);
  const [floor, setFloor] = useState<number>(2);
  const [hasLift, setHasLift] = useState(true);
  const [moveDate, setMoveDate] = useState("2026-11-15");
  const [includeCleaning, setIncludeCleaning] = useState(true);

  const estimate = useMemo(() => {
    const meta = SIZE_META[size];
    const from = CITY_TIERS.find((c) => c.city === fromCity) || { multiplier: 1 };
    const to = CITY_TIERS.find((c) => c.city === toCity) || { multiplier: 1 };
    const cityAvg = (from.multiplier + to.multiplier) / 2;
    const isIntercity = fromCity !== toCity;

    // base
    let cost = meta.baseCost * cityAvg;
    // distance surcharge (within city: 0-30km; intercity: km×₹18)
    cost += isIntercity ? distanceKm * 18 : Math.max(0, distanceKm - 10) * 25;
    // service level
    const serviceFactor = packersMovers === "Full" ? 1.35 : packersMovers === "Partial" ? 1.10 : 0.85;
    cost *= serviceFactor;
    // insurance
    const insuranceCost = insurance ? Math.round(cost * 0.03) : 0;
    cost += insuranceCost;
    // floor surcharge (no lift)
    const floorSurcharge = !hasLift && floor > 0 ? floor * 400 : 0;
    cost += floorSurcharge;
    // deep cleaning
    const cleaningCost = includeCleaning ? Math.round(meta.baseCost * 0.15) : 0;
    cost += cleaningCost;

    return {
      total: Math.round(cost),
      breakdown: [
        { label: `Truck & manpower (${meta.truck})`, value: Math.round(meta.baseCost * cityAvg) },
        { label: `Distance (${distanceKm} km · ${isIntercity ? "intercity" : "intra-city"})`, value: Math.round(isIntercity ? distanceKm * 18 : Math.max(0, distanceKm - 10) * 25) },
        { label: `${packersMovers} service multiplier`, value: Math.round(meta.baseCost * cityAvg * (serviceFactor - 1)) },
        { label: "Transit insurance (3%)", value: insuranceCost },
        { label: !hasLift ? `Stairs surcharge (floor ${floor})` : "Lift available – no stairs fee", value: floorSurcharge },
        { label: includeCleaning ? "Move-out deep cleaning" : "Cleaning skipped", value: cleaningCost },
      ].filter((b) => b.value !== 0),
      durationHours: meta.hours + Math.ceil(distanceKm / 20),
      typicalItems: meta.items,
      truck: meta.truck,
      isIntercity,
    };
  }, [size, fromCity, toCity, distanceKm, packersMovers, insurance, floor, hasLift, includeCleaning]);

  const exportSummary = () => {
    toast.success(`Moving cost exported: ₹${estimate.total.toLocaleString()} · ${estimate.durationHours}h · ${estimate.truck}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Truck className="w-3.5 h-3.5" /> Move-in Innovation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Moving Cost Estimator</h1>
            <p className="text-slate-600 mt-2 text-sm">Plan your relocation budget before paying deposit. Fair-pricing heuristics for Indian packers & movers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 border-slate-200 shadow-sm">
              <CardHeader className="py-3"><CardTitle className="text-sm font-bold">Move Details</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1"><MapPin className="w-3 h-3 inline mr-1" />From</label>
                    <Select value={fromCity} onValueChange={setFromCity}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{CITY_TIERS.map((c) => <SelectItem key={c.city} value={c.city} className="text-xs">{c.city}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1"><MapPin className="w-3 h-3 inline mr-1" />To</label>
                    <Select value={toCity} onValueChange={setToCity}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{CITY_TIERS.map((c) => <SelectItem key={c.city} value={c.city} className="text-xs">{c.city}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1"><Home className="w-3 h-3 inline mr-1" />House Size</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(SIZE_META) as MoveSize[]).map((s) => (
                      <button key={s} onClick={() => setSize(s)}
                        className={`py-1.5 rounded-md text-[10px] font-bold border ${size === s ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 text-slate-700"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1"><Ruler className="w-3 h-3 inline mr-1" />Distance: {distanceKm} km</label>
                  <Slider value={[distanceKm]} min={1} max={estimate.isIntercity ? 1200 : 60} step={1} onValueChange={(v) => setDistanceKm(v[0])} />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Service Level</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Labor Only", "Partial", "Full"] as const).map((s) => (
                      <button key={s} onClick={() => setPackersMovers(s)}
                        className={`py-1.5 rounded-md text-[10px] font-bold border ${packersMovers === s ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 text-slate-700"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Floor</label>
                    <Input type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} className="h-8 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Move Date</label>
                    <Input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasLift} onChange={(e) => setHasLift(e.target.checked)} className="accent-violet-600" />
                    <span className="font-semibold text-slate-800">Building has lift</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="accent-violet-600" />
                    <span className="font-semibold text-slate-800">Transit insurance (3%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={includeCleaning} onChange={(e) => setIncludeCleaning(e.target.checked)} className="accent-violet-600" />
                    <span className="font-semibold text-slate-800">Add move-out deep cleaning</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-4">
              <Card className="border-slate-200 shadow-md overflow-hidden">
                <CardHeader className="py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold">Estimated Moving Cost</CardTitle>
                      <CardDescription className="text-[10px]">{SIZE_META[size].truck} · {SIZE_META[size].items}</CardDescription>
                    </div>
                    <Button size="sm" onClick={exportSummary} variant="outline" className="h-7 text-[10px] gap-1"><Download className="w-3 h-3" /> Export</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center py-5">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Total Estimate</div>
                    <div className="text-5xl font-black text-violet-900 mt-1">₹{estimate.total.toLocaleString()}</div>
                    <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-blue-600" /> {estimate.durationHours} hrs</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600" /> 4-6 movers</span>
                      <Badge variant="outline" className="text-[9px]">{estimate.isIntercity ? "Intercity" : "Intra-city"}</Badge>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cost Breakdown</div>
                    {estimate.breakdown.map((b, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                        <span className="text-slate-700">{b.label}</span>
                        <span className="font-bold text-slate-900">₹{b.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3"><CardTitle className="text-sm font-bold flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-600" /> Cost-Saving Tips</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">💡 Book <strong>weekday morning slots</strong> (Tue-Thu 8-11 AM). Weekend premiums are 20-30% higher.</div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">💡 Declutter before movers arrive. Every unused item = ₹150-₹400 extra.</div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">💡 Ask for <strong>Labor Only</strong> if you can rent a self-drive truck from BOLT/Zoomcar.</div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">💡 Insurance is only worth it if you own electronics worth ₹50k+.</div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">💡 Combine move-out cleaning with your rental inspection to lock deposit refund.</div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Move-in Budget Checklist:</strong> Brokerage (₹15k-₹30k) + Security deposit (2× rent) + First month rent + Moving cost (this estimate) + Appliances setup + New furniture = Realistic buffer should be <strong>4.5× monthly rent</strong>. Use the Affordability Calculator to plan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default MovingCostEstimatorPage;
