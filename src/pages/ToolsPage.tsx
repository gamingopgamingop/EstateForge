import React from "react";
import { Link } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Users, ClipboardCheck, Navigation, ArrowRight, Sparkles, Scale, ShieldCheck, MapPin } from "lucide-react";

export const ToolsPage: React.FC = () => {
  const tools = [
    {
      title: "Rental Affordability Calculator",
      badge: "Financial Health",
      desc: "Apply the standard 30% rule to your monthly stipend or salary to find healthy rental brackets and avoid housing distress.",
      icon: <Calculator className="w-6 h-6 text-violet-600" />,
      path: "/affordability",
      color: "bg-violet-50 text-violet-700 border-violet-200"
    },
    {
      title: "Property Comparison Matrix",
      badge: "Side-by-Side Table",
      desc: "Compare up to 4 shortlisted accommodations across rent, security deposits, included amenities, and house rules.",
      icon: <Scale className="w-6 h-6 text-blue-600" />,
      path: "/compare",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      title: "Roommate Compatibility Matcher",
      badge: "Co-Living Quiz",
      desc: "6-factor lifestyle questionnaire assessing sleep cycle, dietary habits, hygiene, and social preferences to find your ideal flatmate.",
      icon: <Users className="w-6 h-6 text-rose-600" />,
      path: "/roommate-matcher",
      color: "bg-rose-50 text-rose-700 border-rose-200"
    },
    {
      title: "Structured Property Inspection Checklist",
      badge: "On-Site Physical Audit",
      desc: "15-point digital verification checklist to carry during physical tours. Evaluates water pressure, sub-meter transparency, and security.",
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
      path: "/inspection-checklist",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      title: "Locality Comparison & Intelligence",
      badge: "Area Analysis",
      desc: "Benchmark student and tech neighborhoods on average PG rent, metro proximity, night safety, and youth crowd vibe.",
      icon: <Navigation className="w-6 h-6 text-amber-600" />,
      path: "/locality-compare",
      color: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      title: "Commute + Cost Calculator",
      badge: "Travel Intelligence",
      desc: "Enter your college or office location to auto-calculate distance, travel time, and monthly commute cost for every property using smart geo-matching.",
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      path: "/commute-calculator",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> RentRight Innovation Suite
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tools & Decision Systems for Renters
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
              Transparent utilities engineered specifically to help students and working professionals make confident housing choices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Card key={t.title} className="border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition flex flex-col justify-between">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {t.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${t.color}`}>
                      {t.badge}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900">{t.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-600 leading-relaxed">
                    {t.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={t.path}>
                    <Button variant="outline" className="w-full text-xs font-semibold justify-between group hover:bg-violet-600 hover:text-white transition">
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Non-Discrimination & Fair Housing Pledge Banner */}
          <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">RentRight Fair Housing & Non-Discrimination Policy</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  We enforce zero discrimination based on religion, caste, gender, food habits, or orientation. Verified listings comply with fair tenancy codes.
                </p>
              </div>
            </div>
            <Link to="/about">
              <Button size="sm" variant="outline" className="text-xs shrink-0">
                Community Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default ToolsPage;
