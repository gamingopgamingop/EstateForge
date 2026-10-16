import React, { useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Wine,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface FlatmateProfile {
  id: number;
  name: string;
  avatar: string;
  role: string;
  locality: string;
  budget: string;
  sleepCycle: string;
  diet: string;
  alcohol: "Non-Alcoholic" | "Social Drinker" | "Regular Drinker";
  cleanliness: string;
  socialVibe: string;
  bio: string;
  lookingFor: string;
}

const SAMPLE_FLATMATES: FlatmateProfile[] = [
  {
    id: 1,
    name: "Aman Singhania",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    role: "Software Engineer @ Zeta",
    locality: "HSR Layout Sector 2",
    budget: "₹14,000 - ₹18,000",
    sleepCycle: "Night Owl (1 AM - 8:30 AM)",
    diet: "Non-Vegetarian",
    alcohol: "Social Drinker",
    cleanliness: "Organized & Clean",
    socialVibe: "Occasional Friends on Weekends",
    bio: "Looking for a flatmate in a 3BHK flat in HSR. I cook North Indian food on weekends and love gaming on PS5. Very respectful of quiet hours on weekdays.",
    lookingFor: "Clean, non-smoker flatmate who works in tech/startups."
  },
  {
    id: 2,
    name: "Divya Krishnan",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    role: "Masters Student @ IISc",
    locality: "Koramangala 4th Block",
    budget: "₹10,000 - ₹14,000",
    sleepCycle: "Early Riser (6:30 AM - 11 PM)",
    diet: "Vegetarian",
    alcohol: "Non-Alcoholic",
    cleanliness: "Very Particular & Minimalist",
    socialVibe: "Quiet Sanctuary & Study Mode",
    bio: "Prepping for thesis and research. Need a peaceful PG/flat sharing environment with someone who values quiet evenings and keeps common spaces neat.",
    lookingFor: "Vegetarian or eggetarian student / researcher."
  },
  {
    id: 3,
    name: "Kabir & Rohan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    role: "Product Designers @ Startup",
    locality: "Indiranagar",
    budget: "₹16,000 - ₹20,000",
    sleepCycle: "Night Owl (12:30 AM - 8 AM)",
    diet: "Any / Foodie",
    alcohol: "Regular Drinker",
    cleanliness: "Moderate",
    socialVibe: "Social & Creative",
    bio: "We have 1 master bedroom available in our spacious 3BHK duplex in Indiranagar. Big terrace garden, high speed WiFi, and great filter coffee setup.",
    lookingFor: "Chilled out working professional who respects mutual boundaries."
  }
];

export const RoommateMatcherPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [sleepHabit, setSleepHabit] = useState("Night Owl");
  const [dietHabit, setDietHabit] = useState("Any");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [alcoholPref, setAlcoholPref] = useState<FlatmateProfile["alcohol"]>("Non-Alcoholic");
  const [cleanliness, setCleanliness] = useState("High");
  const [socialVibe, setSocialVibe] = useState("Moderate");
  const [acUsage, setAcUsage] = useState("Split Evenly");
  const [matched, setMatched] = useState(false);
  const [mutualViewProfile, setMutualViewProfile] = useState<FlatmateProfile | null>(null);
  const [requestSentTo, setRequestSentTo] = useState<number | null>(null);

  const handleComputeMatch = () => {
    setMatched(true);
    toast.success("Roommate compatibility scores computed!");
  };

  const getMatchScore = (profile: FlatmateProfile) => {
    let score = 72;
    if (profile.sleepCycle.includes(sleepHabit)) score += 10;
    if (dietHabit === "Any" || profile.diet.includes(dietHabit)) score += 8;
    if (cleanliness === "High" && profile.cleanliness.includes("Organized")) score += 6;
    // Alcohol compatibility: exact match bonus, strict clash penalty
    if (profile.alcohol === alcoholPref) score += 10;
    else if (alcoholPref === "Non-Alcoholic" && profile.alcohol === "Regular Drinker") score -= 18;
    else if (alcoholPref === "Non-Alcoholic" && profile.alcohol === "Social Drinker") score -= 8;
    else if (alcoholPref === "Regular Drinker" && profile.alcohol === "Non-Alcoholic") score -= 10;
    return Math.max(35, Math.min(score, 98));
  };

  const alcoholBadgeStyle = (alcohol: FlatmateProfile["alcohol"]) =>
    alcohol === "Non-Alcoholic"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : alcohol === "Social Drinker"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const myProfileSummary = {
    sleepCycle: sleepHabit,
    workMode,
    diet: dietHabit === "Vegetarian" ? "Vegetarian" : dietHabit === "Eggetarian" ? "Eggetarian" : "Any / Non-Veg",
    alcohol: alcoholPref,
    cleanliness,
    socialVibe,
    acUsage,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5" /> RentRight Innovation Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Roommate Compatibility Matcher
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Take the 7-factor co-living lifestyle quiz to avoid flatmate friction before sharing a roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Questionnaire Column */}
            <div className="md:col-span-6 space-y-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" /> Lifestyle Preferences
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Answer these 7 core parameters to discover your ideal flatmate archetype.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* 1. Sleep Schedule */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">1. Sleep & Wake-up Schedule</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Early Riser (6 AM - 11 PM)", "Night Owl (1 AM - 8:30 AM)"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSleepHabit(opt.split(" ")[0])}
                          className={`p-2 rounded-lg border text-left transition ${
                            sleepHabit === opt.split(" ")[0]
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Work / Study Mode */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">2. Daily Routine & Work Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Daily Office / Campus", "Hybrid", "Full Remote / Study"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setWorkMode(opt)}
                          className={`p-2 rounded-lg border text-center transition ${
                            workMode === opt
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Diet & Kitchen */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">3. Dietary Preference in Shared Kitchen</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Vegetarian Only", "Eggetarian", "Any / Non-Veg"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDietHabit(opt.split(" ")[0])}
                          className={`p-2 rounded-lg border text-center transition ${
                            dietHabit === opt.split(" ")[0]
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Alcohol Preference */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">4. Alcohol Preference</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Non-Alcoholic", "Social Drinker", "Regular Drinker"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAlcoholPref(opt)}
                          className={`p-2 rounded-lg border text-center transition flex items-center justify-center gap-1 ${
                            alcoholPref === opt
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt === "Non-Alcoholic" ? <ShieldCheck className="w-3 h-3" /> : <Wine className="w-3 h-3" />}
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Cleanliness Standard */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">5. Cleanliness & Tidiness Standard</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["High (Spotless)", "Moderate (Weekly)", "Relaxed"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCleanliness(opt.split(" ")[0])}
                          className={`p-2 rounded-lg border text-center transition ${
                            cleanliness === opt.split(" ")[0]
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6. Social Vibe */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">6. Guests & Social Vibe</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Quiet Sanctuary", "Occasional Guests", "Social & Gatherings"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSocialVibe(opt.split(" ")[0])}
                          className={`p-2 rounded-lg border text-center transition ${
                            socialVibe === opt.split(" ")[0]
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. AC & Electricity Split */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">7. AC & Electricity Cost Preference</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Split Evenly & Run Freely", "Eco / Individual Sub-Meter"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAcUsage(opt.split(" ")[0])}
                          className={`p-2 rounded-lg border text-center transition ${
                            acUsage === opt.split(" ")[0]
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-semibold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleComputeMatch}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-4"
                  >
                    Compute Flatmate Matches
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Matched Profiles Column */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-rose-500" /> Compatible Seekers & Flatmates
                </h3>
                <span className="text-xs text-slate-500">Live Profiles</span>
              </div>

              {SAMPLE_FLATMATES.map((profile) => {
                const score = getMatchScore(profile);
                return (
                  <Card key={profile.id} className="border-slate-200 shadow-sm hover:border-slate-300 transition">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{profile.name}</h4>
                            <p className="text-xs text-slate-500">{profile.role}</p>
                            <span className="text-[11px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded inline-block mt-0.5">
                              📍 {profile.locality} • Budget: {profile.budget}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-emerald-600">{score}%</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={`text-[10px] font-semibold gap-1 ${alcoholBadgeStyle(profile.alcohol)}`}>
                          {profile.alcohol === "Non-Alcoholic" ? <ShieldCheck className="w-3 h-3" /> : <Wine className="w-3 h-3" />}
                          {profile.alcohol}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-semibold gap-1 bg-slate-50 text-slate-700 border-slate-200">
                          🍽 {profile.diet}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-semibold gap-1 bg-slate-50 text-slate-700 border-slate-200">
                          🧹 {profile.cleanliness}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{profile.bio}"
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Schedule:</span>
                          <span className="font-medium">{profile.sleepCycle}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Social Vibe:</span>
                          <span className="font-medium">{profile.socialVibe}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Seeking: {profile.lookingFor}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setMutualViewProfile(profile)}
                            className="text-xs h-7 px-2.5 border-violet-200 text-violet-700 hover:bg-violet-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Mutual View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setRequestSentTo(profile.id);
                              toast.success(`Connection request transmitted to ${profile.name}! Your profile is now visible to them.`);
                            }}
                            disabled={requestSentTo === profile.id}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-7 px-3"
                          >
                            {requestSentTo === profile.id ? "Request Sent" : "Connect"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Mutual Profile View Dialog */}
      <Dialog open={!!mutualViewProfile} onOpenChange={(open) => !open && setMutualViewProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {mutualViewProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Eye className="w-4 h-4 text-violet-600" /> Mutual Profile View — You See Each Other
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Once a connection request is exchanged, both flatmates can see each other's full lifestyle
                  profile. Here's how your quiz answers compare with {mutualViewProfile.name}'s.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Their side */}
                <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={mutualViewProfile.avatar}
                      alt={mutualViewProfile.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{mutualViewProfile.name}</h4>
                      <p className="text-[10px] text-slate-500">{mutualViewProfile.role}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">📍 {mutualViewProfile.locality} • 💰 {mutualViewProfile.budget}</p>
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    <div><span className="text-slate-400 block text-[10px]">Sleep Schedule:</span><span className="font-medium">{mutualViewProfile.sleepCycle}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Diet:</span><span className="font-medium">{mutualViewProfile.diet}</span></div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alcohol:</span>
                      <Badge variant="outline" className={`text-[10px] font-semibold gap-1 ${alcoholBadgeStyle(mutualViewProfile.alcohol)}`}>
                        {mutualViewProfile.alcohol === "Non-Alcoholic" ? <ShieldCheck className="w-3 h-3" /> : <Wine className="w-3 h-3" />}
                        {mutualViewProfile.alcohol}
                      </Badge>
                    </div>
                    <div><span className="text-slate-400 block text-[10px]">Cleanliness:</span><span className="font-medium">{mutualViewProfile.cleanliness}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Social Vibe:</span><span className="font-medium">{mutualViewProfile.socialVibe}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Seeking:</span><span className="font-medium">{mutualViewProfile.lookingFor}</span></div>
                  </div>
                </div>

                {/* Your side (what they see of you) */}
                <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">You</div>
                    <div>
                      <h4 className="font-bold text-slate-900">Your Profile</h4>
                      <p className="text-[10px] text-slate-500">Visible to {mutualViewProfile.name} after you connect</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1 border-t border-violet-100">
                    <div><span className="text-slate-400 block text-[10px]">Sleep Schedule:</span><span className="font-medium">{myProfileSummary.sleepCycle}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Work Mode:</span><span className="font-medium">{myProfileSummary.workMode}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Diet:</span><span className="font-medium">{myProfileSummary.diet}</span></div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alcohol:</span>
                      <Badge variant="outline" className={`text-[10px] font-semibold gap-1 ${alcoholBadgeStyle(myProfileSummary.alcohol)}`}>
                        {myProfileSummary.alcohol === "Non-Alcoholic" ? <ShieldCheck className="w-3 h-3" /> : <Wine className="w-3 h-3" />}
                        {myProfileSummary.alcohol}
                      </Badge>
                    </div>
                    <div><span className="text-slate-400 block text-[10px]">Cleanliness:</span><span className="font-medium">{myProfileSummary.cleanliness}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Social Vibe:</span><span className="font-medium">{myProfileSummary.socialVibe}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Utilities:</span><span className="font-medium">{myProfileSummary.acUsage}</span></div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                Privacy-first: full names and contact details stay hidden. Phone numbers are only shared via the
                Safe Contact system after both flatmates accept each other.
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setMutualViewProfile(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setRequestSentTo(mutualViewProfile.id);
                    toast.success(`Mutual profile exchange initiated with ${mutualViewProfile.name}! Both profiles are now visible.`);
                    setMutualViewProfile(null);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                >
                  <HeartHandshake className="w-3.5 h-3.5 mr-1.5" /> Request Mutual Connect
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default RoommateMatcherPage;
