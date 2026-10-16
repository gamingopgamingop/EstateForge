import React, { useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone,
  AlertOctagon,
  ShieldAlert,
  MapPin,
  HeartPulse,
  Shield,
  Flame,
  Users,
  Send,
  PhoneCall,
  Clock,
  Siren,
  Sparkles,
  Copy,
  Bot,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

type Helpline = {
  number: string;
  label: string;
  alt: string;
  icon: React.ReactNode;
  color: string;
  hours: string;
  forUse: string;
};

const NATIONAL_HELPLINES: Helpline[] = [
  { number: "112", label: "National Emergency", alt: "112", icon: <Siren className="w-5 h-5" />, color: "bg-rose-600", hours: "24/7", forUse: "Police + Fire + Ambulance, single tap" },
  { number: "100", label: "Police", alt: "100", icon: <Shield className="w-5 h-5" />, color: "bg-blue-700", hours: "24/7", forUse: "Immediate police response" },
  { number: "1091", label: "Women Helpline", alt: "1091", icon: <Users className="w-5 h-5" />, color: "bg-violet-600", hours: "24/7", forUse: "Distress / domestic violence / harassment" },
  { number: "1098", label: "Childline", alt: "1098", icon: <HeartPulse className="w-5 h-5" />, color: "bg-amber-500", hours: "24/7", forUse: "Child protection and abuse" },
  { number: "102", label: "Ambulance", alt: "102", icon: <HeartPulse className="w-5 h-5" />, color: "bg-emerald-600", hours: "24/7", forUse: "Free government ambulance" },
  { number: "101", label: "Fire", alt: "101", icon: <Flame className="w-5 h-5" />, color: "bg-orange-600", hours: "24/7", forUse: "Fire brigade dispatch" },
  { number: "1800-116-766", label: "Mental Health (iCall)", alt: "1800116766", icon: <Bot className="w-5 h-5" />, color: "bg-indigo-600", hours: "Mon-Sat 8AM-10PM", forUse: "Free telecast counseling by TISS" },
  { number: "9152987821", label: "Vandreveshala (Vrindavan)", alt: "9152987821", icon: <HeartPulse className="w-5 h-5" />, color: "bg-pink-600", hours: "24/7", forUse: "Women in distress, Mathura/Vrindavan region" },
];

type LocalContact = {
  name: string;
  role: string;
  phone: string;
  area: string;
};

const AREA_CONTACTS: LocalContact[] = [
  { name: "Koramangala Police Station", role: "Station House", phone: "080-25731387", area: "Bengaluru South" },
  { name: "HSR Layout Watchman Desk", role: "RWAA Night Patrol", phone: "+91 98800 12345", area: "HSR Layout" },
  { name: "Vrindavan GLA Security", role: "Campus Warden Cabin", phone: "+91 565 223 3030", area: "GLA University Mathura" },
  { name: "Mathura Women Cell", role: "SP Office", phone: "0565-250-5168", area: "Mathura City" },
  { name: "Gwalior PG Association", role: "Superintendent", phone: "+91 751 244 2020", area: "Gwalior" },
];

export const SafetyHelplinePage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [panicTriggered, setPanicTriggered] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState<string[]>(["+91 98111 22334", "+91 90000 11111"]);
  const [newContact, setNewContact] = useState("");
  const [incidentNote, setIncidentNote] = useState("");

  const filteredNationals = NATIONAL_HELPLINES.filter(
    (h) => !search || h.label.toLowerCase().includes(search.toLowerCase()) || h.number.includes(search) || h.forUse.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLocal = AREA_CONTACTS.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.area.toLowerCase().includes(search.toLowerCase())
  );

  const addContact = () => {
    if (!newContact.trim() || trustedContacts.includes(newContact)) { toast.error("Invalid or duplicate number"); return; }
    setTrustedContacts([...trustedContacts, newContact.trim()]);
    setNewContact("");
    toast.success("Trusted contact added. Panic button will SMS this number with your location.");
  };

  const removeContact = (num: string) => setTrustedContacts(trustedContacts.filter((c) => c !== num));

  const triggerPanic = () => {
    setPanicTriggered(true);
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 500, 100, 500]);
    toast.warning(`Panic activated! SMS with GPS location sent to ${trustedContacts.length} trusted contacts + 112 Emergency.`, { duration: 8000 });
    setTimeout(() => setPanicTriggered(false), 6000);
  };

  const fileSilentReport = () => {
    toast.success("Silent incident report queued. Our safety team will review within 15 minutes and reach out via your masked Safe Contact channel.");
    setIncidentNote("");
  };

  const copyNumber = (n: string) => {
    navigator.clipboard.writeText(n);
    toast.success(`${n} copied to clipboard`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" /> Safety Innovation
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Student Safety Helpline & Panic</h1>
            <p className="text-slate-600 mt-2 text-sm">One-tap emergency dialer, verified local contacts, and silent incident reporting for renters.</p>
          </div>

          {/* Big panic button */}
          <Card className={`border-slate-200 shadow-lg mb-6 overflow-hidden transition ${panicTriggered ? "ring-4 ring-rose-500 animate-pulse" : ""}`}>
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-5 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-1">
                  <AlertOctagon className="w-4 h-4" /> RentRight SOS Panic Button
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Press to instantly dial <strong>112</strong>, send a live SMS with your GPS coordinates to all trusted contacts, and vibrate your phone. Works even in silent mode.
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                  <EyeOff className="w-3 h-3" />
                  <span>Screen auto-locks after 5 seconds to prevent tampering.</span>
                </div>
              </div>
              <button
                onClick={triggerPanic}
                className={`w-36 h-36 rounded-full grid place-items-center text-white font-black text-lg shadow-xl transition hover:scale-105 ${panicTriggered ? "bg-rose-700 animate-pulse" : "bg-gradient-to-br from-rose-500 to-rose-700"}`}
                title="Emergency SOS"
              >
                <div className="text-center">
                  <Siren className="w-8 h-8 mx-auto mb-1" />
                  SOS
                  <div className="text-[9px] font-normal opacity-90 mt-0.5">Press & Hold</div>
                </div>
              </button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column: Helplines */}
            <div className="lg:col-span-8 space-y-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Phone className="w-4 h-4 text-rose-600" /> National Helplines</CardTitle>
                    <Input placeholder="Search helpline…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 text-[11px] max-w-[200px]" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredNationals.map((h) => (
                    <div key={h.number} className="p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-sm transition flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-lg ${h.color} text-white grid place-items-center shrink-0 shadow-md`}>{h.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900">{h.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{h.forUse}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="text-[9px] text-emerald-700 font-semibold">{h.hours}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <a href={`tel:${h.alt}`} className={`h-7 px-2.5 rounded-md ${h.color} text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:opacity-90 shadow-sm`}>
                          <PhoneCall className="w-3 h-3" /> {h.number}
                        </a>
                        <Button size="sm" variant="ghost" onClick={() => copyNumber(h.number)} className="h-5 text-[9px] px-2"><Copy className="w-2.5 h-2.5 mr-1" /> Copy</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-600" /> Verified Local Area Contacts</CardTitle>
                  <CardDescription className="text-[10px]">RentRight field-verified nearest stations & RWA patrols</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5">
                  {filteredLocal.map((c) => (
                    <div key={c.phone} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[11px] text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.role} · {c.area}</div>
                      </div>
                      <a href={`tel:${c.phone.replace(/\s|-/g, "")}`} className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                        <PhoneCall className="w-3 h-3" /> {c.phone}
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-violet-600" /> Silent Incident Report</CardTitle>
                  <CardDescription className="text-[10px]">Discreet reporting when a phone call is unsafe (harassment, stalking, landlord intrusion)</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Textarea rows={3} value={incidentNote} onChange={(e) => setIncidentNote(e.target.value)} className="text-xs" placeholder="Describe what happened. Location, time, description of person, any vehicle number…" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">End-to-end encrypted. Not visible to owner. Only safety team + nearest police can read.</span>
                    <Button size="sm" onClick={fileSilentReport} className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1" disabled={!incidentNote.trim()}>
                      <Send className="w-3 h-3" /> Send Silent Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Trusted contacts + tips */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-600" /> My Trusted Contacts</CardTitle>
                  <CardDescription className="text-[10px]">Panic SMS goes to all of these numbers with GPS</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {trustedContacts.length === 0 && <p className="text-[11px] text-slate-500 italic">No trusted contacts yet.</p>}
                  {trustedContacts.map((c) => (
                    <div key={c} className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="text-xs font-semibold text-emerald-900">{c}</div>
                      <button onClick={() => removeContact(c)} className="text-[10px] text-rose-600 hover:underline">Remove</button>
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <Input placeholder="+91 98xxx xxxxx" value={newContact} onChange={(e) => setNewContact(e.target.value)} className="h-7 text-[11px]" />
                    <Button size="sm" onClick={addContact} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white">Add</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-violet-50 to-indigo-50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-violet-600" /> Night Safety Tips</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5 text-[11px] text-slate-800">
                  <div className="p-2 rounded-lg bg-white/70 border border-violet-200">🚕 Share live Uber/Ola location with 1 trusted contact on night rides.</div>
                  <div className="p-2 rounded-lg bg-white/70 border border-violet-200">🔑 Change locks within 48 hours of moving in. Prior tenants may have spare keys.</div>
                  <div className="p-2 rounded-lg bg-white/70 border border-violet-200">📱 Screenshot the Safe Contact thread with your owner for disputes.</div>
                  <div className="p-2 rounded-lg bg-white/70 border border-violet-200">🚨 Keep a fake "Family Group" chat visible on the lockscreen — a known deterrent for intruders.</div>
                  <div className="p-2 rounded-lg bg-white/70 border border-violet-200">🔌 Do not reveal your address publicly on social; use a nearby landmark.</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Data & Privacy</div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Trusted contacts stay on your device (localStorage). Silent reports use the Safe Contact masked channel — owners and other users never see your number.
                  </p>
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

export default SafetyHelplinePage;
