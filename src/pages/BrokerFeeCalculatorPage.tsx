import React, { useMemo, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IndianRupee,
  Calculator,
  TrendingUp,
  PiggyBank,
  Scale,
  AlertCircle,
  CheckCircle2,
  Handshake,
  Wallet,
  Sparkles,
  Percent,
} from "lucide-react";

type CityRegime = {
  city: string;
  defaultBrokerPct: number; // percentage of annual rent
  typicalMode: "1 month" | "15 days" | "% of annual" | "Flat ₹";
  note: string;
};

const CITY_REGIMES: CityRegime[] = [
  { city: "Bengaluru", defaultBrokerPct: 8.33, typicalMode: "1 month", note: "Standard 1 month rent as brokerage, negotiable to 15 days for direct-owner listings." },
  { city: "Mumbai", defaultBrokerPct: 10, typicalMode: "1 month", note: "1 month is customary in Mumbai, sometimes 15 days for suburban PGs." },
  { city: "Delhi NCR", defaultBrokerPct: 5, typicalMode: "15 days", note: "Gurgaon/Noida commonly charge half a month to full month." },
  { city: "Hyderabad", defaultBrokerPct: 7, typicalMode: "1 month", note: "Typically 1 month in Hitec / Gachibowli, less in older localities." },
  { city: "Pune", defaultBrokerPct: 6, typicalMode: "15 days", note: "Half month is common for PGs and 1 month for family flats." },
  { city: "Chennai", defaultBrokerPct: 5, typicalMode: "15 days", note: "Chennai brokers are relatively cheaper – often 15 days." },
  { city: "Kolkata", defaultBrokerPct: 4, typicalMode: "15 days", note: "Kolkata brokers accept 20-30 days equivalent." },
  { city: "Mathura / Vrindavan", defaultBrokerPct: 3, typicalMode: "Flat ₹", note: "Local brokers quote ₹2,000-₹5,000 flat for PG rooms near GLA / Chaitanya." },
];

