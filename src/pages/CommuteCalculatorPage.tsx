import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Navigation,
  MapPin,
  Bus,
  Car,
  Bike,
  Footprints,
  Clock,
  IndianRupee,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck
} from "lucide-react";
import { useProperties, Property } from "../contexts/PropertiesContext";

// ── Locality coordinate mapping (lat, lng) ──────────────────────────
const LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Koramangala 4th Block": { lat: 12.9352, lng: 77.6145 },
  "Koramangala 1st Block": { lat: 12.9375, lng: 77.6078 },
  "HSR Layout Sector 2": { lat: 12.9121, lng: 77.6411 },
  "HSR Layout Sector 4": { lat: 12.9097, lng: 77.6443 },
  "North Campus (GTB Nagar)": { lat: 28.5961, lng: 77.2006 },
  "South Campus (Satya Niketan)": { lat: 28.5749, lng: 77.1999 },
  "Indiranagar 100ft Road": { lat: 12.9719, lng: 77.6412 },
  "Whitefield (Near ITPL)": { lat: 12.9720, lng: 77.7494 },
  "Viman Nagar": { lat: 18.5671, lng: 73.9188 },
  "Hinjewadi Phase 1": { lat: 18.5910, lng: 73.7340 },
  "Gachibowli (Financial District)": { lat: 17.4401, lng: 78.3489 },
  "Madhapur (Hitec City)": { lat: 17.4465, lng: 78.3840 },
  "Powai": { lat: 19.1176, lng: 72.9057 },
  "Electronic City Phase 1": { lat: 12.8452, lng: 77.6732 },
  "DLF Phase 2 (Cyber City)": { lat: 28.4949, lng: 77.0841 },
};

// ── Popular destinations (colleges & offices) ───────────────────────
interface Destination {
  id: string;
  name: string;
  type: "college" | "office";
  city: string;
  lat: number;
  lng: number;
}

const DESTINATIONS: Destination[] = [
  { id: "gla", name: "GLA University, Mathura", type: "college", city: "Mathura", lat: 27.5080, lng: 77.6630 },
  { id: "viit", name: "Vrindavan College / I.T.", type: "college", city: "Vrindavan", lat: 27.5803, lng: 77.6650 },
  { id: "du-south", name: "Delhi University South Campus", type: "college", city: "Delhi", lat: 28.5749, lng: 77.1999 },
  { id: "du-north", name: "DU North Campus (GTB Nagar)", type: "college", city: "Delhi", lat: 28.5961, lng: 77.2006 },
  { id: "iit-bombay", name: "IIT Bombay, Powai", type: "college", city: "Mumbai", lat: 19.1334, lng: 72.9193 },
  { id: "symbiosis", name: "Symbiosis International, Pune", type: "college", city: "Pune", lat: 18.5671, lng: 73.9188 },
  { id: "iiit-h", name: "IIIT Hyderabad, Gachibowli", type: "college", city: "Hyderabad", lat: 17.3959, lng: 78.3534 },
  { id: "msrit", name: "MSRIT / RVCE Bengaluru", type: "college", city: "Bengaluru", lat: 12.9458, lng: 77.5005 },
  { id: "itpl", name: "ITPL / Whitefield Tech Park", type: "office", city: "Bengaluru", lat: 12.9720, lng: 77.7494 },
  { id: "ecomand", name: "Ecospace / Bellandur ORR", type: "office", city: "Bengaluru", lat: 12.8845, lng: 77.6876 },
  { id: "cyber-hub", name: "Cyber Hub / DLF Cyber City", type: "office", city: "Gurugram", lat: 28.4951, lng: 77.0845 },
  { id: "hitec", name: "Hitec City / Cyber Towers", type: "office", city: "Hyderabad", lat: 17.4465, lng: 78.3840 },
  { id: "rgp", name: "Rajiv Gandhi Tech Park, Pune", type: "office", city: "Pune", lat: 18.5910, lng: 73.7340 },
  { id: "seepz", name: "SEEPZ / Andheri East Mumbai", type: "office", city: "Mumbai", lat: 19.1197, lng: 72.8661 },
  { id: "koram-tech", name: "Koramangala Tech Park (Sony World Signal)", type: "office", city: "Bengaluru", lat: 12.9352, lng: 77.6145 },
];

// ── Transport mode config ──────────────────────────────────────────
interface TransportMode {
  id: string;
  label: string;
  icon: React.ReactNode;
  avgSpeedKmph: number; // realistic city avg incl. signals
  costPerKm: number;    // ₹/km (fuel + maintenance / ticket fare)
  baseFare: number;     // ₹ per trip minimum (auto start fare, bus ticket)
}

