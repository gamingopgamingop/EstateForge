import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Info,
  DollarSign,
  PieChart as PieIcon,
  HelpCircle
} from "lucide-react";
import { useProperties } from "../contexts/PropertiesContext";

export const AffordabilityCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { filterProperties } = useProperties();

  const [persona, setPersona] = useState<"student" | "professional">("student");
  const [income, setIncome] = useState<number>(25000);
  const [intendedRent, setIntendedRent] = useState<number>(10000);
  const [utilities, setUtilities] = useState<number>(1500);
  const [food, setFood] = useState<number>(5000);
  const [commute, setCommute] = useState<number>(1500);

  // Recommended rent based on 30% rule
  const recommendedRent = Math.round(income * 0.30);
  const maxStretchRent = Math.round(income * 0.40);

  // Calculate percentage of intended rent against income
  const rentRatio = income > 0 ? (intendedRent / income) * 100 : 0;
  const totalHousingCost = intendedRent + utilities;
  const remainingForSavings = income - (totalHousingCost + food + commute);

  // Status classification
  let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
  let statusTitle = "Safe Budget (< 30%)";
  let statusMessage = "This rent is within the healthy 30% financial guideline, leaving you sufficient headroom for living expenses and emergency savings.";
  let statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;

  if (rentRatio > 40) {
    statusColor = "text-rose-600 bg-rose-50 border-rose-200";
    statusTitle = "High Housing Stress (> 40%)";
    statusMessage = "CRITICAL WARNING: This rent takes over 40% of your total income. You may experience severe budget stress or difficulty meeting unexpected expenses.";
    statusIcon = <AlertTriangle className="w-5 h-5 text-rose-600" />;
  } else if (rentRatio > 30) {
    statusColor = "text-amber-700 bg-amber-50 border-amber-200";
    statusTitle = "Moderate Stretch (30% - 40%)";
    statusMessage = "NOTICE: This rent exceeds the recommended 30% ceiling. Ensure your food, travel, and utility expenses are lean to avoid debt.";
    statusIcon = <Info className="w-5 h-5 text-amber-600" />;
  }

  const handleApplyBudgetToSearch = () => {
    filterProperties({ maxRent: recommendedRent, availableOnly: true });
    navigate("/properties");
  };

  const handlePreset = (type: "student" | "professional") => {
    setPersona(type);
    if (type === "student") {
      setIncome(20000);
      setIntendedRent(7500);
      setUtilities(1000);
      setFood(4500);
      setCommute(1000);
    } else {
      setIncome(55000);
      setIntendedRent(16000);
      setUtilities(2500);
      setFood(9000);
      setCommute(3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Rental Affordability Calculator
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              The 30% Golden Rule for Students & Professionals: Prevent rental financial stress before signing any lease agreement.
            </p>
          </div>

          {/* Persona Switcher */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
              <button
                onClick={() => handlePreset("student")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                  persona === "student"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🎓 Student / Intern Mode
              </button>
              <button
                onClick={() => handlePreset("professional")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                  persona === "professional"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                💼 Working Professional Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-slate-200 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                    <span>Income & Housing Parameters</span>
                    <span className="text-xs font-normal text-slate-500">Currency: INR (₹)</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Adjust your monthly in-hand cashflow to discover your safe rental brackets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Monthly Income */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-slate-800">
                        Monthly In-Hand {persona === "student" ? "Allowance / Stipend" : "Salary"}
                      </label>
                      <span className="text-base font-bold text-violet-700">₹{income.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[income]}
                      onValueChange={(val) => setIncome(val[0])}
                      min={8000}
                      max={150000}
                      step={1000}
                      className="py-1"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>₹8,000</span>
                      <span>₹75,000</span>
                      <span>₹1,50,000</span>
                    </div>
                  </div>

                  {/* Intended Rent Slider */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        Test a Target Monthly Rent
                        <span className="text-[11px] text-slate-500 font-normal">({rentRatio.toFixed(1)}% of income)</span>
                      </label>
                      <span className="text-base font-bold text-slate-900">₹{intendedRent.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[intendedRent]}
                      onValueChange={(val) => setIntendedRent(val[0])}
                      min={3000}
                      max={60000}
                      step={500}
                      className="py-1"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>₹3,000</span>
                      <span>₹30,000</span>
                      <span>₹60,000</span>
                    </div>
                  </div>

                  {/* Additional living expenses breakdown */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Other Monthly Essentials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-700">Utilities / WiFi</label>
                        <Input
                          type="number"
                          value={utilities}
                          onChange={(e) => setUtilities(Number(e.target.value))}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700">Food / Mess / Groceries</label>
                        <Input
                          type="number"
                          value={food}
                          onChange={(e) => setFood(Number(e.target.value))}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700">Daily Commute</label>
                        <Input
                          type="number"
                          value={commute}
                          onChange={(e) => setCommute(Number(e.target.value))}
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Rule Card */}
              <div className="bg-violet-50/70 border border-violet-200 rounded-xl p-4 text-xs text-violet-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm text-violet-900">
                  <ShieldCheck className="w-4 h-4 text-violet-600" /> What is the 30% Rental Rule?
                </div>
                <p className="leading-relaxed">
                  Financial advisors globally recommend spending no more than <strong>30% of your gross monthly in-hand earnings</strong> on rent. For students and early-career pros in metro hubs, exceeding 40% leaves you exposed to food inflation and prevents emergency buffer accumulation.
                </p>
              </div>
            </div>

            {/* Verdict & Recommended Results Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Verdict Card */}
              <Card className="border-slate-200 shadow-lg overflow-hidden">
                <div className={`p-4 border-b flex items-start gap-3 ${statusColor}`}>
                  {statusIcon}
                  <div>
                    <h3 className="font-bold text-sm">{statusTitle}</h3>
                    <p className="text-xs mt-0.5 leading-relaxed opacity-95">{statusMessage}</p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Recommended Rent (30%)</div>
                      <div className="text-xl font-extrabold text-emerald-600 mt-1">₹{recommendedRent.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Zero stress limit</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Max Stretch Rent (40%)</div>
                      <div className="text-xl font-extrabold text-amber-600 mt-1">₹{maxStretchRent.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Absolute ceiling</div>
                    </div>
                  </div>

                  {/* Monthly Budget Breakdown */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800 flex justify-between">
                      <span>Monthly Income Allocation</span>
                      <span>100% (₹{income.toLocaleString()})</span>
                    </div>

                    {/* Progress Bar Breakdown */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.min(rentRatio, 100)}%` }}
                        className={`${rentRatio > 40 ? "bg-rose-500" : rentRatio > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                        title={`Rent: ${rentRatio.toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${Math.min((food / income) * 100, 100)}%` }}
                        className="bg-blue-400"
                        title="Food / Mess"
                      />
                      <div
                        style={{ width: `${Math.min((utilities / income) * 100, 100)}%` }}
                        className="bg-purple-400"
                        title="Utilities"
                      />
                      <div
                        style={{ width: `${Math.min((commute / income) * 100, 100)}%` }}
                        className="bg-orange-400"
                        title="Commute"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Rent: ₹{intendedRent.toLocaleString()} ({rentRatio.toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                        <span>Food: ₹{food.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                        <span>Utilities: ₹{utilities.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                        <span>Commute: ₹{commute.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 mt-3 rounded-lg bg-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Projected Monthly Savings / Buffer:</span>
                      <span className={`font-bold ${remainingForSavings >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        ₹{remainingForSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Direct Link to filtered search */}
                  <div className="pt-2">
                    <Button
                      onClick={handleApplyBudgetToSearch}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2 py-5 shadow-md"
                    >
                      Search Rentals Under ₹{recommendedRent.toLocaleString()}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-[11px] text-center text-slate-400 mt-2">
                      Applies budget filter automatically to verified accommodations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default AffordabilityCalculatorPage;
