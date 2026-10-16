import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { useAuth } from "../contexts/AuthContext";
import { useProperties, Property, ListingStatus } from "../contexts/PropertiesContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Home,
  MessageSquare,
  Calendar,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  Power,
  UserCheck,
  Building2,
  Send,
  AlertCircle,
  ImagePlus,
  Images,
  Star,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  fileToPhoto,
  formatBytes,
  totalPhotoBytes,
  MAX_PHOTOS_PER_LISTING,
  PHOTO_STORAGE_BUDGET_BYTES,
  type PhotoFile
} from "../utils/imageUpload";

export const OwnerEnquiriesPage: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const {
    properties,
    enquiries,
    bookings,
    updateEnquiryStatus,
    acceptEnquiry,
    revealContact,
    updatePropertyStatus,
    renewListing,
    addNewListing,
    updateBookingStatus
  } = useProperties();

  const [activeTab, setActiveTab] = useState("enquiries");
  const [replyModalEnquiryId, setReplyModalEnquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [addListingOpen, setAddListingOpen] = useState(false);

  // Listing photos (uploaded by the owner, compressed to data URLs)
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState("");
  const [newRent, setNewRent] = useState(12000);
  const [newDeposit, setNewDeposit] = useState(24000);
  const [newType, setNewType] = useState("PG");
  const [newOccupancy, setNewOccupancy] = useState("Single");
  const [newFurnishing, setNewFurnishing] = useState("Fully Furnished");
  const [newTarget, setNewTarget] = useState("Both");
  const [newLocality, setNewLocality] = useState("Koramangala");
  const [newCity, setNewCity] = useState("Bengaluru");
  const [newAddress, setNewAddress] = useState("");
  const [newAvailableFrom, setNewAvailableFrom] = useState(new Date().toISOString().split("T")[0]);
  const [newDescription, setNewDescription] = useState("");

  // Filter listings for this owner (or all if admin)
  // RBAC: owners only ever see their OWN records. The previous
  // `|| p.ownerId === 2` fallback leaked another owner's enquiries
  // (including tenant contacts) and bookings to any viewer.
  const isAdmin = user?.role === "admin";
  const ownerId = Number(user?.id);
  const ownerListings = isAdmin
    ? properties
    : properties.filter((p) => Number(p.ownerId) === ownerId);
  const ownerEnquiries = isAdmin
    ? enquiries
    : enquiries.filter((e) => Number(e.ownerId) === ownerId);
  const ownerBookings = bookings.filter((b) => ownerListings.some((p) => p.id === b.propertyId));

  const totalViews = ownerListings.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const activeCount = ownerListings.filter(p => p.listingStatus === "Available").length;

  const handleSendReply = () => {
    if (!replyModalEnquiryId || !replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    updateEnquiryStatus(replyModalEnquiryId, "replied", replyText);
    setReplyModalEnquiryId(null);
    setReplyText("");
  };

  // ---- Photo upload handlers -------------------------------------------------

  const addFiles = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    setUploadError(null);

    const room = MAX_PHOTOS_PER_LISTING - photos.length;
    if (room <= 0) {
      setUploadError(`You can upload up to ${MAX_PHOTOS_PER_LISTING} photos per listing.`);
      return;
    }

    setIsUploading(true);
    const accepted: PhotoFile[] = [];
    const problems: string[] = [];

    if (incoming.length > room) {
      problems.push(`Only ${room} more photo(s) fit — the rest were skipped.`);
    }

    for (const file of incoming.slice(0, room)) {
      try {
        const photo = await fileToPhoto(file);
        const projected = totalPhotoBytes([...photos, ...accepted, photo]);
        if (projected > PHOTO_STORAGE_BUDGET_BYTES) {
          problems.push(
            `"${file.name}" skipped: photos would exceed ${formatBytes(PHOTO_STORAGE_BUDGET_BYTES)} of browser storage.`
          );
          continue;
        }
        accepted.push(photo);
      } catch (err: any) {
        problems.push(err?.message || `"${file.name}" could not be processed.`);
      }
    }

    if (accepted.length > 0) setPhotos((prev) => [...prev, ...accepted]);
    if (problems.length > 0) setUploadError(problems.join(" "));
    setIsUploading(false);

    // Reset so selecting the same file again still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setUploadError(null);
  };

  // First photo is the cover shown on cards and in search results
  const makeCover = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      return [target, ...prev.filter((p) => p.id !== id)];
    });
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAddress.trim()) {
      toast.error("Please fill in title and address");
      return;
    }
    if (isUploading) {
      toast.error("Please wait while your photos finish processing");
      return;
    }

    addNewListing({
      title: newTitle,
      monthlyRent: Number(newRent),
      securityDeposit: Number(newDeposit),
      maintenance: 0,
      billsIncluded: true,
      accommodationType: newType,
      occupancyPreference: newOccupancy,
      furnishing: newFurnishing,
      targetAudience: newTarget,
      locality: newLocality,
      city: newCity,
      address: newAddress,
      availableFrom: newAvailableFrom,
      description: newDescription || "Well ventilated accommodation ready for immediate move-in.",
      ownerId: ownerId,
      ownerName: user?.name || "Property Owner",
      images: photos.map((p) => p.dataUrl)
    });

    setAddListingOpen(false);
    // Reset form
    setNewTitle("");
    setNewAddress("");
    setNewDescription("");
    setPhotos([]);
    setUploadError(null);

    if (photos.length === 0) {
      toast.info("Published with a placeholder photo — add real photos to get more enquiries.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Role switcher alert if not currently in Owner role */}
          {user?.role !== "owner" && (
            <div className="mb-6 p-4 rounded-xl bg-violet-100 border border-violet-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-violet-900">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-700 shrink-0" />
                <span>
                  Viewing Owner Portal. You are logged in as <strong>{user?.name} ({user?.role})</strong>.
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => loginAsDemo("owner")}
                className="bg-violet-700 hover:bg-violet-800 text-white text-xs shrink-0"
              >
                Switch to Owner Priya Sharma
              </Button>
            </div>
          )}

          {/* Page Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5 text-violet-400" /> Landlord & PG Operator Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Owner Workspace & Enquiries
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage tenant applications, respond with privacy protection, and update room availability in real-time.
              </p>
            </div>

            <Dialog open={addListingOpen} onOpenChange={setAddListingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-md">
                  <Plus className="w-4 h-4" /> Add New Rental
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleCreateListing} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">List a New Rental Property</DialogTitle>
                    <DialogDescription className="text-xs">
                      Publish a room, PG bed, hostel, or flat with transparent pricing for students and professionals.
                    </DialogDescription>
                  </DialogHeader>

                  <div>
                    <Label className="text-xs font-semibold">Listing Title *</Label>
                    <Input
                      placeholder="e.g. Stanza Elite - Single AC Room with Food & WiFi"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="mt-1 text-sm h-9"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Monthly Rent (₹) *</Label>
                      <Input
                        type="number"
                        value={newRent}
                        onChange={(e) => setNewRent(Number(e.target.value))}
                        className="mt-1 text-sm h-9"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Security Deposit (₹) *</Label>
                      <Input
                        type="number"
                        value={newDeposit}
                        onChange={(e) => setNewDeposit(Number(e.target.value))}
                        className="mt-1 text-sm h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Accommodation Type</Label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="PG">PG</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Room">Private Room</option>
                        <option value="Shared Flat">Shared Flat</option>
                        <option value="Entire Apartment">Entire Apartment</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Occupancy</Label>
                      <select
                        value={newOccupancy}
                        onChange={(e) => setNewOccupancy(e.target.value)}
                        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="Single">Single</option>
                        <option value="Double">Double Sharing</option>
                        <option value="Triple">Triple Sharing</option>
                        <option value="Any">Any</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Furnishing</Label>
                      <select
                        value={newFurnishing}
                        onChange={(e) => setNewFurnishing(e.target.value)}
                        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold">Locality</Label>
                      <Input
                        value={newLocality}
                        onChange={(e) => setNewLocality(e.target.value)}
                        className="mt-1 text-sm h-9"
                        placeholder="e.g. Koramangala 4th Block"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">City</Label>
                      <Input
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="mt-1 text-sm h-9"
                        placeholder="e.g. Bengaluru"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Complete Address *</Label>
                    <Input
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="mt-1 text-sm h-9"
                      placeholder="Door no, Street, Landmark"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Description & Facilities</Label>
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                      className="mt-1 text-xs"
                      placeholder="Describe meal timings, high-speed WiFi, laundry facilities, study desks, and gate curfew rules..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Property Photos</Label>
                      <span className="text-[11px] text-slate-500">
                        {photos.length}/{MAX_PHOTOS_PER_LISTING} · {formatBytes(totalPhotoBytes(photos))}
                      </span>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Upload property photos"
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        addFiles(e.dataTransfer.files);
                      }}
                      className={`mt-1 rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        isDragging
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                      />
                      <ImagePlus className="w-5 h-5 mx-auto text-violet-600" />
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                        Drop photos here or <span className="font-semibold text-violet-700">click to browse</span>
                        <br />
                        <span className="text-slate-400">
                          JPG, PNG or WebP · max {MAX_PHOTOS_PER_LISTING} photos · large files are auto-compressed
                        </span>
                      </p>
                      {isUploading && (
                        <p className="text-[11px] font-semibold text-violet-700 mt-1.5">Compressing photos…</p>
                      )}
                    </div>

                    {uploadError && (
                      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />

                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-violet-700/90 text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">
                                Cover
                              </span>
                            )}

                            <button
                              type="button"
                              title="Remove photo"
                              aria-label={`Remove ${photo.name}`}
                              onClick={() => removePhoto(photo.id)}
                              className="absolute top-1 right-1 w-5 h-5 grid place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {idx !== 0 && (
                              <button
                                type="button"
                                title="Set as cover photo"
                                aria-label={`Set ${photo.name} as cover`}
                                onClick={() => makeCover(photo.id)}
                                className="absolute bottom-1 right-1 w-5 h-5 grid place-items-center rounded-full bg-white/85 text-violet-700 opacity-0 group-hover:opacity-100 hover:bg-white transition"
                              >
                                <Star className="w-3 h-3" />
                              </button>
                            )}

                            <span className="absolute bottom-1 left-1 text-[9px] font-medium bg-black/55 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                              {formatBytes(photo.bytes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-1.5 text-[10px] text-slate-400 flex items-center gap-1">
                      <Images className="w-3 h-3 shrink-0" />
                      {photos.length === 0
                        ? "Optional but recommended — listings with real photos receive more enquiries."
                        : "Tap the star on a photo to make it the cover. The first photo is shown on search cards."}
                    </p>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setAddListingOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                      Publish Listing
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{activeCount} / {ownerListings.length}</div>
                  <div className="text-[11px] font-medium text-slate-500">Active Listings</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{totalViews}</div>
                  <div className="text-[11px] font-medium text-slate-500">Total Views</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{ownerEnquiries.length}</div>
                  <div className="text-[11px] font-medium text-slate-500">Total Enquiries</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{ownerBookings.length}</div>
                  <div className="text-[11px] font-medium text-slate-500">Scheduled Tours</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger value="enquiries" className="text-xs sm:text-sm gap-2">
                <MessageSquare className="w-4 h-4" /> Received Enquiries ({ownerEnquiries.length})
              </TabsTrigger>
              <TabsTrigger value="listings" className="text-xs sm:text-sm gap-2">
                <Building2 className="w-4 h-4" /> My Rental Listings ({ownerListings.length})
              </TabsTrigger>
              <TabsTrigger value="visits" className="text-xs sm:text-sm gap-2">
                <Calendar className="w-4 h-4" /> Scheduled Visits ({ownerBookings.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ENQUIRIES */}
            <TabsContent value="enquiries" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Tenant Enquiry Queue</h3>
                <span className="text-xs text-slate-500">Double-blind privacy protection active</span>
              </div>

              {ownerEnquiries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                  No enquiries received yet for your properties.
                </div>
              ) : (
                <div className="space-y-4">
                  {ownerEnquiries.map((enq) => (
                    <Card key={enq.id} className="border-slate-200 shadow-sm hover:border-slate-300 transition">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                                #{enq.id}
                              </span>
                              <span className="font-semibold text-sm text-slate-900">
                                {enq.seekerName}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {enq.occupantType}
                              </Badge>
                              <span className="text-xs text-slate-400">• {enq.createdAt}</span>
                            </div>

                            <div className="text-xs text-slate-500 font-medium">
                              Property: <Link to={`/property/${enq.propertyId}`} className="text-violet-600 hover:underline">{enq.propertyTitle}</Link>
                            </div>

                            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                              "{enq.message}"
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Planned Move-in:</span>
                                <span className="font-semibold">{enq.moveInDate}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Expected Stay:</span>
                                <span className="font-semibold">{enq.stayDurationMonths} Months</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Seeker Contact:</span>
                                {enq.status === "contact_revealed" && enq.seekerPhone ? (
                                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-emerald-600" /> {enq.seekerPhone}
                                  </span>
                                ) : enq.status === "accepted" ? (
                                  <span className="text-blue-600 font-semibold flex items-center gap-1 text-[11px]">
                                    <UserCheck className="w-3 h-3" /> Accepted – click Reveal to see phone
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic flex items-center gap-1 text-[11px]">
                                    <ShieldCheck className="w-3 h-3 text-amber-500" /> Protected – accept enquiry first
                                  </span>
                                )}
                              </div>
                            </div>

                            {enq.ownerReply && (
                              <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
                                <span className="font-bold">Your Reply:</span> {enq.ownerReply}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 shrink-0 md:w-44">
                            <div className="mb-1 text-right">
                              {enq.status === "pending" && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px]">Pending Review</Badge>
                              )}
                              {enq.status === "accepted" && (
                                <Badge className="bg-blue-600 text-white text-[10px]">Accepted</Badge>
                              )}
                              {enq.status === "contact_revealed" && (
                                <Badge className="bg-emerald-600 text-white text-[10px]">Contact Revealed</Badge>
                              )}
                              {enq.status === "replied" && (
                                <Badge className="bg-blue-600 text-white text-[10px]">Replied</Badge>
                              )}
                              {enq.status === "rejected" && (
                                <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
                              )}
                            </div>

                            {enq.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => acceptEnquiry(enq.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                >
                                  <UserCheck className="w-3 h-3 mr-1.5" /> Accept Enquiry
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateEnquiryStatus(enq.id, "rejected")}
                                  className="text-xs h-8 text-rose-600 hover:bg-rose-50"
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {enq.status === "accepted" && (
                              <Button
                                size="sm"
                                onClick={() => revealContact(enq.id)}
                                className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                              >
                                <Phone className="w-3 h-3 mr-1.5" /> Reveal Contact Info
                              </Button>
                            )}

                            {(enq.status === "contact_revealed" || enq.status === "replied") && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setReplyModalEnquiryId(enq.id);
                                  setReplyText(enq.ownerReply || "");
                                }}
                                className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                              >
                                <Send className="w-3 h-3 mr-1.5" /> Reply to Seeker
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: MY LISTINGS */}
            <TabsContent value="listings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Active Listings & Inventory</h3>
                <span className="text-xs text-slate-500">Auto-expiry set at 45 days</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownerListings.map((p) => {
                  const isAvailable = p.listingStatus === "Available";
                  return (
                    <Card key={p.id} className="border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="aspect-[16/8] relative bg-slate-100 overflow-hidden">
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <Badge className={`${isAvailable ? "bg-emerald-600" : "bg-slate-700"} text-white text-[10px]`}>
                              {p.listingStatus}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {p.accommodationType}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="text-[11px] font-bold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                              👁 {p.viewsCount} Views
                            </span>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-2">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.title}</h4>
                          <div className="text-xs text-slate-500">
                            {p.locality}, {p.city}
                          </div>

                          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                            <span className="font-extrabold text-violet-700 text-sm">₹{p.monthlyRent?.toLocaleString()}/mo</span>
                            <span className="text-slate-500">Deposit: ₹{p.securityDeposit?.toLocaleString()}</span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                            <span>Listed on: {p.listedDate}</span>
                            <span>{p.enquiriesCount || 0} Inquiries</span>
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePropertyStatus(p.id, isAvailable ? "Rented" : "Available")}
                          className={`text-xs h-8 ${isAvailable ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"}`}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          {isAvailable ? "Mark as Rented" : "Mark as Available"}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => renewListing(p.id)}
                          className="text-xs h-8 text-violet-700 hover:bg-violet-50"
                          title="Renew listing expiration"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Renew (45d)
                        </Button>

                        <Link to={`/property/${p.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-8">
                            View
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 3: VISITS */}
            <TabsContent value="visits" className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Scheduled In-Person & Virtual Viewings</h3>

              {ownerBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                  No property viewings booked currently.
                </div>
              ) : (
                <div className="space-y-3">
                  {ownerBookings.map((b) => (
                    <Card key={b.id} className="border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                            #{b.id}
                          </span>
                          <span className="font-semibold text-sm text-slate-900">
                            {b.seekerName || "Prospective Tenant"}
                          </span>
                          <Badge variant={b.status === "confirmed" ? "default" : "secondary"} className="text-[10px]">
                            {b.status}
                          </Badge>
                        </div>

                        <div className="text-xs text-slate-600">
                          <strong>Date:</strong> {b.date} at {b.timeSlot} • Mode: <span className="capitalize">{b.visitType}</span>
                        </div>

                        {b.notes && (
                          <div className="text-[11px] text-slate-500 italic">
                            Note: {b.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status !== "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(b.id, "confirmed")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm Tour
                          </Button>
                        )}
                        {b.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(b.id, "cancelled")}
                            className="text-xs h-8 text-rose-600 hover:bg-rose-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Reply Modal */}
      <Dialog open={!!replyModalEnquiryId} onOpenChange={() => setReplyModalEnquiryId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Reply to Seeker Enquiry</DialogTitle>
            <DialogDescription className="text-xs">
              This message will be delivered directly to the seeker via email and platform notification.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label className="text-xs font-medium text-slate-700">Response Message *</Label>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g. Hello! Yes, the room is available. You are welcome to visit this Saturday between 11 AM - 3 PM..."
              rows={4}
              className="mt-1 text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setReplyModalEnquiryId(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendReply} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
              <Send className="w-3.5 h-3.5" /> Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  );
};

export default OwnerEnquiriesPage;
