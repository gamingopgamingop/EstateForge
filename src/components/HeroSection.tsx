import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProperties } from "../contexts/PropertiesContext";
import VoiceSearchBar from "./VoiceSearchBar";
import { parseVoiceQuery } from "../utils/voiceSearch";
import { toast } from "sonner";
import {
  Search,
  ShieldCheck,
  Scale,
  Calculator,
  Lock,
  ArrowRight,
  MapPin,
  CheckCircle2
} from "lucide-react";

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { filterProperties } = useProperties();
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("all");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterProperties({
      locality: locality.trim(),
      accommodationType: type !== "all" ? type : undefined,
      availableOnly: true
    });
    navigate("/properties");
  };

  const handleVoiceSearch = (text: string) => {
    const voiceFilters = parseVoiceQuery(text);
    filterProperties({
      ...voiceFilters,
      locality: voiceFilters.locality || locality.trim() || undefined,
      accommodationType: voiceFilters.accommodationType || (type !== "all" ? type : undefined),
      availableOnly: true
    });
    toast.success(`Voice search applied: "${text}"`);
    navigate("/properties");
  };

  return (
    <div className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-slate-950">
      {/* Background with modern dark overlay & subtle gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=80)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
      </div>

      {/* Floating glowing orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 z-10 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-900/60 border border-violet-500/30 text-violet-300 text-xs font-semibold backdrop-blur-md animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Accommodations • Transparent Rental Discovery</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
            Find Accommodation{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
              Transparently
            </span>
            , Without Spam.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Engineered for students and working professionals. Compare PGs, hostels, and shared flats side-by-side with genuine pricing and protected contact details.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleHeroSearch}
            className="p-2 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-grow">
              <MapPin className="w-4 h-4 text-violet-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Enter Locality (e.g. Koramangala, HSR, North Campus)..."
                className="pl-9 h-11 bg-white/10 border-transparent text-white placeholder:text-slate-400 text-xs sm:text-sm focus:border-violet-500 focus:bg-white/20"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 rounded-md bg-slate-900 border border-slate-700 text-white px-3 text-xs focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Types</option>
              <option value="PG">PG</option>
              <option value="Hostel">Hostel</option>
              <option value="Shared Flat">Shared Flat</option>
              <option value="Room">Private Room</option>
            </select>

            <Button
              type="submit"
              className="h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm gap-2 shrink-0 shadow-lg"
            >
              <Search className="w-4 h-4" /> Find Accommodations
            </Button>
          </form>

          {/* Hero Voice Search (Hindi / English) */}
          <div className="max-w-2xl mx-auto pt-1">
            <VoiceSearchBar
              placeholder="🎙 Say: 2 BHK under 15000 Koramangala  ·  या कहें: कोरमंगला में 15000 से कम का मकान"
              onTranscript={handleVoiceSearch}
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Voice search works in Hindi & English — or tap the green phone button to talk to the voice agent.
            </p>
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/compare">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/15 text-xs gap-1.5 h-9 rounded-lg">
                <Scale className="w-3.5 h-3.5 text-blue-400" /> Compare Shortlist
              </Button>
            </Link>
            <Link to="/affordability">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/15 text-xs gap-1.5 h-9 rounded-lg">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" /> 30% Affordability Calculator
              </Button>
            </Link>
            <Link to="/owner/enquiries">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/15 text-xs gap-1.5 h-9 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Owner Dashboard
              </Button>
            </Link>
          </div>

          {/* 4 Feature Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Badges
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Distinguishes physically audited vs owner-claimed properties.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-1">
                <Lock className="w-4 h-4 text-blue-400" /> Privacy Protected
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Zero spam calls. Private phone numbers shared only with consent.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-1">
                <Scale className="w-4 h-4 text-amber-400" /> Side-by-Side Table
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Compare rent, security deposit, mess meals, and house rules.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-rose-400" /> Fair Housing
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Zero discrimination by caste, religion, food, or gender.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
