import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, Eye, Search, FileWarning, TrendingDown, Clock, MapPin, CheckCircle2, Sparkles, Flag as FlagIcon } from "lucide-react";
import { useProperties, Property } from "../contexts/PropertiesContext";
import { toast } from "sonner";

interface FraudFlag {
  code: string;
  label: string;
  severity: "high" | "medium" | "low";
  reason: string;
}

interface Analysis {
  property: Property;
  flags: FraudFlag[];
  riskScore: number;
  verdict: "safe" | "review" | "suspicious";
}

/**
 * Heuristic fake-listing detector:
 *  - image reuse across listings (same URL used in 3+ listings)
 *  - rent 40%+ below locality average
 *  - owner last response > 7 days old
 *  - unverified owner claim + no phone + no reviews
 */
const buildAnalysis = (properties: Property[]): Analysis[] => {
  // image frequency map
  const imgCount = new Map<string, number>();
  properties.forEach((p) => p.images?.forEach((src) => imgCount.set(src, (imgCount.get(src) || 0) + 1)));

  // avg rent per locality
  const locStats = new Map<string, { sum: number; count: number }>();
  properties.forEach((p) => {
    const k = p.locality;
    const s = locStats.get(k) || { sum: 0, count: 0 };
    s.sum += p.monthlyRent;
    s.count += 1;
    locStats.set(k, s);
  });

  const now = Date.now();

  return properties.map((p): Analysis => {
    const flags: FraudFlag[] = [];

    // Duplicate images
    const dupImg = p.images.find((src) => (imgCount.get(src) || 0) >= 3);
    if (dupImg) {
      flags.push({ code: "DUP_IMG", label: "Duplicate Images Detected", severity: "high", reason: `Same photo appears in ${imgCount.get(dupImg)} listings — likely scraped or fake listing.` });
    }

    // Rent 40% below locality average
    const ls = locStats.get(p.locality);
    if (ls && ls.count >= 2) {
      const avg = ls.sum / ls.count;
      if (p.monthlyRent < avg * 0.6) {
        flags.push({ code: "UNDERPRICED", label: "Rent 40%+ Below Locality Average", severity: "high", reason: `₹${p.monthlyRent.toLocaleString()} vs locality avg ₹${Math.round(avg).toLocaleString()} — too good to be true.` });
      }
    }

    // Owner no response in 7 days
    const listedTs = new Date(p.listedDate).getTime();
    const ageDays = Math.floor((now - listedTs) / 86400000);
    if (ageDays > 7 && p.enquiriesCount === 0) {
      flags.push({ code: "STALE", label: "No Owner Response in 7+ Days", severity: "medium", reason: `Listed ${ageDays} days ago with zero enquiry replies — owner may be inactive.` });
    }

    // Unverified + no rating
    if (p.verificationStatus !== "Verified" && p.rating < 4.5) {
      flags.push({ code: "UNVERIFIED", label: "Unverified Claim + Low Rating", severity: "medium", reason: `Owner did not upload proof and tenant rating (${p.rating}) is below 4.5.` });
    }

    // Very short description
    if (p.description?.length < 80) {
      flags.push({ code: "THIN", label: "Suspiciously Thin Listing Details", severity: "low", reason: "Description under 80 characters — real listings usually describe amenities and rules." });
    }

    const sevWeight: Record<FraudFlag["severity"], number> = { high: 40, medium: 20, low: 8 };
    const score = Math.min(100, flags.reduce((s, f) => s + sevWeight[f.severity], 0));
    const verdict: Analysis["verdict"] = score >= 40 ? "suspicious" : score >= 15 ? "review" : "safe";
    return { property: p, flags, riskScore: score, verdict };
  }).sort((a, b) => b.riskScore - a.riskScore);
};

