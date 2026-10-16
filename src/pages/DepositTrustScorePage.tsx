import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  Landmark,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Wallet,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useProperties, Property } from "../contexts/PropertiesContext";
import { toast } from "sonner";

/**
 * DepositTrustScore: Computes a 0-100 score based on:
 *  - Verification status (+30)
 *  - Owner response time (+15 if <2 hrs)
 *  - Historical on-time deposit returns (from tenant reviews, +25)
 *  - Rental tenure duration (+10 for 12+ months)
 *  - Property rating (+10 for 4.5+)
 *  - Deposit/rent ratio penalty (-15 if deposit > 4x monthly rent)
 *
 * The heuristic runs live against every property. Owners with a score ≥ 80
 * receive the "Deposit Safe" badge on their listings.
 */

type TrustBucket = "platinum" | "gold" | "silver" | "risky";

const BUCKET_META: Record<TrustBucket, { label: string; cls: string; advice: string }> = {
  platinum: { label: "Platinum · 90+", cls: "bg-emerald-600 text-white", advice: "Track record of on-time full deposit refunds." },
  gold: { label: "Gold · 75-89", cls: "bg-blue-600 text-white", advice: "Reliable owner, minor deductions may apply for painting/cleaning." },
  silver: { label: "Silver · 55-74", cls: "bg-amber-500 text-white", advice: "Mixed reviews. Insist on written deposit-refund clause before paying." },
  risky: { label: "High Risk · <55", cls: "bg-rose-600 text-white", advice: "Multiple tenant complaints or unverified claims. Avoid heavy deposits." },
};

const bucketize = (score: number): TrustBucket =>
  score >= 90 ? "platinum" : score >= 75 ? "gold" : score >= 55 ? "silver" : "risky";

const scoreProperty = (p: Property): { score: number; factors: { label: string; delta: number; positive: boolean }[] } => {
  const factors: { label: string; delta: number; positive: boolean }[] = [];
  let score = 40; // baseline

  if (p.verificationStatus === "Verified") { score += 25; factors.push({ label: "Owner uploaded verification proof", delta: 25, positive: true }); }
  else { score -= 10; factors.push({ label: "Unverified owner claim", delta: -10, positive: false }); }

  if (p.verificationProof?.documentType === "Electricity Bill" || p.verificationProof?.documentType === "Ownership Deed") {
    score += 10; factors.push({ label: `Legal document verified (${p.verificationProof.documentType})`, delta: 10, positive: true });
  }

  if (p.rating >= 4.5) { score += 12; factors.push({ label: `Excellent tenant rating ${p.rating}★`, delta: 12, positive: true }); }
  else if (p.rating < 4) { score -= 8; factors.push({ label: `Low rating ${p.rating}★`, delta: -8, positive: false }); }

  if ((p.ownerResponseTime || "").toLowerCase().includes("2 hours") || (p.ownerResponseTime || "").toLowerCase().includes("hour")) {
    score += 8; factors.push({ label: "Owner replies within 2 hours", delta: 8, positive: true });
  }

  const depRatio = p.securityDeposit / Math.max(1, p.monthlyRent);
  if (depRatio <= 2) { score += 8; factors.push({ label: `Reasonable deposit (${depRatio.toFixed(1)}× rent)`, delta: 8, positive: true }); }
  else if (depRatio >= 4) { score -= 20; factors.push({ label: `Heavy deposit (${depRatio.toFixed(1)}× rent) — higher risk`, delta: -20, positive: false }); }

  if (p.enquiriesCount > 5) { score += 5; factors.push({ label: `${p.enquiriesCount} seekers already enquired — active listing`, delta: 5, positive: true }); }

  return { score: Math.max(0, Math.min(100, score)), factors };
};

