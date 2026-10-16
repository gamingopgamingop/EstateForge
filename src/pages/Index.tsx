import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import HeroSection from "../components/HeroSection";
import FeaturedProperties from "../components/FeaturedProperties";
import CompareFloatingBar from "../components/CompareFloatingBar";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Scale,
  Calculator,
  Users,
  ClipboardCheck,
  ArrowRight,
  Lock,
  Sparkles,
  Building2,
  CheckCircle2,
  HeartHandshake
} from "lucide-react";

export const Index: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeaderSection />
      <HeroSection />

      {/* Innovation Utilities Strip */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Innovation Toolkit
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Designed to Solve Renter Frustrations
              </h2>
            </div>
            <Link to="/tools">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                Explore All Tools <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/affordability" className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-violet-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">30% Affordability Calculator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check whether a rental fits safely into your student stipend or monthly salary.
              </p>
            </Link>

            <Link to="/compare" className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-violet-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Comparison Matrix</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick 2-4 properties and compare deposits, amenities, food, and curfew side-by-side.
              </p>
            </Link>

            <Link to="/roommate-matcher" className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-violet-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Roommate Compatibility</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                6-factor quiz aligning sleep schedules, food habits, and hygiene expectations.
              </p>
            </Link>

            <Link to="/inspection-checklist" className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-violet-300 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Inspection Checklist</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                15-point mobile checklist for physical tours to audit water pressure and sub-meters.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <FeaturedProperties />

      {/* How RentRight Works */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mb-3">
              How RentRight Works
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              A transparent, safe, and spam-free rental discovery workflow built for modern renters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto text-lg font-bold shadow-md">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Locality & Budget Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter verified rooms, PGs, hostels, and shared flats by locality, university proximity, and budget.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto text-lg font-bold shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Side-by-Side Comparison</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare rent, security deposits, included mess meals, WiFi speeds, and curfew rules on an interactive table.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto text-lg font-bold shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Spam-Free Enquiry & Tour</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contact owners and book in-person viewings without exposing your private phone number to brokers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Housing & Anti-Discrimination Community Statement */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            RentRight Fair Housing Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are committed to transparent, non-discriminatory housing for all students and young professionals. Every listed property agrees to zero bias in tenant selection, honest deposit refund covenants, and full fee transparency.
          </p>
          <div className="pt-2">
            <Link to="/about">
              <Button variant="outline" className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20">
                Read Community Tenancy Code
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating comparison drawer */}
      <CompareFloatingBar />

      <FooterSection />
    </div>
  );
};

export default Index;