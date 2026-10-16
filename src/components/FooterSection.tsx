import React from "react";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, Heart, Scale, Calculator, Users, ClipboardCheck } from "lucide-react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      {/* Fair Housing & Non-Discrimination Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 py-3.5 px-4 text-center">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Fair Housing Pledge:</strong> RentRight strictly prohibits any discrimination based on religion, caste, gender, sexual orientation, or arbitrary housing refusal.
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span>RentRight</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              Transparent accommodation discovery platform built for university students and early-career working professionals.
            </p>
            <div className="text-[11px] text-slate-500">
              Compliant with HackVision Problem Statement A3.
            </div>
          </div>

          {/* Accommodations */}
          <div>
            <h4 className="text-slate-100 font-bold uppercase tracking-wider text-[11px] mb-3">
              Accommodations
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="hover:text-white transition">All Listings</Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition">Student Hostels & PGs</Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition">Working Professional Flats</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition flex items-center gap-1">
                  <Scale className="w-3 h-3 text-violet-400" /> Comparison Matrix
                </Link>
              </li>
            </ul>
          </div>

          {/* Innovation Utilities */}
          <div>
            <h4 className="text-slate-100 font-bold uppercase tracking-wider text-[11px] mb-3">
              Decision Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/affordability" className="hover:text-white transition flex items-center gap-1.5">
                  <Calculator className="w-3 h-3 text-emerald-400" /> 30% Affordability Calculator
                </Link>
              </li>
              <li>
                <Link to="/roommate-matcher" className="hover:text-white transition flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-rose-400" /> Roommate Matcher Quiz
                </Link>
              </li>
              <li>
                <Link to="/inspection-checklist" className="hover:text-white transition flex items-center gap-1.5">
                  <ClipboardCheck className="w-3 h-3 text-blue-400" /> Property Inspection Checklist
                </Link>
              </li>
              <li>
                <Link to="/locality-compare" className="hover:text-white transition">
                  Locality Benchmark Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Owner & Account */}
          <div>
            <h4 className="text-slate-100 font-bold uppercase tracking-wider text-[11px] mb-3">
              Portals & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/owner/enquiries" className="hover:text-white transition">
                  Owner Portal & Listings
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Seeker Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Verification Guidelines
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Report a Problem
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} RentRight. Built for HackVision • All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-300">Terms of Tenancy</Link>
            <Link to="/about" className="hover:text-slate-300">Fair Housing Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
