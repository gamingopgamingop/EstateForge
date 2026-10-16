import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Star, ShieldCheck, Bus, Utensils, Zap, ArrowRight } from "lucide-react";
import { useProperties } from "../contexts/PropertiesContext";

interface LocalityData {
  name: string;
  city: string;
  tagline: string;
  avgPgSingle: number;
  avgPgShared: number;
  avg1Bhk: number;
  metroRating: number;
  safetyRating: number;
  foodDensityRating: number;
  vibeScore: number;
  crowd: string;
  distanceToTechColleges: string;
  highlights: string[];
}

const LOCALITIES: Record<string, LocalityData> = {
  "koramangala": {
    name: "Koramangala",
    city: "Bengaluru",
    tagline: "Startup Capital & Cafe Hub",
    avgPgSingle: 14000,
    avgPgShared: 9500,
    avg1Bhk: 21000,
    metroRating: 3.5,
    safetyRating: 4.5,
    foodDensityRating: 5.0,
    vibeScore: 4.8,
    crowd: "Tech Founders, SDEs, Design Interns",
    distanceToTechColleges: "10 mins to St. John's, 20 mins to Electronic City",
    highlights: ["100+ Cafes & Working Spaces", "High Security & Late-night Food", "Vibrant Weekend Community"]
  },
  "hsr_layout": {
    name: "HSR Layout",
    city: "Bengaluru",
    tagline: "Peaceful Wide Sectors & Tech Corridor",
    avgPgSingle: 15500,
    avgPgShared: 10500,
    avg1Bhk: 23000,
    metroRating: 4.0,
    safetyRating: 4.7,
    foodDensityRating: 4.7,
    vibeScore: 4.7,
    crowd: "Unicorn Startups, Remote Engineers, Creators",
    distanceToTechColleges: "15 mins to Bellandur ORR, 5 mins to Agara Lake",
    highlights: ["Wide Green Tree-Lined Avenues", "Hub for VC backed tech teams", "Cult.fit & Active Fitness scene"]
  },
  "north_campus": {
    name: "North Campus (GTB Nagar)",
    city: "Delhi NCR",
    tagline: "Student Hub & Academic Heart",
    avgPgSingle: 11000,
    avgPgShared: 7500,
    avg1Bhk: 16000,
    metroRating: 5.0,
    safetyRating: 4.1,
    foodDensityRating: 4.8,
    vibeScore: 4.9,
    crowd: "University Students & Exam Aspirants",
    distanceToTechColleges: "Walking distance to DU colleges & Metro yellow line",
    highlights: ["Yellow Line Metro on doorstep", "Pocket-friendly student food lanes", "Quiet reading rooms & libraries"]
  },
  "whitefield": {
    name: "Whitefield (ITPL)",
    city: "Bengaluru",
    tagline: "Gated Societies & Mega Tech Parks",
    avgPgSingle: 13000,
    avgPgShared: 8500,
    avg1Bhk: 22000,
    metroRating: 4.8,
    safetyRating: 4.3,
    foodDensityRating: 3.8,
    vibeScore: 4.0,
    crowd: "IT Professionals & Tech Campus Employees",
    distanceToTechColleges: "5 mins to ITPL, Direct Purple Line Metro",
    highlights: ["Walk-to-work to major tech parks", "Large gated societies with pools", "Direct Purple Line Metro connectivity"]
  }
};

export const LocalityComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { filterProperties } = useProperties();

  const [locAKey, setLocAKey] = useState("koramangala");
  const [locBKey, setLocBKey] = useState("hsr_layout");

  const locA = LOCALITIES[locAKey];
  const locB = LOCALITIES[locBKey];

  const handleSearchLocality = (localityName: string) => {
    filterProperties({ locality: localityName, availableOnly: true });
    navigate("/properties");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Navigation className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Locality Intelligence & Comparison
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Compare rental rates, student safety, metro access, and food culture before finalizing your stay location.
            </p>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Locality 1</label>
              <select
                value={locAKey}
                onChange={(e) => setLocAKey(e.target.value)}
                className="w-full text-sm font-semibold rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-violet-500"
              >
                {Object.keys(LOCALITIES).map((key) => (
                  <option key={key} value={key}>
                    {LOCALITIES[key].name} ({LOCALITIES[key].city})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Locality 2</label>
              <select
                value={locBKey}
                onChange={(e) => setLocBKey(e.target.value)}
                className="w-full text-sm font-semibold rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-violet-500"
              >
                {Object.keys(LOCALITIES).map((key) => (
                  <option key={key} value={key}>
                    {LOCALITIES[key].name} ({LOCALITIES[key].city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Locality A */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-violet-900 to-indigo-900 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black">{locA.name}</h3>
                    <p className="text-xs text-violet-200 mt-0.5">{locA.city} • {locA.tagline}</p>
                  </div>
                  <Badge className="bg-white/20 text-white text-[11px] backdrop-blur-sm border-0">
                    ⭐ {locA.vibeScore} Vibe
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-2">Average Monthly Rental Costs</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Single PG</div>
                      <div className="font-bold text-slate-900 text-sm">₹{locA.avgPgSingle.toLocaleString()}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Twin Sharing</div>
                      <div className="font-bold text-slate-900 text-sm">₹{locA.avgPgShared.toLocaleString()}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">1BHK Flat</div>
                      <div className="font-bold text-slate-900 text-sm">₹{locA.avg1Bhk.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">🚇 Metro & Transit Access:</span>
                    <span className="font-bold text-slate-900">{locA.metroRating} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">🛡️ Night Safety & Street Lighting:</span>
                    <span className="font-bold text-slate-900">{locA.safetyRating} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">🍜 Food / Mess / Night Delivery:</span>
                    <span className="font-bold text-slate-900">{locA.foodDensityRating} / 5.0</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Community & Crowd</span>
                  <p className="text-slate-700">{locA.crowd}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Key Highlights</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    {locA.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => handleSearchLocality(locA.name)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-1.5 h-9"
                  >
                    View Rentals in {locA.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Locality B */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black">{locB.name}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{locB.city} • {locB.tagline}</p>
                  </div>
                  <Badge className="bg-white/20 text-white text-[11px] backdrop-blur-sm border-0">
                    ⭐ {locB.vibeScore} Vibe
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-2">Average Monthly Rental Costs</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Single PG</div>
                      <div className="font-bold text-slate-900 text-sm">₹{locB.avgPgSingle.toLocaleString()}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Twin Sharing</div>
                      <div className="font-bold text-slate-900 text-sm">₹{locB.avgPgShared.toLocaleString()}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400">1BHK Flat</div>
                      <div className="font-bold text-slate-900 text-sm">₹{locB.avg1Bhk.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">🚇 Metro & Transit Access:</span>
                    <span className="font-bold text-slate-900">{locB.metroRating} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">🛡️ Night Safety & Street Lighting:</span>
                    <span className="font-bold text-slate-900">{locB.safetyRating} / 5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">🍜 Food / Mess / Night Delivery:</span>
                    <span className="font-bold text-slate-900">{locB.foodDensityRating} / 5.0</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Community & Crowd</span>
                  <p className="text-slate-700">{locB.crowd}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Key Highlights</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    {locB.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => handleSearchLocality(locB.name)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-9"
                  >
                    View Rentals in {locB.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
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

export default LocalityComparePage;
