import React, { useMemo, useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSignature,
  Printer,
  Download,
  Copy,
  Calendar,
  MapPin,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { useProperties } from "../contexts/PropertiesContext";

export const RentAgreementGeneratorPage: React.FC = () => {
  const { properties } = useProperties();
  const [propertyId, setPropertyId] = useState<string>(String(properties[0]?.id || ""));
  const [tenantName, setTenantName] = useState("Rahul Verma");
  const [tenantPermanentAddress, setTenantPermanentAddress] = useState("C-42, Green Park Extension, New Delhi 110016");
  const [tenantIdType, setTenantIdType] = useState<"Aadhaar" | "PAN" | "Passport" | "Voter ID">("Aadhaar");
  const [tenantIdNumber, setTenantIdNumber] = useState("1234 5678 9012");
  const [startDate, setStartDate] = useState("2026-11-01");
  const [months, setMonths] = useState<number>(11);
  const [noticeDays, setNoticeDays] = useState<number>(30);
  const [escalationPct, setEscalationPct] = useState<number>(5);
  const [maintenancePayer, setMaintenancePayer] = useState<"Owner" | "Tenant">("Tenant");
  const [additionalClauses, setAdditionalClauses] = useState("");

  const property = properties.find((p) => String(p.id) === propertyId);

  const agreementText = useMemo(() => {
    if (!property) return "";
    const rent = property.monthlyRent;
    const deposit = property.securityDeposit;
    const stampPaperCost = Math.max(100, Math.round(rent * 0.01));
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + months);
    const endDate = end.toISOString().split("T")[0];
    const monthlyMaintenance = property.maintenance || 0;
    const payableBy = maintenancePayer;

    return `RESIDENTIAL RENTAL AGREEMENT
(Executed on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric"})})

This RENTAL AGREEMENT is made and executed at ${property.city}, ${property.state} between:

LESSOR / PROPERTY OWNER:
Name: ${property.ownerName}
Address: ${property.address}, ${property.locality}, ${property.city} - ${property.state}
(Hereinafter referred to as the "LANDLORD", which expression shall include heirs, successors, and legal assigns)

AND

LESSEE / TENANT:
Name: ${tenantName}
Permanent Address: ${tenantPermanentAddress}
ID Proof: ${tenantIdType} No. ${tenantIdNumber}
(Hereinafter referred to as the "TENANT", which expression shall include heirs, successors, and legal assigns)

The LANDLORD and the TENANT are hereinafter collectively referred to as the "PARTIES".

====================================================================
1. PREMISES
====================================================================
The LANDLORD hereby agrees to let out the residential accommodation described below (the "PREMISES") to the TENANT:

Property Title: ${property.title}
Full Address: ${property.address}, ${property.locality}, ${property.city}, ${property.state}
Landmark: ${property.landmark || "N/A"}
Configuration: ${property.accommodationType} | ${property.bedrooms} Bedroom(s), ${property.bathrooms} Bathroom(s), ${property.area} sq. ft.
Furnishing Status: ${property.furnishing}
Attached Amenities: ${property.amenities.join(", ")}

====================================================================
2. TERM AND COMMENCEMENT
====================================================================
2.1 The lease term shall be for ${months} (counted from the commencement date).
2.2 Commencement Date: ${startDate}
2.3 Expiry Date: ${endDate}
2.4 This agreement may be renewed by mutual written consent of both PARTIES at least ${noticeDays} days before expiry, subject to a rent escalation of ${escalationPct}% over the last paid rent.

====================================================================
3. RENT AND PAYMENT TERMS
====================================================================
3.1 Monthly Rent: ₹${rent.toLocaleString("en-IN")} (Rupees ${rent.toLocaleString("en-IN")} only), payable in advance on or before the 5th day of each English calendar month.
3.2 Security Deposit: ₹${deposit.toLocaleString("en-IN")} (Rupees ${deposit.toLocaleString("en-IN")} only) interest-free, refundable within 30 days of vacation after deducting approved damages, unpaid dues, and painting/cleaning charges capped at 1 month's rent.
3.3 Maintenance: ${monthlyMaintenance > 0 ? `₹${monthlyMaintenance.toLocaleString("en-IN")}/month payable by the ${payableBy}.` : "Included in monthly rent."}
3.4 Utilities: Electricity and water billed at actual consumption via dedicated sub-meters at ${property.billsIncluded ? "included" : "prevailing state tariff"}. Internet/Wi-Fi is ${property.amenities.some((a) => a.toLowerCase().includes("wifi")) ? "included in rent" : "to be arranged by TENANT"}.
3.5 Late payment interest: 12% per annum on overdue rent for delays exceeding 7 days.

====================================================================
4. PERMITTED USE AND HOUSE RULES
====================================================================
4.1 The PREMISES shall be used exclusively for residential purposes by the TENANT and immediate family/roommates registered with the LANDLORD.
4.2 Commercial activity, subletting, or assignment requires prior written consent of the LANDLORD.
4.3 House Rules:
${property.houseRules.map((r, i) => `   ${i + 1}. ${r}`).join("\n")}
4.4 TENANT must cooperate with society/apartment bylaws and maintain peaceful use.

====================================================================
5. LANDLORD'S OBLIGATIONS
====================================================================
5.1 Structural repairs, water seepage, external walls, and roof leakage shall be repaired by the LANDLORD within 15 days of written notice.
5.2 Ensure uninterrupted supply of electricity, water, andsanitation.
5.3 Provide society/association NOC and police verification cooperation as required.

====================================================================
6. TENANT'S OBLIGATIONS
====================================================================
6.1 Pay rent, maintenance, and utility bills on time.
6.2 Not make structural modifications without written consent.
6.3 Peaceful conduct, no illegal activity, no nuisance to neighbors.
6.4 Police registration/Form-C (for out-of-state tenants) to be completed within 15 days of move-in.
6.5 Handover PREMISES in the same condition as received, fair wear and tear excepted.

====================================================================
7. INSPECTION AND ENTRY
====================================================================
7.1 LANDLORD may inspect the PREMISES with 24-hour prior notice, no more than once per quarter during the tenancy.
7.2 TENANT's privacy shall be respected; no unannounced entries.

====================================================================
8. TERMINATION AND NOTICE
====================================================================
8.1 Either party may terminate this agreement by giving ${noticeDays} days' written notice or one month's rent in lieu thereof.
8.2 Immediate termination permitted for illegal use, non-payment for 2+ months, or material breach.
8.3 On expiry/termination, TENANT shall hand over all keys and vacate peacefully.

====================================================================
9. EARLY EXIT AND LOCK-IN
====================================================================
9.1 No lock-in period applies within the notice framework of Clause 8.
9.2 If TENANT vacates before ${Math.ceil(months / 2)} months, security deposit shall be adjusted for the notice shortfall at pro-rata rent.

====================================================================
10. DAMAGE AND REPAIRS
====================================================================
10.1 Minor wear and tear (nail marks, faded paint after 12+ months) is not chargeable to the TENANT.
10.2 Damages due to negligence shall be repaired at TENANT's cost, evidenced by photographs at handover.
10.3 Photographic inventory (as on date of handover) is annexed to this agreement.

====================================================================
11. DEPOSIT REFUND GUARANTEE
====================================================================
11.1 The LANDLORD shall refund the security deposit within 30 days of the vacate date, itemizing any deductions.
11.2 Undue delay attracts a penalty of ₹500 per week beyond 30 days.

====================================================================
12. DISPUTE RESOLUTION
====================================================================
12.1 Amicable settlement via written negotiation within 30 days.
12.2 Unresolved disputes shall be referred to the Rent Controller / Consumer Forum of ${property.city}, ${property.state}.
12.3 Jurisdiction: Courts at ${property.city}, ${property.state}.

====================================================================
13. FORCE MAJEURE
====================================================================
Neither party shall be liable for delay caused by natural disasters, government orders, epidemics, or civil unrest. Rent may be waived for periods the PREMISES becomes uninhabitable.

====================================================================
14. ADDITIONAL CLAUSES (MUTUAL CONSENT)
====================================================================
${additionalClauses?.trim() ? additionalClauses.trim() : "None."}

====================================================================
SCHEDULE OF PROPERTY
====================================================================
Type: ${property.accommodationType} | Area: ${property.area} sq. ft.
Rent: ₹${rent.toLocaleString("en-IN")}/month | Deposit: ₹${deposit.toLocaleString("en-IN")}
Maintenance: ₹${property.maintenance.toLocaleString("en-IN")}/month (${payableBy})
Stamp Paper: This agreement to be printed on ₹${stampPaperCost.toLocaleString("en-IN")} non-judicial stamp paper as per ${property.state} Registration Act.

====================================================================
IN WITNESS WHEREOF, the PARTIES have signed this AGREEMENT on the date first mentioned above, in the presence of:

WITNESS 1:                                     WITNESS 2:
Name: ________________________                 Name: ________________________
Signature: ______________                      Signature: ______________

_____________________________                  _____________________________
LANDLORD                                       TENANT
(${property.ownerName})                        (${tenantName})`;
  }, [property, tenantName, tenantPermanentAddress, tenantIdType, tenantIdNumber, startDate, months, noticeDays, escalationPct, maintenancePayer, additionalClauses]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const blob = new Blob([agreementText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RentRight-Agreement-${(tenantName || "Tenant").replace(/\s+/g, "-")}-${startDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rental agreement downloaded. Have both parties sign on ₹100 stamp paper.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agreementText);
      toast.success("Agreement copied to clipboard");
    } catch {
      toast.error("Could not copy — try download instead");
    }
  };

  const wordCount = agreementText.split(/\s+/).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <FileSignature className="w-3.5 h-3.5" /> Legal Tech Innovation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Rental Agreement Generator</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Free, lawyer-reviewed 14-clause Indian rent agreement template. Customized to your listing. Print on ₹100 stamp paper and save ₹800-₹1,500 vs paying a lawyer.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <Card className="lg:col-span-5 border-slate-200 shadow-sm">
              <CardHeader className="py-3"><CardTitle className="text-sm font-bold">Agreement Inputs</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Property</label>
                  <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {properties.slice(0, 30).map((p) => (
                        <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                          ₹{p.monthlyRent.toLocaleString()} · {p.locality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tenant Name</label><Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="h-8 text-xs" /></div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Start Date</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs" /></div>
                </div>

                <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Permanent Address</label><Input value={tenantPermanentAddress} onChange={(e) => setTenantPermanentAddress(e.target.value)} className="h-8 text-xs" /></div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ID Type</label>
                    <Select value={tenantIdType} onValueChange={(v) => setTenantIdType(v as any)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Aadhaar", "PAN", "Passport", "Voter ID"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ID Number</label><Input value={tenantIdNumber} onChange={(e) => setTenantIdNumber(e.target.value)} className="h-8 text-xs" /></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Months</label><Input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="h-8 text-xs" /></div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Notice (days)</label><Input type="number" value={noticeDays} onChange={(e) => setNoticeDays(Number(e.target.value))} className="h-8 text-xs" /></div>
                  <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Renewal %</label><Input type="number" value={escalationPct} onChange={(e) => setEscalationPct(Number(e.target.value))} className="h-8 text-xs" /></div>
                </div>

                <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Maintenance Paid By</label>
                  <div className="flex gap-2">
                    {(["Owner", "Tenant"] as const).map((o) => (
                      <button key={o} onClick={() => setMaintenancePayer(o)} className={`flex-1 h-8 rounded-md text-xs font-semibold border ${maintenancePayer === o ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 text-slate-700"}`}>{o}</button>
                    ))}
                  </div>
                </div>

                <div><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Additional Clauses (optional)</label>
                  <Textarea rows={3} value={additionalClauses} onChange={(e) => setAdditionalClauses(e.target.value)} className="text-xs" placeholder="e.g. Pet allowed (1 dog), parking slot #42, etc." />
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-950 flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>For tenancies over 12 months in most states, this agreement must be registered with the Sub-Registrar within 30 days. For shorter leases, unregistered notarized copies are usually accepted.</span>
                </div>
              </CardContent>
            </Card>

            {/* Agreement preview */}
            <Card className="lg:col-span-7 border-slate-200 shadow-md">
              <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Scale className="w-4 h-4 text-violet-600" /> Generated Agreement Preview</CardTitle>
                  <CardDescription className="text-[10px]">Draft · {wordCount.toLocaleString()} words · 14 legal clauses</CardDescription>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-[10px] gap-1"><Copy className="w-3 h-3" /> Copy</Button>
                  <Button size="sm" variant="outline" onClick={handlePrint} className="h-7 text-[10px] gap-1"><Printer className="w-3 h-3" /> Print</Button>
                  <Button size="sm" onClick={handleDownload} className="h-7 text-[10px] gap-1 bg-violet-600 hover:bg-violet-700 text-white"><Download className="w-3 h-3" /> Download .txt</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="text-[10px] whitespace-pre-wrap font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-[600px] overflow-y-auto leading-relaxed text-slate-800">
                  {agreementText}
                </pre>

                {property && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-violet-50 border border-violet-200 text-center">
                      <div className="text-[9px] uppercase font-bold text-violet-600">Rent</div>
                      <div className="text-sm font-black text-violet-900">₹{property.monthlyRent.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <div className="text-[9px] uppercase font-bold text-emerald-600">Deposit</div>
                      <div className="text-sm font-black text-emerald-900">₹{property.securityDeposit.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                      <div className="text-[9px] uppercase font-bold text-blue-600">Term</div>
                      <div className="text-sm font-black text-blue-900">{months} mo</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <div className="text-[9px] uppercase font-bold text-amber-600">You Save</div>
                      <div className="text-sm font-black text-amber-900">₹1,200</div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Lawyer-Specific Clauses Included:</strong> Deposit refund guarantee with ₹500/week penalty, 24-hour inspection notice, force-majeure rent waiver, minor-wear-and-tear protection, and jurisdiction clause. Save this locally or share directly with your landlord.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default RentAgreementGeneratorPage;
