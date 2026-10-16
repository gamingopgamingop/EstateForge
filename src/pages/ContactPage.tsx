import React, { useState } from "react";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, ShieldCheck, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitted(true);
    toast.success("Support message received. We will respond within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Contact RentRight Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Have questions regarding verification, reporting an inaccurate listing, or landlord onboarding?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900">Support & Trust Office</h3>

                <div className="flex items-start gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <span>Koramangala 4th Block, 80 Feet Road, Bengaluru, Karnataka 560034</span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>support@rentright.com</span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>+91 80 4900 1234 (10 AM - 7 PM)</span>
                </div>

                <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-[11px] text-violet-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <span>
                    Emergency tenant harassment or discriminatory housing hotline: <strong>grievance@rentright.com</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Message Delivered</h3>
                  <p className="text-xs text-slate-600">
                    Thank you, {name}. A member of our trust and quality team will reach out to {email} shortly.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="text-xs mt-2"
                  >
                    Send Another Note
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <Label className="text-xs font-medium text-slate-700">Full Name *</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Sen"
                      className="mt-1 h-9 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-700">Email Address *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 h-9 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-700">Subject</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Listing Verification Request / Report Question"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-700">Message *</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Tell us how we can help you..."
                      className="mt-1 text-xs"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 font-semibold gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default ContactPage;
