import React from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { ShieldCheck, HeartHandshake, Lock, Scale, Building2, Users } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-violet-600" /> About RentRight
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Transparent Accommodation for Students & Working Professionals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Addressing HackVision Problem Statement A3: Helping students and young professionals discover accommodation, compare options, contact landlords safely, and manage transparent leases.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Spam-Free Enquiry System</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never broadcast tenant phone numbers to open broker databases. All inquiries are double-blind until you choose to authorize contact sharing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Verified vs Claimed Badges</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                RentRight separates physically audited student hostels from owner-claimed listings, ensuring complete visibility into water pressure, sub-meter rates, and wifi speeds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Strict Non-Discrimination</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero arbitrary housing denials based on religion, caste, marital status, food preferences, or gender. Every seeker is treated with dignity and equal tenancy access.
              </p>
            </div>
          </div>

          {/* Core Problem We Solve */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Why RentRight Exists</h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Finding rental accommodation in major university and IT corridors like Bengaluru, Delhi NCR, and Pune is plagued by hidden broker fees, fake photo listings, intrusive landlord questions, and endless spam calls after registering on legacy portals.
              </p>
              <p>
                <strong>RentRight</strong> replaces opacity with structure:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-800 font-medium pl-2">
                <li>30% Affordability Calculator ensures students never over-commit on housing.</li>
                <li>Side-by-side comparison matrix lets you evaluate deposits, mess meals, and curfew rules.</li>
                <li>On-site inspection checklist empowers seekers to catch plumbing and sub-meter issues before handing over cash.</li>
                <li>Owner dashboard equips genuine landlords to manage vacancies and respond to verified inquiries transparently.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default AboutPage;