const TRANSPORT_MODES: TransportMode[] = [
  { id: "walk", label: "Walking", icon: <Footprints className="w-4 h-4" />, avgSpeedKmph: 4.5, costPerKm: 0, baseFare: 0 },
  { id: "bus", label: "City Bus / Shared Auto", icon: <Bus className="w-4 h-4" />, avgSpeedKmph: 15, costPerKm: 0.8, baseFare: 10 },
  { id: "auto", label: "Auto Rickshaw", icon: <Navigation className="w-4 h-4" />, avgSpeedKmph: 18, costPerKm: 3.5, baseFare: 25 },
  { id: "bike", label: "Two-Wheeler / Scooty", icon: <Bike className="w-4 h-4" />, avgSpeedKmph: 22, costPerKm: 1.2, baseFare: 0 },
  { id: "car", label: "Car / Cab (Ola/Uber)", icon: <Car className="w-4 h-4" />, avgSpeedKmph: 20, costPerKm: 5, baseFare: 80 },
];

// ── Haversine distance in km ───────────────────────────────────────
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Commute result per property ────────────────────────────────────
interface CommuteResult {
  property: Property;
  distanceKm: number;
  oneWayMinutes: number;
  dailyCost: number;
  monthlyCost: number;
  hasCoords: boolean;
}

const WORKING_DAYS_PER_MONTH = 26;

