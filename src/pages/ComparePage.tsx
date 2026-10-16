import React, { useState } from "react";
import { Link } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { useProperties, Property } from "../contexts/PropertiesContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EnquiryModal from "../components/EnquiryModal";
import {
  Scale,
  X,
  Check,
  Minus,
  ShieldCheck,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
  PlusCircle,
  ArrowRight
} from "lucide-react";

export const ComparePage: React.FC = () => {
  const { compareIds, properties, removeFromCompare, clearCompare, addToCompare } = useProperties();
  const [selectedForEnquiry, setSelectedForEnquiry] = useState<Property | null>(null);

  const comparedProperties = properties.filter(p => compareIds.includes(p.id));

  // Key facilities to compare
  const FACILITIES_TO_COMPARE = [
    "High-Speed WiFi (300 Mbps)",
    "3 Meals Included (Daily Mess)",
    "Power Backup 24/7",
    "Attached Washroom",
    "Air Conditioner (AC)",
    "Laundry & Housekeeping",
    "RO Purified Water",
    "Biometric Access & CCTV",
    "Study Table & Ergonomic Chair",
    "Swimming Pool & Clubhouse Gym"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Scale className="w-3.5 h-3.5" /> RentRight Decision Matrix
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Compare Accommodation Options
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Evaluate rent, security deposits, included amenities, and house rules side-by-side.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {comparedProperties.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompare}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Clear All ({comparedProperties.length})
                </Button>
              )}
              <Link to="/properties">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" /> Add Properties
                </Button>
              </Link>
            </div>
          </div>

          {comparedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Properties Selected for Comparison</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Browse student and working professional listings and click the "Compare" button to evaluate up to 4 accommodations side-by-side.
              </p>
              <Link to="/properties">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Browse Accommodations
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="p-4 w-48 text-xs font-bold uppercase tracking-wider text-slate-500 sticky left-0 bg-slate-50/95 z-10">
                      Features
                    </th>
                    {comparedProperties.map((p) => (
                      <th key={p.id} className="p-4 w-64 min-w-[240px] align-top">
                        <div className="relative group">
                          <button
                            onClick={() => removeFromCompare(p.id)}
                            className="absolute -top-2 -right-2 bg-slate-900 text-white hover:bg-rose-600 p-1 rounded-full shadow-md transition z-10"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 relative bg-slate-100">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              {p.verificationStatus === "Verified" ? (
                                <Badge className="bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
                                  <ShieldCheck className="w-3 h-3" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px]">
                                  Owner Claimed
                                </Badge>
                              )}
                            </div>
                          </div>

                          <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                            {p.title}
                          </h3>

                          <div className="flex items-baseline gap-1 mt-1 text-slate-900">
                            <span className="text-lg font-extrabold text-violet-700">₹{p.monthlyRent?.toLocaleString()}</span>
                            <span className="text-xs text-slate-500">/month</span>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => setSelectedForEnquiry(p)}
                              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                            >
                              Enquire
                            </Button>
                            <Link to={`/property/${p.id}`} className="shrink-0">
                              <Button variant="outline" size="sm" className="h-8 px-2.5" title="View Details">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* Rent & Deposit Section */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={comparedProperties.length + 1} className="py-2.5 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      💰 Pricing & Move-in Expenses
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Monthly Rent</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 font-bold text-slate-900">
                        ₹{p.monthlyRent?.toLocaleString()} / mo
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Security Deposit</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-700">
                        ₹{p.securityDeposit?.toLocaleString()}
                        <span className="text-[11px] text-slate-400 block">
                          ({(p.securityDeposit / (p.monthlyRent || 1)).toFixed(1)} mo rent)
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Estimated Move-in Cost</td>
                    {comparedProperties.map(p => {
                      const totalMoveIn = p.monthlyRent + p.securityDeposit + (p.maintenance || 0);
                      return (
                        <td key={p.id} className="p-4 font-bold text-violet-700">
                          ₹{totalMoveIn.toLocaleString()}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (1st mo + deposit + maint)
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Bills / Food Included</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4">
                        {p.billsIncluded ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                            <Check className="w-3 h-3 text-emerald-600" /> Yes, Included
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Separate (as per sub-meter)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Accommodation Specifications */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={comparedProperties.length + 1} className="py-2.5 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      🏠 Accommodation Details
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Type & Category</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-800 font-medium">
                        {p.accommodationType}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Occupancy</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-800">
                        {p.occupancyPreference} Occupancy
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Furnishing Status</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-800">
                        {p.furnishing}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Target Audience</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {p.targetAudience}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Available From</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-700">
                        {p.availableFrom || "Ready to Move"}
                      </td>
                    ))}
                  </tr>

                  {/* Location & Transit */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={comparedProperties.length + 1} className="py-2.5 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      📍 Locality & Transit
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Locality</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-800 font-medium">
                        {p.locality}, {p.city}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Nearest Metro</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-700">
                        {p.metroDistanceKm ? `${p.metroDistanceKm} km` : "N/A"}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">Nearest Colleges / Hubs</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4 text-slate-700">
                        {p.collegeDistanceKm ? `${p.collegeDistanceKm} km` : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Facilities Matrix */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={comparedProperties.length + 1} className="py-2.5 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      ⚡ Amenities & Facilities Checklist
                    </td>
                  </tr>

                  {FACILITIES_TO_COMPARE.map((facility) => (
                    <tr key={facility}>
                      <td className="p-4 font-medium text-slate-600 sticky left-0 bg-white">
                        {facility}
                      </td>
                      {comparedProperties.map((p) => {
                        const hasFacility = p.amenities?.some(
                          (a) => a.toLowerCase().includes(facility.toLowerCase().split(" ")[0])
                        );
                        return (
                          <td key={p.id} className="p-4">
                            {hasFacility ? (
                              <span className="inline-flex items-center text-emerald-600 font-semibold gap-1">
                                <Check className="w-4 h-4 text-emerald-600" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-slate-300">
                                <Minus className="w-4 h-4" /> No
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* House Rules */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={comparedProperties.length + 1} className="py-2.5 px-4 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      📜 Community Rules & Curfew
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">House Rules</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-4">
                        <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                          {p.houseRules && p.houseRules.length > 0 ? (
                            p.houseRules.map((rule, idx) => <li key={idx}>{rule}</li>)
                          ) : (
                            <li>Standard quiet community hours</li>
                          )}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Enquiry Modal */}
      {selectedForEnquiry && (
        <EnquiryModal
          property={selectedForEnquiry}
          isOpen={!!selectedForEnquiry}
          onClose={() => setSelectedForEnquiry(null)}
        />
      )}

      <FooterSection />
    </div>
  );
};

export default ComparePage;
