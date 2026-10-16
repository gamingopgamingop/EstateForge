import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProperties, Property } from "../contexts/PropertiesContext";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import PropertyCard from "../components/PropertyCard";
import CompareFloatingBar from "../components/CompareFloatingBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageSquare,
  Calendar,
  Calculator,
  Scale,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user, switchRole, loginAsDemo } = useAuth();
  const { properties, savedIds, enquiries, bookings, getEnquiriesForSeeker, getBookingsForUser } = useProperties();
  const navigate = useNavigate();

  // If user is Owner, offer direct shortcut to Owner Workspace
  const isOwner = user?.role === "owner";

  // Saved properties
  const savedProperties = properties.filter((p) => savedIds.includes(p.id));

  // My enquiries
  const seekerEnquiries = enquiries.filter(
    (e) => e.seekerEmail === user?.email || String(e.seekerId) === String(user?.id) || e.seekerName === user?.name
  );

  // My scheduled visits
  const userVisits = bookings.filter((b) => String(b.userId) === String(user?.id) || b.seekerName === user?.name);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Welcome Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
                alt={user?.name || "User"}
                className="w-16 h-16 rounded-full object-cover border-2 border-violet-500 shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name || "Seeker"}</h1>
                  <Badge className="bg-violet-600 text-white text-[10px] uppercase">
                    {user?.role || "Seeker"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {user?.occupation || "Student & Working Professional Account"} • {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isOwner ? (
                <Link to="/owner/enquiries">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-9">
                    <Building2 className="w-3.5 h-3.5 mr-1.5" /> Open Owner Portal & Listings
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loginAsDemo("owner")}
                  className="text-xs h-9 text-violet-700 border-violet-200 hover:bg-violet-50"
                >
                  <Building2 className="w-3.5 h-3.5 mr-1.5" /> Switch to Owner View (Priya)
                </Button>
              )}

              <Link to="/properties">
                <Button variant="outline" size="sm" className="text-xs h-9">
                  Browse Accommodations
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-rose-600" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{savedProperties.length}</div>
                  <div className="text-[11px] font-medium text-slate-500">Saved Shortlist</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{seekerEnquiries.length}</div>
                  <div className="text-[11px] font-medium text-slate-500">Sent Inquiries</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{userVisits.length}</div>
                  <div className="text-[11px] font-medium text-slate-500">Scheduled Tours</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">30%</div>
                  <div className="text-[11px] font-medium text-slate-500">Safe Rent Rule</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="saved" className="space-y-6">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger value="saved" className="text-xs sm:text-sm gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> Saved Accommodations ({savedProperties.length})
              </TabsTrigger>
              <TabsTrigger value="enquiries" className="text-xs sm:text-sm gap-2">
                <MessageSquare className="w-4 h-4 text-violet-600" /> My Inquiries ({seekerEnquiries.length})
              </TabsTrigger>
              <TabsTrigger value="visits" className="text-xs sm:text-sm gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Scheduled Viewings ({userVisits.length})
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-xs sm:text-sm gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Renter Utilities
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SAVED SHORTLIST */}
            <TabsContent value="saved" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Saved Rental Shortlist</h3>
                <Link to="/compare" className="text-xs text-violet-700 hover:underline flex items-center gap-1 font-semibold">
                  <Scale className="w-3.5 h-3.5" /> Compare Shortlist
                </Link>
              </div>

              {savedProperties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                  You haven't saved any rental accommodations yet.
                  <div className="mt-4">
                    <Link to="/properties">
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">
                        Browse Accommodations
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProperties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: MY ENQUIRIES */}
            <TabsContent value="enquiries" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Sent Rental Applications & Responses</h3>
                <span className="text-xs text-slate-500">Zero phone number leakage</span>
              </div>

              {seekerEnquiries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                  No rental inquiries sent yet. Browse a room or PG and click "Send Rental Enquiry".
                </div>
              ) : (
                <div className="space-y-3">
                  {seekerEnquiries.map((enq) => (
                    <Card key={enq.id} className="border-slate-200 shadow-sm p-4 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                            #{enq.id}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{enq.propertyTitle}</span>
                        </div>
                        <Badge
                          variant={enq.status === "contact_shared" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {enq.status === "contact_shared" ? "Contact Shared with Landlord" : enq.status}
                        </Badge>
                      </div>

                      <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{enq.message}"
                      </p>

                      {enq.ownerReply && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
                          <span className="font-bold">Landlord Reply:</span> {enq.ownerReply}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-slate-400 text-[11px]">
                        <span>Submitted on {enq.createdAt} • Target Move-in: {enq.moveInDate}</span>
                        <Link to={`/property/${enq.propertyId}`} className="text-violet-600 hover:underline font-semibold flex items-center gap-1">
                          View Property <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: VISITS */}
            <TabsContent value="visits" className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Your Scheduled Property Tours</h3>

              {userVisits.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                  No upcoming property tours scheduled. You can book in-person visits directly on any property page.
                </div>
              ) : (
                <div className="space-y-3">
                  {userVisits.map((v) => (
                    <Card key={v.id} className="border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-violet-700 bg-violet-50 px-2 py-0.5 rounded font-bold">
                            #{v.id}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{v.propertyTitle || "Property Tour"}</span>
                          <Badge className="bg-emerald-600 text-white text-[10px]">{v.status}</Badge>
                        </div>
                        <div className="text-slate-600">
                          <strong>Date:</strong> {v.date} at {v.timeSlot} • Format: <span className="capitalize">{v.visitType}</span>
                        </div>
                        {v.notes && <div className="text-slate-500 italic text-[11px]">Note: {v.notes}</div>}
                      </div>

                      <Link to={`/property/${v.propertyId}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          View Accommodation
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: RENTER UTILITIES & TOOLS */}
            <TabsContent value="tools" className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Quick Launch Innovation Tools</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/affordability" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">30% Affordability Calculator</h4>
                  <p className="text-xs text-slate-500">Calculate recommended rent based on your stipend or salary.</p>
                </Link>

                <Link to="/roommate-matcher" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Roommate Matcher</h4>
                  <p className="text-xs text-slate-500">Match sleep cycles, food habits, and hygiene standards.</p>
                </Link>

                <Link to="/inspection-checklist" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-300 transition shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Inspection Checklist</h4>
                  <p className="text-xs text-slate-500">Carry on-site during tours to audit water pressure and meters.</p>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Floating comparison drawer */}
      <CompareFloatingBar />

      <FooterSection />
    </div>
  );
};

export default Dashboard;