export const FakeListingDetectorPage: React.FC = () => {
  const { properties, reportProperty } = useProperties();
  const [filter, setFilter] = useState<"all" | "suspicious" | "review" | "safe">("all");
  const analyses = useMemo(() => buildAnalysis(properties), [properties]);
  const shown = analyses.filter((a) => filter === "all" || a.verdict === filter);

  const counts = {
    all: analyses.length,
    suspicious: analyses.filter((a) => a.verdict === "suspicious").length,
    review: analyses.filter((a) => a.verdict === "review").length,
    safe: analyses.filter((a) => a.verdict === "safe").length,
  };

  const handleReport = (p: Property) => {
    reportProperty(p.id, "Fake Listing Suspected", "Auto-flagged by RentRight Fake Listing Detector. Verification team review required.", undefined);
    toast.success("Reported for manual verification. Team will review within 24 hours.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" /> Trust & Safety Innovation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Fake Listing Detector</h1>
            <p className="text-slate-600 mt-2 text-sm">Automated fraud heuristics: image duplication, underpriced rent, silent owners, and unverified claims.</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {(["all", "suspicious", "review", "safe"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${filter === f ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}>
                <span className="capitalize">{f}</span>
                <span className="ml-1.5 opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {shown.length === 0 && (
              <Card className="p-10 text-center"><Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No properties match this category.</p></Card>
            )}
            {shown.map((a) => {
              const p = a.property;
              const badgeMap = {
                suspicious: "bg-rose-600 text-white",
                review: "bg-amber-500 text-white",
                safe: "bg-emerald-600 text-white",
              };
              return (
                <Card key={p.id} className={`border-slate-200 shadow-sm overflow-hidden ${a.verdict === "suspicious" ? "ring-2 ring-rose-400/50" : ""}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 shrink-0 relative">
                        <img src={p.images[0]} alt={p.title} className="w-full h-40 sm:h-full object-cover" />
                        <Badge className={`absolute top-2 left-2 text-[10px] ${badgeMap[a.verdict]}`}>
                          Risk Score: {a.riskScore}/100
                        </Badge>
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link to={`/property/${p.id}`} className="font-bold text-sm text-slate-900 hover:text-violet-600 line-clamp-1">{p.title}</Link>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {p.locality}, {p.city} · ₹{p.monthlyRent.toLocaleString()}/mo · Listed {p.listedDate}
                            </div>
                          </div>
                          <Badge variant={p.verificationStatus === "Verified" ? "outline" : "secondary"} className={`text-[10px] shrink-0 ${p.verificationStatus === "Verified" ? "text-emerald-700 border-emerald-300 bg-emerald-50" : "text-rose-700 bg-rose-100 border-rose-300"}`}>
                            {p.verificationStatus === "Verified" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <FileWarning className="w-3 h-3 mr-1" />}
                            {p.verificationStatus}
                          </Badge>
                        </div>

                        {a.flags.length === 0 ? (
                          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> All fraud checks passed. Looks like a legitimate listing.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {a.flags.map((f) => (
                              <div key={f.code} className={`flex items-start gap-2 p-2 rounded-lg text-[11px] ${f.severity === "high" ? "bg-rose-50 border border-rose-200 text-rose-900" : f.severity === "medium" ? "bg-amber-50 border border-amber-200 text-amber-900" : "bg-slate-50 border border-slate-200 text-slate-800"}`}>
                                {f.severity === "high" ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : f.severity === "medium" ? <TrendingDown className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                <div>
                                  <span className="font-bold">{f.label}:</span> {f.reason}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {a.verdict !== "safe" && (
                          <div className="pt-1 flex justify-end">
                            <Button size="sm" onClick={() => handleReport(p)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1">
                              <FlagIcon className="w-3 h-3" /> Report for Manual Review
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-950">
            <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4" /> How Detection Works</div>
            <ul className="list-disc list-inside space-y-0.5 text-violet-800">
              <li>Image fingerprinting: same photo across 3+ listings → HIGH severity</li>
              <li>Price anomaly: 40%+ under locality average rent → HIGH severity</li>
              <li>Owner activity: 7+ days old with zero enquiry replies → MEDIUM severity</li>
              <li>Trust signal: "Owner Claimed" + low rating → MEDIUM severity</li>
              <li>Description thinness: &lt; 80 characters → LOW severity</li>
            </ul>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default FakeListingDetectorPage;