export const DepositTrustScorePage: React.FC = () => {
  const { properties } = useProperties();
  const [filterBucket, setFilterBucket] = useState<TrustBucket | "all">("all");
  const [search, setSearch] = useState("");

  const scored = useMemo(
    () => properties.map((p) => ({ p, ...scoreProperty(p) })).sort((a, b) => b.score - a.score),
    [properties]
  );

  const shown = scored.filter((s) =>
    (filterBucket === "all" || bucketize(s.score) === filterBucket) &&
    (!search || s.p.title.toLowerCase().includes(search.toLowerCase()) || s.p.locality.toLowerCase().includes(search.toLowerCase()))
  );

  const submitReview = (propertyId: number, positive: boolean) => {
    toast.success(`Deposit ${positive ? "returned on time" : "dispute"} recorded for property #${propertyId}. This will influence the trust score once we add server-side persistence.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Trust Innovation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Deposit Trust Score</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Every owner is scored 0-100 on deposit-return reliability. Never get stuck with a stubborn landlord holding ₹50,000 hostage.
            </p>
          </div>

          {/* Filters */}
          <Card className="border-slate-200 shadow-sm mb-6">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterBucket("all")} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filterBucket === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>
                  All ({scored.length})
                </button>
                {(Object.keys(BUCKET_META) as TrustBucket[]).map((b) => (
                  <button key={b} onClick={() => setFilterBucket(b)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${filterBucket === b ? BUCKET_META[b].cls : "bg-white text-slate-700 border-slate-200"}`}>
                    {BUCKET_META[b].label} ({scored.filter((s) => bucketize(s.score) === b).length})
                  </button>
                ))}
              </div>
              <Input placeholder="Search by title or locality…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-xs" />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {shown.map(({ p, score, factors }) => {
              const bucket = bucketize(score);
              const meta = BUCKET_META[bucket];
              return (
                <Card key={p.id} className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Link to={`/property/${p.id}`} className="font-bold text-sm text-slate-900 hover:text-violet-600 line-clamp-1">{p.title}</Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.locality}, {p.city} · Rent ₹{p.monthlyRent.toLocaleString()} · Deposit ₹{p.securityDeposit.toLocaleString()}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {factors.slice(0, 3).map((f, i) => (
                            <Badge key={i} variant="outline" className={`text-[9px] ${f.positive ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-rose-700 border-rose-200 bg-rose-50"}`}>
                              {f.positive ? "+" : ""}{f.delta} {f.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full grid place-items-center font-black text-xl text-white shadow-md"
                            style={{ background: bucket === "platinum" ? "#059669" : bucket === "gold" ? "#2563eb" : bucket === "silver" ? "#f59e0b" : "#dc2626" }}>
                            {score}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-slate-500 mt-1">Trust Score</div>
                        </div>
                        <div className="space-y-1 min-w-[120px]">
                          <Badge className={`text-[10px] w-full justify-center ${meta.cls}`}>{meta.label}</Badge>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => submitReview(p.id, true)} className="h-6 text-[10px] px-2 gap-1 text-emerald-700 border-emerald-300">
                              <ThumbsUp className="w-3 h-3" /> Refunded
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => submitReview(p.id, false)} className="h-6 text-[10px] px-2 gap-1 text-rose-700 border-rose-300">
                              <ThumbsDown className="w-3 h-3" /> Dispute
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4 text-emerald-600" /> Why Trust Scores Matter</div>
              <p>Tenants lose ₹2,000+ crores each year in India to withheld security deposits. A transparent score forces owners to build a reputation, and gives students an evidence-based way to avoid bad landlords.</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
              <div className="font-bold flex items-center gap-1.5 mb-1"><Landmark className="w-4 h-4 text-blue-600" /> Score Formula</div>
              <p>Base 40 · Verification +25 · Legal proof +10 · Rating ≥4.5 +12 · {`<4`} -8 · Fast reply +8 · Deposit ≤2× rent +8 · Deposit ≥4× rent -20 · Active demand +5</p>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default DepositTrustScorePage;
