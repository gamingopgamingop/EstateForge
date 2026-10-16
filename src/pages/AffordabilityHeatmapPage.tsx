import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, Flame, Snowflake, Sun, Filter, ArrowRight, Sparkles, Layers } from "lucide-react";
import { useProperties } from "../contexts/PropertiesContext";

type Bucket = "cheap" | "moderate" | "costly" | "premium";

const BUCKET_META: Record<Bucket, { label: string; color: string; text: string; icon: React.ReactNode; range: string }> = {
  cheap: { label: "Budget Friendly", color: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50 border-emerald-300", icon: <Snowflake className="w-4 h-4" />, range: "< ₹9,000" },
  moderate: { label: "Moderate", color: "bg-amber-400", text: "text-amber-700 bg-amber-50 border-amber-300", icon: <Sun className="w-4 h-4" />, range: "₹9k – ₹14k" },
  costly: { label: "Costly", color: "bg-orange-500", text: "text-orange-700 bg-orange-50 border-orange-300", icon: <Flame className="w-4 h-4" />, range: "₹14k – ₹20k" },
  premium: { label: "Premium", color: "bg-rose-600", text: "text-rose-700 bg-rose-50 border-rose-300", icon: <Flame className="w-4 h-4" />, range: "> ₹20,000" },
};

const bucketize = (avg: number): Bucket =>
  avg < 9000 ? "cheap" : avg < 14000 ? "moderate" : avg < 20000 ? "costly" : "premium";

export const AffordabilityHeatmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { properties, filterProperties } = useProperties();
  const [activeBucket, setActiveBucket] = useState<Bucket | "all">("all");
  const [city, setCity] = useState<string>("all");

  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))).sort(), [properties]);

  // Aggregate locality averages
  const localityAgg = useMemo(() => {
    const map = new Map<string, { city: string; total: number; count: number; rents: number[] }>();
    properties.forEach((p) => {
      if (city !== "all" && p.city !== city) return;
      const key = `${p.locality}||${p.city}`;
      const entry = map.get(key) || { city: p.city, total: 0, count: 0, rents: [] };
      entry.total += p.monthlyRent;
      entry.count += 1;
      entry.rents.push(p.monthlyRent);
      map.set(key, entry);
    });
    return Array.from(map.entries()).map(([key, v]) => ({
      locality: key.split("||")[0],
      city: v.city,
      avgRent: Math.round(v.total / v.count),
      minRent: Math.min(...v.rents),
      maxRent: Math.max(...v.rents),
      count: v.count,
      bucket: bucketize(v.total / v.count),
    }));
  }, [properties, city]);

  const filtered = localityAgg.filter((l) => activeBucket === "all" || l.bucket === activeBucket);
  const sorted = [...filtered].sort((a, b) => a.avgRent - b.avgRent);

  const handleExplore = (localityName: string) => {
    filterProperties({ locality: localityName, availableOnly: true });
    navigate("/properties");
  };

  const bucketCount = (b: Bucket) => localityAgg.filter((l) => l.bucket === b).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5" /> Smart Search Innovation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Affordability Heatmap</h1>
            <p className="text-slate-600 mt-2 text-sm">Visual map of localities colored by average rent. Instantly spot budget-friendly vs premium zones before shortlisting.</p>
          </div>

          {/* Filters */}
          <Card className="border-slate-200 shadow-sm mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Filter className="w-4 h-4 text-violet-600" />
                <span className="font-bold text-slate-700">City:</span>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="h-8 rounded-md border border-slate-300 px-2 text-xs font-semibold">
                  <option value="all">All Cities</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <span className="font-bold text-slate-700 ml-2">Bucket:</span>
                <button onClick={() => setActiveBucket("all")} className={`text-xs font-semibold px-3 py-1 rounded-full border ${activeBucket === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700"}`}>
                  All ({localityAgg.length})
                </button>
                {(Object.keys(BUCKET_META) as Bucket[]).map((b) => (
                  <button key={b} onClick={() => setActiveBucket(b)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${activeBucket === b ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-700"}`}>
                    <span className={`w-2 h-2 rounded-full ${BUCKET_META[b].color}`} />
                    {BUCKET_META[b].label} ({bucketCount(b)})
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                {(Object.keys(BUCKET_META) as Bucket[]).map((b) => (
                  <div key={b} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded ${BUCKET_META[b].color}`} />
                    <span className="font-semibold">{BUCKET_META[b].label}:</span>
                    <span>{BUCKET_META[b].range}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Heatmap tiles */}
          {sorted.length === 0 ? (
            <Card className="p-10 text-center">
              <MapIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No localities match this filter.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sorted.map((l) => {
                const meta = BUCKET_META[l.bucket];
                return (
                  <Card key={`${l.locality}-${l.city}`} className="border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition">
                    <div className={`h-24 relative ${meta.color} p-3 flex flex-col justify-between`}>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-white/80">{l.city}</div>
                        <div className="text-white font-black text-sm leading-tight line-clamp-2">{l.locality}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/80 text-[10px] uppercase font-bold">Avg Rent</div>
                        <div className="text-white text-lg font-black leading-none">₹{l.avgRent.toLocaleString()}</div>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Min / Max</span>
                        <span className="font-semibold text-slate-800">₹{l.minRent.toLocaleString()} – ₹{l.maxRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Listings</span>
                        <span className="font-semibold text-slate-800">{l.count}</span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] w-full justify-center ${meta.text}`}>
                        {meta.icon} {meta.label}
                      </Badge>
                      <Button size="sm" onClick={() => handleExplore(l.locality)} className="w-full h-7 text-[10px] bg-violet-600 hover:bg-violet-700 text-white gap-1 mt-1">
                        Explore <ArrowRight className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-10 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-600" /> Pro Insight</div>
            <p>Localities in the same city can vary by 2-3x in rent. Move 3 km from a premium zone into a moderate zone and save ₹4,000-₹6,000/month without sacrificing metro access. Use the <strong>Commute Calculator</strong> alongside this heatmap to pick areas where rent savings beat the added travel cost.</p>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default AffordabilityHeatmapPage;