export const BrokerFeeCalculatorPage: React.FC = () => {
  const [city, setCity] = useState("Bengaluru");
  const [monthlyRent, setMonthlyRent] = useState(18000);
  const [customPct, setCustomPct] = useState<number | null>(null);
  const [useNoBroker, setUseNoBroker] = useState(false);
  const [noBrokerSubscription, setNoBrokerSubscription] = useState(1999);

  const regime = CITY_REGIMES.find((c) => c.city === city)!;
  const effectivePct = customPct ?? regime.defaultBrokerPct;

  const { brokerFee, savingsIfDirect, effectiveMonthCost, firstMonthTotal } = useMemo(() => {
    // Standard convention: brokerage = pct of 12 months annual rent OR 1 month (whichever is smaller in some cities)
    const annualRent = monthlyRent * 12;
    const fee = Math.round((annualRent * effectivePct) / 100);
    const savings = useNoBroker ? fee - noBrokerSubscription : 0;
    const deposit = monthlyRent * 2; // typical 2-month deposit
    const first = useNoBroker
      ? monthlyRent + deposit + noBrokerSubscription
      : monthlyRent + deposit + fee;
    return { brokerFee: fee, savingsIfDirect: savings, effectiveMonthCost: Math.round(fee / 12), firstMonthTotal: first };
  }, [monthlyRent, effectivePct, useNoBroker, noBrokerSubscription]);

  const cityComparison = CITY_REGIMES.map((c) => ({
    city: c.city,
    fee: Math.round((monthlyRent * 12 * c.defaultBrokerPct) / 100),
  }));
  const maxFee = Math.max(...cityComparison.map((x) => x.fee));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Percent className="w-3.5 h-3.5" /> Cost Transparency
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Broker Fee vs No-Broker Calculator</h1>
            <p className="text-slate-600 mt-2 text-sm">Compare the real cost of a broker-mediated rental vs RentRight's direct-owner Safe Contact flow.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 border-slate-200 shadow-sm">
              <CardHeader className="py-3"><CardTitle className="text-sm font-bold">Inputs</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">City</label>
                  <Select value={city} onValueChange={(v) => { setCity(v); setCustomPct(null); }}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITY_REGIMES.map((c) => <SelectItem key={c.city} value={c.city} className="text-xs">{c.city}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-500 mt-1">{regime.note}</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Monthly Rent: ₹{monthlyRent.toLocaleString()}</label>
                  <Slider
                    value={[monthlyRent]}
                    min={3000}
                    max={80000}
                    step={500}
                    onValueChange={(v) => setMonthlyRent(v[0])}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Brokerage: {customPct ? `${customPct}% (custom)` : `${regime.defaultBrokerPct}% (${regime.typicalMode})`}
                  </label>
                  <div className="flex gap-1.5">
                    <Input type="number" placeholder={`${regime.defaultBrokerPct}`} value={customPct ?? ""} onChange={(e) => setCustomPct(e.target.value ? Number(e.target.value) : null)} className="h-8 text-xs" />
                    {customPct !== null && <Button size="sm" variant="outline" onClick={() => setCustomPct(null)} className="h-8 text-[10px]">Reset</Button>}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useNoBroker} onChange={(e) => setUseNoBroker(e.target.checked)} className="accent-violet-600" />
                    <span className="font-bold text-xs text-slate-800">Use RentRight Direct (No Broker)</span>
                  </label>
                  {useNoBroker && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">RentRight Premium Subscription</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">₹</span>
                        <Input type="number" value={noBrokerSubscription} onChange={(e) => setNoBrokerSubscription(Number(e.target.value))} className="h-8 text-xs" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">One-time subscription to unlock unlimited direct-owner enquiries.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-7 space-y-4">
              <Card className="border-slate-200 shadow-md overflow-hidden">
                <CardHeader className="py-3 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-slate-200">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Wallet className="w-4 h-4 text-rose-600" /> Cost Breakdown</CardTitle>
                  <CardDescription className="text-[10px]">Compare paying a broker vs using RentRight Safe Contact</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3 py-3">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-[9px] uppercase font-bold text-rose-600">Traditional Broker</div>
                      <div className="text-2xl font-black text-rose-900 mt-1">₹{brokerFee.toLocaleString()}</div>
                      <div className="text-[10px] text-rose-700 mt-1">One-time · Effective ₹{effectiveMonthCost.toLocaleString()}/mo over 12 months</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[9px] uppercase font-bold text-emerald-600">RentRight Direct</div>
                      <div className="text-2xl font-black text-emerald-900 mt-1">₹{useNoBroker ? noBrokerSubscription.toLocaleString() : brokerFee.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-700 mt-1">{useNoBroker ? "Subscription only · Zero brokerage" : "Enable no-broker toggle to see savings"}</div>
                    </div>
                  </div>

                  {useNoBroker && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-300 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="text-[10px] uppercase font-bold text-emerald-700">You Save</div>
                            <div className="text-3xl font-black text-emerald-900">₹{savingsIfDirect.toLocaleString()}</div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {Math.round((savingsIfDirect / brokerFee) * 100)}% cheaper
                        </Badge>
                      </div>
                      <p className="text-[11px] text-emerald-900 mt-2">Money saved can cover 2-3 months of groceries or your entire annual travel fund.</p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Rent</span>
                      <span className="font-bold text-slate-900">₹{monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Security Deposit (2 months)</span>
                      <span className="font-bold text-slate-900">₹{(monthlyRent * 2).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{useNoBroker ? "RentRight Subscription" : "Brokerage"}</span>
                      <span className={`font-bold ${useNoBroker ? "text-emerald-700" : "text-rose-700"}`}>₹{(useNoBroker ? noBrokerSubscription : brokerFee).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800">Total First Month</span>
                      <span className="font-black text-lg text-violet-700">₹{firstMonthTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* City comparison bars */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Scale className="w-4 h-4 text-blue-600" /> Same Rent Across Cities</CardTitle>
                  <CardDescription className="text-[10px]">What a broker would charge for ₹{monthlyRent.toLocaleString()}/mo in each city</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5">
                  {cityComparison.sort((a, b) => b.fee - a.fee).map((c) => (
                    <div key={c.city} className="flex items-center gap-2">
                      <div className="w-32 text-[10px] font-semibold text-slate-700 shrink-0">{c.city}</div>
                      <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                        <div className="h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white rounded-md transition-all"
                          style={{ width: `${Math.max(10, (c.fee / maxFee) * 100)}%`, background: c.city === city ? "#7c3aed" : "#94a3b8" }}>
                          ₹{c.fee.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Educational section */}
          <Card className="border-slate-200 shadow-sm mt-8">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Handshake className="w-4 h-4 text-violet-600" /> RentRight Anti-Brokerage Pledge</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-1.5 mb-1"><AlertCircle className="w-4 h-4 text-rose-600" /><span className="font-bold text-rose-900">The Problem</span></div>
                  <p className="text-rose-900 leading-relaxed">India's rental market loses ₹8,000+ crore annually to brokers who add zero property value but charge 15-30 days of rent upfront.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-1.5 mb-1"><Calculator className="w-4 h-4 text-amber-600" /><span className="font-bold text-amber-900">The Trap</span></div>
                  <p className="text-amber-900 leading-relaxed">Brokers push you to accept the first property shown because they earn commission regardless of quality. No accountability for defects or fake listings.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 mb-1"><PiggyBank className="w-4 h-4 text-emerald-600" /><span className="font-bold text-emerald-900">RentRight's Fix</span></div>
                  <p className="text-emerald-900 leading-relaxed">Direct owner contact via Safe Contact flow + verification proof + Deposit Trust Score → tenants can bypass brokers with confidence.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                <div className="font-bold flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4 text-blue-600" /> Pro Tip: Negotiate Brokerage Down</div>
                <p className="text-[11px] leading-relaxed">If you must use a broker, cite RentRight's city-wise fees and demand the lower of (a) 15 days rent, (b) {regime.defaultBrokerPct}% of annual, or (c) ₹8,000 flat. Most brokers accept 40-50% discounts when shown comparable listings on direct-owner platforms.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default BrokerFeeCalculatorPage;
