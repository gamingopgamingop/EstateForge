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
  },
  "indiranagar": {
    name: "Indiranagar",
    city: "Bengaluru",
    tagline: "High-Street Dining & Boutique Living",
    avgPgSingle: 19500,
    avgPgShared: 12000,
    avg1Bhk: 28000,
    metroRating: 4.9,
    safetyRating: 4.7,
    foodDensityRating: 5.0,
    vibeScore: 5.0,
    crowd: "Designers, Senior Engineers, Founders",
    distanceToTechColleges: "Purple Line direct to MG Road, 20 mins to Bagmane",
    highlights: ["Iconic 100ft & 12ft Road restaurants", "Purple Line Metro on doorstep", "Lush tree canopies and parks"]
  },
  "bellandur": {
    name: "Bellandur (ORR)",
    city: "Bengaluru",
    tagline: "Outer Ring Road Tech Epicenter",
    avgPgSingle: 15000,
    avgPgShared: 9500,
    avg1Bhk: 24000,
    metroRating: 3.2,
    safetyRating: 4.2,
    foodDensityRating: 4.5,
    vibeScore: 4.1,
    crowd: "ORR Techies, EcoSpace & EcoWorld Teams",
    distanceToTechColleges: "5 mins to EcoSpace, RMZ Ecoworld, Intel campus",
    highlights: ["Zero commute to major tech SEZs", "Active sports arenas and turf grounds", "Extensive PG clusters"]
  },
  "hinjewadi": {
    name: "Hinjewadi Phase 1-3",
    city: "Pune",
    tagline: "Maharashtra's Flagship Rajiv Gandhi Tech Park",
    avgPgSingle: 11000,
    avgPgShared: 7000,
    avg1Bhk: 16000,
    metroRating: 3.0,
    safetyRating: 4.3,
    foodDensityRating: 4.2,
    vibeScore: 4.2,
    crowd: "Wipro, Infosys, Tech Mahindra Software Engineers",
    distanceToTechColleges: "Direct feeder buses into Phase 1, 2, and 3",
    highlights: ["Huge selection of budget-friendly PGs", "Close to Mumbai-Pune Expressway", "Active cricket leagues & tech events"]
  },
  "viman_nagar": {
    name: "Viman Nagar",
    city: "Pune",
    tagline: "University Vibrant Neighborhood & Airport Hub",
    avgPgSingle: 12500,
    avgPgShared: 8000,
    avg1Bhk: 19000,
    metroRating: 4.2,
    safetyRating: 4.8,
    foodDensityRating: 4.9,
    vibeScore: 4.9,
    crowd: "Symbiosis Students, Aviation Staff, Media Interns",
    distanceToTechColleges: "Walking distance to Symbiosis campuses",
    highlights: ["Phoenix Marketcity Mall adjacent", "High safety for women & 24/7 food", "Lively student culture and cafes"]
  },
  "gachibowli": {
    name: "Gachibowli",
    city: "Hyderabad",
    tagline: "Financial District & Modern High-Rises",
    avgPgSingle: 14500,
    avgPgShared: 9000,
    avg1Bhk: 20000,
    metroRating: 3.8,
    safetyRating: 4.6,
    foodDensityRating: 4.4,
    vibeScore: 4.5,
    crowd: "Microsoft, Amazon, Financial District Techies",
    distanceToTechColleges: "10 mins to IIIT Hyderabad & University of Hyderabad",
    highlights: ["Wide multi-lane flyovers", "Gated townships with full amenities", "Proximity to IIIT-H and tech campuses"]
  },
  "madhapur": {
    name: "Madhapur (Hitec City)",
    city: "Hyderabad",
    tagline: "Cyber Towers Heartbeat & Nightlife",
    avgPgSingle: 13500,
    avgPgShared: 8500,
    avg1Bhk: 19500,
    metroRating: 4.8,
    safetyRating: 4.5,
    foodDensityRating: 4.8,
    vibeScore: 4.7,
    crowd: "Software Developers, Product Designers, Interns",
    distanceToTechColleges: "Walk to Hitec City Metro and Inorbit Mall",
    highlights: ["Blue Line Metro terminal", "Late-night food trucks & Durgam Cheruvu cable bridge", "Co-working spaces on every corner"]
  },
  "powai": {
    name: "Powai (Hiranandani)",
    city: "Mumbai",
    tagline: "IIT Bombay & Startup Valley",
    avgPgSingle: 22000,
    avgPgShared: 14000,
    avg1Bhk: 30000,
    metroRating: 4.0,
    safetyRating: 4.8,
    foodDensityRating: 4.7,
    vibeScore: 4.8,
    crowd: "IITians, Startup Founders, Quant Analysts",
    distanceToTechColleges: "Immediate proximity to IIT Bombay gate",
    highlights: ["European architectural promenade", "Powai Lake scenic jogging tracks", "Dense venture capital & startup meetups"]
  },
  "andheri_east": {
    name: "Andheri East (Chakala / JB Nagar)",
    city: "Mumbai",
    tagline: "Commercial Crossroads & Metro Junction",
    avgPgSingle: 16500,
    avgPgShared: 10500,
    avg1Bhk: 25000,
    metroRating: 5.0,
    safetyRating: 4.4,
    foodDensityRating: 4.6,
    vibeScore: 4.3,
    crowd: "Corporate Associates, SEEPZ Techies, Airline Staff",
    distanceToTechColleges: "Direct Line 1 & Line 7 Metro access",
    highlights: ["Rapid East-West Metro connectivity", "Minutes from Chhatrapati Shivaji Maharaj Airport", "Thriving local street food scene"]
  },
  "hauz_khas": {
    name: "Hauz Khas & Enclave",
    city: "Delhi NCR",
    tagline: "Heritage Lake, IIT Delhi & Bohemian Culture",
    avgPgSingle: 18000,
    avgPgShared: 11000,
    avg1Bhk: 26000,
    metroRating: 4.9,
    safetyRating: 4.5,
    foodDensityRating: 4.8,
    vibeScore: 4.9,
    crowd: "IIT Delhi Students, Researchers, Creatives",
    distanceToTechColleges: "5 mins walk to IIT Delhi & NIFT campus",
    highlights: ["Yellow and Magenta Line interchange metro", "Deer park jogging trails", "Boutique art galleries and cafes"]
  },
  "cyber_city": {
    name: "Cyber City (DLF Phase 2/3)",
    city: "Delhi NCR",
    tagline: "Gurugram's Fortune 500 Hub",
    avgPgSingle: 17000,
    avgPgShared: 10000,
    avg1Bhk: 25000,
    metroRating: 4.8,
    safetyRating: 4.4,
    foodDensityRating: 4.7,
    vibeScore: 4.6,
    crowd: "Consultants, SDEs, Investment Bankers",
    distanceToTechColleges: "Rapid Metro integrated with Cyber Hub",
    highlights: ["Walk to Cyber Hub dining and amphitheatre", "Rapid Metro connectivity", "High-end corporate towers"]
  },
  "omr_sholinganallur": {
    name: "Sholinganallur (OMR)",
    city: "Chennai",
    tagline: "Chennai's IT Expressway",
    avgPgSingle: 11000,
    avgPgShared: 7500,
    avg1Bhk: 17000,
    metroRating: 3.2,
    safetyRating: 4.5,
    foodDensityRating: 4.2,
    vibeScore: 4.3,
    crowd: "IT Services Engineers, Fintech Analysts",
    distanceToTechColleges: "Shuttles to SIPCOT & ELCOT SEZ, 20 mins to SRM & Sathyabama",
    highlights: ["Dozens of tech parks along Rajiv Gandhi Salai", "Beachside weekends at ECR", "Upcoming Phase 2 Metro corridor"]
  },
  "velachery": {
    name: "Velachery",
    city: "Chennai",
    tagline: "Mall, MRTS & IIT Madras Gateway",
    avgPgSingle: 12500,
    avgPgShared: 8000,
    avg1Bhk: 18500,
    metroRating: 4.0,
    safetyRating: 4.4,
    foodDensityRating: 4.6,
    vibeScore: 4.4,
    crowd: "IIT Madras Researchers, Guindy Professionals",
    distanceToTechColleges: "10 mins to IIT Madras & Anna University",
    highlights: ["MRTS rail and upcoming metro link", "Phoenix MarketCity & Grand Mall", "Wide choice of messes and tiffin services"]
  },
  "salt_lake_sector_v": {
    name: "Salt Lake Sector V",
    city: "Kolkata",
    tagline: "Eastern India's Tech Township",
    avgPgSingle: 12000,
    avgPgShared: 7000,
    avg1Bhk: 16000,
    metroRating: 4.3,
    safetyRating: 4.6,
    foodDensityRating: 4.3,
    vibeScore: 4.2,
    crowd: "IT Engineers, BPO Professionals, Startup Teams",
    distanceToTechColleges: "Walk to Wipro, TCS & Infinity Benchmark, 15 mins to MAKAUT",
    highlights: ["Purple Line metro to Esplanade", "Planned grid with wide footpaths", "Affordable street food at College More"]
  },
  "new_town": {
    name: "New Town (Rajarhat)",
    city: "Kolkata",
    tagline: "Green Smart City near Eco Park",
    avgPgSingle: 10500,
    avgPgShared: 7000,
    avg1Bhk: 15000,
    metroRating: 3.8,
    safetyRating: 4.7,
    foodDensityRating: 4.0,
    vibeScore: 4.3,
    crowd: "Amity Students, TCS Gitanjali Park Staff",
    distanceToTechColleges: "Near Amity, St. Xavier's University & Biswa Bangla",
    highlights: ["Eco Park & Biswa Bangla Gate", "Clean, planned smart city", "Close to Kolkata Airport"]
  },
  "navrangpura": {
    name: "Navrangpura",
    city: "Ahmedabad",
    tagline: "Ahmedabad's Student & Culture Hub",
    avgPgSingle: 10000,
    avgPgShared: 6500,
    avg1Bhk: 15000,
    metroRating: 4.2,
    safetyRating: 4.7,
    foodDensityRating: 4.8,
    vibeScore: 4.5,
    crowd: "CEPT, Gujarat University & IIM-A Students",
    distanceToTechColleges: "Walk to CEPT, 10 mins to IIM Ahmedabad",
    highlights: ["Law Garden night food market", "Blue Line metro stations", "Very safe for late-night commute"]
  },
  "kharadi": {
    name: "Kharadi",
    city: "Pune",
    tagline: "EON IT Park & WTC Corridor",
    avgPgSingle: 13500,
    avgPgShared: 9000,
    avg1Bhk: 21000,
    metroRating: 3.5,
    safetyRating: 4.6,
    foodDensityRating: 4.4,
    vibeScore: 4.5,
    crowd: "Barclays, Credit Suisse & EON IT Park Staff",
    distanceToTechColleges: "Walk to EON IT Park, 20 mins to Viman Nagar colleges",
    highlights: ["Integrated townships with pools & gyms", "Riverside walks along Mula-Mutha", "Growing cafe and brewery scene"]
  },
  "electronic_city": {
    name: "Electronic City",
    city: "Bengaluru",
    tagline: "Bengaluru's Original IT Hub",
    avgPgSingle: 9500,
    avgPgShared: 6500,
    avg1Bhk: 14500,
    metroRating: 3.6,
    safetyRating: 4.4,
    foodDensityRating: 4.0,
    vibeScore: 4.0,
    crowd: "Infosys, Wipro & HCL Engineers, Freshers",
    distanceToTechColleges: "Shuttles to Infosys & Wipro campuses, 10 mins to PES South",
    highlights: ["Lowest PG rents among Bengaluru tech hubs", "Elevated expressway to Silk Board", "Yellow Line metro connectivity"]
  },
  "financial_district": {
    name: "Financial District",
    city: "Hyderabad",
    tagline: "Hyderabad's Big Tech Campus Belt",
    avgPgSingle: 15000,
    avgPgShared: 9500,
    avg1Bhk: 23000,
    metroRating: 3.4,
    safetyRating: 4.7,
    foodDensityRating: 4.3,
    vibeScore: 4.6,
    crowd: "Microsoft, Amazon & Google Engineers",
    distanceToTechColleges: "Walk to Microsoft & Amazon campuses, 15 mins to ISB & IIIT-H",
    highlights: ["Premium gated communities", "Quick ORR access to the airport", "Upscale dining at Nanakramguda"]
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