export const CommuteCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { properties } = useProperties();

  const [selectedDestId, setSelectedDestId] = useState<string>("gla");
  const [selectedModeId, setSelectedModeId] = useState<string>("auto");
  const [customLat, setCustomLat] = useState<string>("");
  const [customLng, setCustomLng] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "time" | "cost">("distance");
  const [expandedProp, setExpandedProp] = useState<number | null>(null);

  const destination = DESTINATIONS.find((d) => d.id === selectedDestId);
  const mode = TRANSPORT_MODES.find((m) => m.id === selectedModeId)!;

  const destLat = useCustom ? parseFloat(customLat) : destination?.lat;
  const destLng = useCustom ? parseFloat(customLng) : destination?.lng;

  const commuteResults: CommuteResult[] = useMemo(() => {
    if (destLat == null || destLng == null || isNaN(destLat) || isNaN(destLng)) return [];

    return properties
      .filter((p) => p.listingStatus === "Available")
      .map((p) => {
        const coords = LOCALITY_COORDS[p.locality];
        if (!coords) {
          return {
            property: p,
            distanceKm: -1,
            oneWayMinutes: -1,
            dailyCost: -1,
            monthlyCost: -1,
            hasCoords: false,
          };
        }

        const dist = haversineKm(destLat, destLng, coords.lat, coords.lng);
        // add 20% for road routing vs straight-line
        const roadDist = dist * 1.2;
        const minutes = Math.round((roadDist / mode.avgSpeedKmph) * 60);
        const oneWayCost = Math.max(mode.baseFare, roadDist * mode.costPerKm);
        const daily = oneWayCost * 2; // round trip
        const monthly = Math.round(daily * WORKING_DAYS_PER_MONTH);

        return {
          property: p,
          distanceKm: Math.round(roadDist * 10) / 10,
          oneWayMinutes: minutes,
          dailyCost: Math.round(daily),
          monthlyCost: monthly,
          hasCoords: true,
        };
      })
      .filter((r) => r.hasCoords)
      .sort((a, b) => {
        if (sortBy === "distance") return a.distanceKm - b.distanceKm;
        if (sortBy === "time") return a.oneWayMinutes - b.oneWayMinutes;
        return a.monthlyCost - b.monthlyCost;
      });
  }, [properties, destLat, destLng, mode, sortBy]);

  const totalMonthlyRent = (p: Property) =>
    p.monthlyRent + (p.maintenance || 0);

  const totalAllCost = (r: CommuteResult) =>
    totalMonthlyRent(r.property) + r.monthlyCost;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Navigation className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Commute + Cost Calculator
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Enter your college or office location to auto-calculate distance, travel time, and monthly commute cost for every listed accommodation.
            </p>
          </div>

          {/* Destination & Mode Selector */}
          <Card className="border-slate-200 shadow-md mb-8">
            <CardContent className="p-6 space-y-5">
              {/* Destination type toggle */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">
                    Your Daily Destination
                  </label>

                  {/* Custom toggle */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setUseCustom(false)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${!useCustom ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      <MapPin className="w-3 h-3 inline mr-1" /> Pick from List
                    </button>
                    <button
                      onClick={() => setUseCustom(true)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${useCustom ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      Enter Custom Coordinates
                    </button>
                  </div>

                  {useCustom ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Latitude e.g. 27.508"
                        value={customLat}
                        onChange={(e) => setCustomLat(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Longitude e.g. 77.663"
                        value={customLng}
                        onChange={(e) => setCustomLng(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  ) : (
                    <Select value={selectedDestId} onValueChange={setSelectedDestId}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Select college or office" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> Colleges & Universities
                          </p>
                          {DESTINATIONS.filter((d) => d.type === "college").map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-xs">
                              {d.name}
                              <span className="text-slate-400 ml-1">({d.city})</span>
                            </SelectItem>
                          ))}
                          <div className="border-t border-slate-100 my-1" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> Offices & Tech Parks
                          </p>
                          {DESTINATIONS.filter((d) => d.type === "office").map((d) => (
                            <SelectItem key={d.id} value={d.id} className="text-xs">
                              {d.name}
                              <span className="text-slate-400 ml-1">({d.city})</span>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="sm:w-52">
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-2">
                    Transport Mode
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {TRANSPORT_MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModeId(m.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                          selectedModeId === m.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50"
                        }`}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Destination info bar */}
              {destination && !useCustom && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100 text-xs">
                  <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <span className="font-bold text-violet-900">{destination.name}</span>
                    <span className="text-violet-600 ml-2">
                      {destination.lat.toFixed(4)}°N, {destination.lng.toFixed(4)}°E • {destination.city}
                    </span>
                  </div>
                  <span className="ml-auto text-[10px] uppercase font-bold text-violet-500">
                    Using {mode.label}
                  </span>
                </div>
              )}

              {/* Sort toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600">
                  {commuteResults.length} available properties ranked by commute
                </span>
                <div className="flex gap-1.5">
                  {(["distance", "time", "cost"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`text-[11px] px-3 py-1 rounded-full font-semibold transition ${
                        sortBy === s
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {s === "distance" ? "By Distance" : s === "time" ? "By Time" : "By Cost"}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          {commuteResults.length === 0 ? (
            <Card className="border-slate-200 shadow-sm p-10 text-center">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Select a Destination</h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose your college or office location above to see commute distances and costs for all properties.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Summary stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-violet-600" />
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">{commuteResults.length}</div>
                      <div className="text-[10px] font-medium text-slate-500">Properties Mapped</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <Navigation className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {commuteResults.length > 0 ? `${commuteResults[0].distanceKm} km` : "-"}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">Closest Property</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {commuteResults.length > 0 ? `${commuteResults[0].oneWayMinutes} min` : "-"}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">Fastest Commute</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2.5">
                    <IndianRupee className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">
                        {commuteResults.length > 0 ? `₹${commuteResults[0].monthlyCost.toLocaleString()}` : "-"}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">Lowest Commute Cost/mo</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Property commute cards */}
              {commuteResults.map((r, idx) => {
                const p = r.property;
                const expanded = expandedProp === p.id;
                const allCost = totalAllCost(r);
                const rent = totalMonthlyRent(p);
                const commutePercent = Math.round((r.monthlyCost / rent) * 100);

                return (
                  <Card
                    key={p.id}
                    className={`border-slate-200 shadow-sm transition hover:shadow-md ${idx === 0 ? "ring-2 ring-violet-500/40 border-violet-300" : ""}`}
                  >
                    <CardContent className="p-0">
                      {/* Rank header strip */}
                      <div className="flex items-stretch">
                        {/* Rank badge */}
                        <div className={`flex items-center justify-center w-12 shrink-0 text-white font-black text-lg rounded-l-2xl ${idx === 0 ? "bg-gradient-to-b from-violet-600 to-indigo-700" : idx < 3 ? "bg-gradient-to-b from-slate-700 to-slate-800" : "bg-slate-400"}`}>
                          {idx + 1}
                        </div>

                        {/* Main content */}
                        <div className="flex-grow p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  to={`/property/${p.id}`}
                                  className="font-bold text-sm text-slate-900 hover:text-violet-600 transition line-clamp-1"
                                >
                                  {p.title}
                                </Link>
                                {p.verificationStatus === "Verified" && (
                                  <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-semibold flex items-center gap-0.5 shrink-0">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                <MapPin className="w-3 h-3 text-violet-500" />
                                {p.locality}, {p.city}
                              </div>

                              {/* Commute stats row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-center">
                                  <div className="text-[10px] font-bold text-blue-500 uppercase">Distance</div>
                                  <div className="text-base font-extrabold text-blue-800">{r.distanceKm} km</div>
                                  <div className="text-[10px] text-blue-400">road estimate</div>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                                  <div className="text-[10px] font-bold text-emerald-500 uppercase">Travel Time</div>
                                  <div className="text-base font-extrabold text-emerald-800">{r.oneWayMinutes} min</div>
                                  <div className="text-[10px] text-emerald-400">one way via {mode.label}</div>
                                </div>
                                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center">
                                  <div className="text-[10px] font-bold text-amber-500 uppercase">Daily Round Trip</div>
                                  <div className="text-base font-extrabold text-amber-800">₹{r.dailyCost}</div>
                                  <div className="text-[10px] text-amber-400">{WORKING_DAYS_PER_MONTH} working days/mo</div>
                                </div>
                                <div className="p-2 rounded-lg bg-violet-50 border border-violet-100 text-center">
                                  <div className="text-[10px] font-bold text-violet-500 uppercase">Monthly Commute</div>
                                  <div className="text-base font-extrabold text-violet-800">₹{r.monthlyCost.toLocaleString()}</div>
                                  <div className="text-[10px] text-violet-400">{commutePercent}% of rent</div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Total cost + actions */}
                            <div className="flex flex-col items-end gap-2 shrink-0 lg:w-48">
                              <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">All-in Monthly Cost</div>
                                <div className="text-2xl font-black text-slate-900">₹{allCost.toLocaleString()}</div>
                                <div className="text-[10px] text-slate-500">
                                  Rent ₹{rent.toLocaleString()} + Commute ₹{r.monthlyCost.toLocaleString()}
                                </div>
                              </div>

                              <div className="flex gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 border-violet-200 text-violet-700 hover:bg-violet-50"
                                  onClick={() => setExpandedProp(expanded ? null : p.id)}
                                >
                                  {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                                  Details
                                </Button>
                                <Link to={`/property/${p.id}`}>
                                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-7 gap-1">
                                    View <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Expanded details */}
                          {expanded && (
                            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1.5">Rent Breakdown</span>
                                <div className="space-y-1 text-slate-700">
                                  <div className="flex justify-between"><span>Monthly Rent:</span><span className="font-semibold">₹{p.monthlyRent.toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>Security Deposit:</span><span className="font-semibold">₹{p.securityDeposit.toLocaleString()}</span></div>
                                  <div className="flex justify-between"><span>Maintenance:</span><span className="font-semibold">{p.maintenance ? `₹${p.maintenance}` : "Included"}</span></div>
                                  {p.billsIncluded && <div className="text-emerald-600 font-semibold">✓ Bills & Food Included</div>}
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1.5">All Transport Modes</span>
                                <div className="space-y-1 text-slate-700">
                                  {TRANSPORT_MODES.map((tm) => {
                                    const roadDist = r.distanceKm;
                                    const mins = Math.round((roadDist / tm.avgSpeedKmph) * 60);
                                    const trip = Math.max(tm.baseFare, roadDist * tm.costPerKm);
                                    const mo = Math.round(trip * 2 * WORKING_DAYS_PER_MONTH);
                                    return (
                                      <div key={tm.id} className={`flex justify-between ${tm.id === selectedModeId ? "text-violet-700 font-bold" : ""}`}>
                                        <span className="flex items-center gap-1">{tm.icon} {tm.label}</span>
                                        <span>{mins} min · ₹{mo.toLocaleString()}/mo</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1.5">Property Quick Facts</span>
                                <div className="space-y-1 text-slate-700">
                                  <div className="flex justify-between"><span>Type:</span><span className="font-semibold">{p.accommodationType}</span></div>
                                  <div className="flex justify-between"><span>Furnishing:</span><span className="font-semibold">{p.furnishing}</span></div>
                                  <div className="flex justify-between"><span>Rating:</span><span className="font-semibold">⭐ {p.rating}</span></div>
                                  <div className="flex justify-between"><span>Metro:</span><span className="font-semibold">{p.metroDistanceKm ? `${p.metroDistanceKm} km` : "Nearby"}</span></div>
                                  <div className="flex justify-between"><span>Target:</span><span className="font-semibold">{p.targetAudience}</span></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Educational note */}
          <div className="mt-10 p-5 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sm text-violet-900">
              <ShieldCheck className="w-4 h-4 text-violet-600" /> How Commute Costs are Estimated
            </div>
            <ul className="list-disc list-inside space-y-1 leading-relaxed text-violet-800">
              <li><strong>Distance:</strong> Haversine great-circle distance + 20% road routing factor</li>
              <li><strong>Travel time:</strong> City average speeds (walking 4.5 km/h, bus 15 km/h, auto 18 km/h, bike 22 km/h, car 20 km/h)</li>
              <li><strong>Cost:</strong> {WORKING_DAYS_PER_MONTH} working days/month × round-trip fare including base charges</li>
              <li>Actual commute may vary based on traffic, route availability, and city transit schedules</li>
            </ul>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default CommuteCalculatorPage;
