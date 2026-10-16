import React, { createContext, useContext, useState, useEffect } from "react";
import initialPropertiesData from "../data/properties.json";
import { toast } from "sonner";

export type AccommodationType = "Room" | "PG" | "Hostel" | "Shared Flat" | "Entire Apartment" | string;
export type OccupancyPreference = "Single" | "Double" | "Triple" | "Any" | string;
export type FurnishingType = "Fully Furnished" | "Semi-Furnished" | "Unfurnished" | string;
export type TargetAudience = "Students" | "Working Professionals" | "Both" | string;
export type ListingStatus = "Available" | "Rented" | "Under Maintenance" | string;
export type VerificationStatus = "Verified" | "Owner Claimed" | string;

export type Property = {
  id: number;
  title: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenance: number;
  billsIncluded: boolean;
  accommodationType: AccommodationType;
  occupancyPreference: OccupancyPreference;
  furnishing: FurnishingType;
  targetAudience: TargetAudience;
  availableFrom: string;
  listingStatus: ListingStatus;
  verificationStatus: VerificationStatus;
  listedDate: string;
  expiryDays: number;
  locality: string;
  city: string;
  state: string;
  address: string;
  landmark?: string;
  metroDistanceKm?: number;
  collegeDistanceKm?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  houseRules: string[];
  ownerId: number;
  ownerName: string;
  ownerResponseTime?: string;
  viewsCount: number;
  enquiriesCount: number;
  rating: number;
  featured: boolean;
  images: string[];
  description: string;
  // Backward compatibility aliases
  price: number;
  pricePerMonth: number;
  type: string;
  propertyType: string;
  status: string;
  tags: string[];
  location?: {
    address: string;
    city: string;
    state: string;
    zip?: string;
    lat?: number;
    lng?: number;
  };
  yearBuilt?: number;
};

export type Enquiry = {
  id: string;
  propertyId: number;
  propertyTitle: string;
  ownerId: number;
  seekerId?: string | number;
  seekerName: string;
  seekerEmail: string;
  seekerPhone?: string;
  shareContactPermission: boolean;
  moveInDate: string;
  stayDurationMonths: number;
  occupantType: "Student" | "Working Professional" | "Other";
  message: string;
  status: "pending" | "contact_shared" | "rejected" | "replied";
  ownerReply?: string;
  createdAt: string;
};

export type VisitBooking = {
  id: number | string;
  userId: number | string;
  propertyId: number;
  propertyTitle?: string;
  date: string;
  timeSlot: string;
  visitType: "in-person" | "virtual";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  notes?: string;
  seekerName?: string;
  seekerContact?: string;
};

export type ListingReport = {
  id: string;
  propertyId: number;
  reason: string;
  details: string;
  reportedByEmail?: string;
  createdAt: string;
  status: "pending_review" | "resolved";
};

export type FilterParams = {
  locality?: string;
  city?: string;
  accommodationType?: string;
  occupancyPreference?: string;
  furnishing?: string;
  targetAudience?: string;
  minRent?: number;
  maxRent?: number;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  status?: string;
  sortBy?: "rent_asc" | "rent_desc" | "rating" | "date" | "proximity";
};

type PropertiesContextType = {
  properties: Property[];
  filteredProperties: Property[];
  loading: boolean;
  getPropertyById: (id: number) => Property | undefined;
  filterProperties: (filters: FilterParams) => void;
  resetFilters: () => void;
  // Comparison
  compareIds: number[];
  addToCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isComparing: (id: number) => boolean;
  // Saved properties
  savedIds: number[];
  toggleSaveProperty: (id: number) => void;
  isSaved: (id: number) => boolean;
  // Enquiries
  enquiries: Enquiry[];
  addEnquiry: (enquiry: Omit<Enquiry, "id" | "createdAt" | "status">) => string;
  updateEnquiryStatus: (enquiryId: string, status: Enquiry["status"], reply?: string) => void;
  getEnquiriesForOwner: (ownerId: number) => Enquiry[];
  getEnquiriesForSeeker: (emailOrId: string) => Enquiry[];
  // Visit Bookings
  bookings: VisitBooking[];
  addBooking: (booking: Omit<VisitBooking, "id" | "createdAt">) => void;
  updateBookingStatus: (bookingId: string | number, status: VisitBooking["status"]) => void;
  getBookingsForUser: (userId: number | string) => VisitBooking[];
  getBookingsForProperty: (propertyId: number) => VisitBooking[];
  // Reports
  reports: ListingReport[];
  reportProperty: (propertyId: number, reason: string, details: string, email?: string) => string;
  // Owner management
  addNewListing: (propertyData: Partial<Property>) => Property;
  updatePropertyStatus: (propertyId: number, status: ListingStatus) => void;
  renewListing: (propertyId: number) => void;
  featuredProperties: Property[];
};

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const PropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem("rentright_properties");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved properties", e);
      }
    }
    return initialPropertiesData as Property[];
  });

  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [loading, setLoading] = useState<boolean>(false);

  // Comparison list (max 4)
  const [compareIds, setCompareIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("rentright_compare_ids");
    return saved ? JSON.parse(saved) : [];
  });

  // Saved bookmark IDs
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("rentright_saved_ids");
    return saved ? JSON.parse(saved) : [1, 3];
  });

  // Enquiries
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = localStorage.getItem("rentright_enquiries");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: "ENQ-1001",
        propertyId: 1,
        propertyTitle: "Stanza Living - Premium Student & Pro PG with Food",
        ownerId: 2,
        seekerId: 1,
        seekerName: "Rahul Verma",
        seekerEmail: "rahul.seeker@example.com",
        seekerPhone: "+91 98765 43210",
        shareContactPermission: true,
        moveInDate: "2026-10-25",
        stayDurationMonths: 6,
        occupantType: "Working Professional",
        message: "Hi Priya, I work as an SDE intern at Koramangala. Is the room available for immediate move-in? Also wanted to check if 300 Mbps WiFi is reliable for Zoom meetings.",
        status: "contact_shared",
        ownerReply: "Hello Rahul! Yes, room 204 is available. The WiFi is dedicated fiber with dual backup. You are welcome for a visit!",
        createdAt: "2026-10-14"
      },
      {
        id: "ENQ-1002",
        propertyId: 2,
        propertyTitle: "Sunny Shared Flat for Working Professionals - Master Room",
        ownerId: 2,
        seekerId: 3,
        seekerName: "Sneha Patel",
        seekerEmail: "sneha.design@example.com",
        seekerPhone: "+91 98111 22334",
        shareContactPermission: true,
        moveInDate: "2026-11-01",
        stayDurationMonths: 11,
        occupantType: "Working Professional",
        message: "Hi Arjun, loved the pictures of the flat in HSR. I work as a UI/UX designer. Do you guys have a dedicated cook or maid service arranged?",
        status: "pending",
        createdAt: "2026-10-15"
      }
    ];
  });

  // Visit bookings
  const [bookings, setBookings] = useState<VisitBooking[]>(() => {
    const saved = localStorage.getItem("rentright_bookings");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: "VIS-501",
        userId: 1,
        propertyId: 1,
        propertyTitle: "Stanza Living - Premium Student & Pro PG with Food",
        date: "2026-10-22",
        timeSlot: "11:00 AM",
        visitType: "in-person",
        status: "confirmed",
        seekerName: "Rahul Verma",
        notes: "Requested a morning physical walk-around of room and dining mess area.",
        createdAt: "2026-10-15"
      }
    ];
  });

  // Listing reports
  const [reports, setReports] = useState<ListingReport[]>(() => {
    const saved = localStorage.getItem("rentright_reports");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("rentright_properties", JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem("rentright_compare_ids", JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => {
    localStorage.setItem("rentright_saved_ids", JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem("rentright_enquiries", JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem("rentright_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("rentright_reports", JSON.stringify(reports));
  }, [reports]);

  // Check auto-expiry of listings
  const isListingExpired = (p: Property) => {
    if (!p.listedDate) return false;
    const listed = new Date(p.listedDate).getTime();
    const expiryPeriod = (p.expiryDays || 45) * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    return now - listed > expiryPeriod;
  };

  // Filter properties
  const filterProperties = (filters: FilterParams) => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...properties];

      // Locality / City search
      if (filters.locality && filters.locality.trim() !== "" && filters.locality !== "all") {
        const query = filters.locality.toLowerCase().trim();
        filtered = filtered.filter(p =>
          p.locality.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query) ||
          (p.landmark && p.landmark.toLowerCase().includes(query)) ||
          p.address.toLowerCase().includes(query)
        );
      }

      // City filter
      if (filters.city && filters.city !== "all") {
        filtered = filtered.filter(p =>
          p.city.toLowerCase() === filters.city!.toLowerCase()
        );
      }

      // Accommodation Type
      if (filters.accommodationType && filters.accommodationType !== "all") {
        filtered = filtered.filter(p =>
          p.accommodationType.toLowerCase() === filters.accommodationType!.toLowerCase()
        );
      }

      // Occupancy Preference
      if (filters.occupancyPreference && filters.occupancyPreference !== "all") {
        filtered = filtered.filter(p =>
          p.occupancyPreference.toLowerCase() === filters.occupancyPreference!.toLowerCase() ||
          p.occupancyPreference === "Any"
        );
      }

      // Furnishing
      if (filters.furnishing && filters.furnishing !== "all") {
        filtered = filtered.filter(p =>
          p.furnishing.toLowerCase() === filters.furnishing!.toLowerCase()
        );
      }

      // Target Audience
      if (filters.targetAudience && filters.targetAudience !== "all") {
        filtered = filtered.filter(p =>
          p.targetAudience.toLowerCase() === filters.targetAudience!.toLowerCase() ||
          p.targetAudience === "Both"
        );
      }

      // Rent Range
      const minRent = filters.minRent ?? filters.minPrice;
      const maxRent = filters.maxRent ?? filters.maxPrice;

      if (minRent !== undefined) {
        filtered = filtered.filter(p => (p.monthlyRent ?? p.price) >= minRent);
      }
      if (maxRent !== undefined) {
        filtered = filtered.filter(p => (p.monthlyRent ?? p.price) <= maxRent);
      }

      // Verified Only
      if (filters.verifiedOnly) {
        filtered = filtered.filter(p => p.verificationStatus === "Verified");
      }

      // Available Only
      if (filters.availableOnly) {
        filtered = filtered.filter(p => p.listingStatus === "Available");
      }

      // Bedrooms
      if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms!);
      }

      // Sort
      if (filters.sortBy === "rent_asc") {
        filtered.sort((a, b) => a.monthlyRent - b.monthlyRent);
      } else if (filters.sortBy === "rent_desc") {
        filtered.sort((a, b) => b.monthlyRent - a.monthlyRent);
      } else if (filters.sortBy === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (filters.sortBy === "proximity") {
        filtered.sort((a, b) => (a.metroDistanceKm ?? 99) - (b.metroDistanceKm ?? 99));
      }

      setFilteredProperties(filtered);
      setLoading(false);
    }, 200);
  };

  const resetFilters = () => {
    setFilteredProperties(properties);
  };

  const getPropertyById = (id: number) => {
    return properties.find(p => p.id === Number(id));
  };

  // Comparison handlers
  const addToCompare = (id: number) => {
    if (compareIds.includes(id)) {
      removeFromCompare(id);
      return;
    }
    if (compareIds.length >= 4) {
      toast.warning("You can compare up to 4 properties side-by-side");
      return;
    }
    setCompareIds([...compareIds, id]);
    toast.success("Added to comparison matrix");
  };

  const removeFromCompare = (id: number) => {
    setCompareIds(compareIds.filter(item => item !== id));
    toast.info("Removed from comparison");
  };

  const clearCompare = () => {
    setCompareIds([]);
    toast.info("Cleared comparison");
  };

  const isComparing = (id: number) => compareIds.includes(id);

  // Saved / Bookmarks
  const toggleSaveProperty = (id: number) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter(item => item !== id));
      toast.info("Removed from saved accommodations");
    } else {
      setSavedIds([...savedIds, id]);
      toast.success("Saved to your shortlist");
    }
  };

  const isSaved = (id: number) => savedIds.includes(id);

  // Enquiry handling (Respecting privacy: no direct phone number leak)
  const addEnquiry = (data: Omit<Enquiry, "id" | "createdAt" | "status">): string => {
    const newId = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiry: Enquiry = {
      ...data,
      id: newId,
      status: data.shareContactPermission ? "contact_shared" : "pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    setEnquiries(prev => [newEnquiry, ...prev]);

    // Update enquiry count on property
    setProperties(prev => prev.map(p => {
      if (p.id === data.propertyId) {
        return { ...p, enquiriesCount: (p.enquiriesCount || 0) + 1 };
      }
      return p;
    }));

    toast.success(`Enquiry request #${newId} transmitted securely to the owner!`);
    return newId;
  };

  const updateEnquiryStatus = (enquiryId: string, status: Enquiry["status"], reply?: string) => {
    setEnquiries(prev => prev.map(e => {
      if (e.id === enquiryId) {
        return {
          ...e,
          status,
          ...(reply ? { ownerReply: reply } : {})
        };
      }
      return e;
    }));
    toast.success(`Enquiry ${enquiryId} updated to ${status}`);
  };

  const getEnquiriesForOwner = (ownerId: number) => {
    return enquiries.filter(e => e.ownerId === ownerId);
  };

  const getEnquiriesForSeeker = (emailOrId: string) => {
    return enquiries.filter(e =>
      e.seekerEmail?.toLowerCase() === emailOrId.toLowerCase() ||
      String(e.seekerId) === String(emailOrId)
    );
  };

  // Visit bookings
  const addBooking = (bookingData: Omit<VisitBooking, "id" | "createdAt">) => {
    const existing = bookings.find(
      b => b.propertyId === bookingData.propertyId &&
           b.date === bookingData.date &&
           b.timeSlot === bookingData.timeSlot &&
           b.status !== "cancelled"
    );

    if (existing) {
      toast.error("This slot is already booked for this property. Please pick another time slot.");
      return;
    }

    const newBooking: VisitBooking = {
      ...bookingData,
      id: `VIS-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setBookings(prev => [newBooking, ...prev]);
    toast.success("Visit tour scheduled successfully!");
  };

  const updateBookingStatus = (bookingId: string | number, status: VisitBooking["status"]) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    toast.success(`Visit booking #${bookingId} marked as ${status}`);
  };

  const getBookingsForUser = (userId: number | string) => {
    return bookings.filter(b => String(b.userId) === String(userId));
  };

  const getBookingsForProperty = (propertyId: number) => {
    return bookings.filter(b => b.propertyId === propertyId);
  };

  // Reporting suspicious/outdated listing
  const reportProperty = (propertyId: number, reason: string, details: string, email?: string): string => {
    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: ListingReport = {
      id: reportId,
      propertyId,
      reason,
      details,
      reportedByEmail: email,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending_review"
    };

    setReports(prev => [newReport, ...prev]);
    toast.success(`Report #${reportId} registered. Our verification team will review this listing within 24 hours.`);
    return reportId;
  };

  // Owner listing management
  const addNewListing = (propertyData: Partial<Property>): Property => {
    const newId = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
    const monthlyRent = propertyData.monthlyRent || 12000;
    const newProp: Property = {
      id: newId,
      title: propertyData.title || "New Rental Listing",
      monthlyRent,
      securityDeposit: propertyData.securityDeposit || monthlyRent * 2,
      maintenance: propertyData.maintenance || 0,
      billsIncluded: propertyData.billsIncluded ?? false,
      accommodationType: propertyData.accommodationType || "PG",
      occupancyPreference: propertyData.occupancyPreference || "Single",
      furnishing: propertyData.furnishing || "Fully Furnished",
      targetAudience: propertyData.targetAudience || "Both",
      availableFrom: propertyData.availableFrom || new Date().toISOString().split("T")[0],
      listingStatus: "Available",
      verificationStatus: "Owner Claimed",
      listedDate: new Date().toISOString().split("T")[0],
      expiryDays: 45,
      locality: propertyData.locality || "Central",
      city: propertyData.city || "Bengaluru",
      state: propertyData.state || "Karnataka",
      address: propertyData.address || "Main Road",
      landmark: propertyData.landmark || "",
      metroDistanceKm: propertyData.metroDistanceKm || 1.5,
      collegeDistanceKm: propertyData.collegeDistanceKm || 2.0,
      bedrooms: propertyData.bedrooms || 1,
      bathrooms: propertyData.bathrooms || 1,
      area: propertyData.area || 250,
      amenities: propertyData.amenities || ["High-Speed WiFi (300 Mbps)", "Power Backup 24/7", "RO Purified Water"],
      houseRules: propertyData.houseRules || ["Maintain peaceful environment", "No smoking in common areas"],
      ownerId: propertyData.ownerId || 2,
      ownerName: propertyData.ownerName || "Listing Owner",
      ownerResponseTime: "Replies within 2 hours",
      viewsCount: 1,
      enquiriesCount: 0,
      rating: 4.8,
      featured: false,
      images: propertyData.images && propertyData.images.length > 0
        ? propertyData.images
        : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"],
      description: propertyData.description || "Spacious, well-ventilated accommodation suitable for students and working professionals.",
      price: monthlyRent,
      pricePerMonth: monthlyRent,
      type: propertyData.accommodationType || "PG",
      propertyType: propertyData.accommodationType || "PG",
      status: "Available",
      tags: ["Owner Claimed", propertyData.accommodationType || "PG"]
    };

    setProperties(prev => [newProp, ...prev]);
    setFilteredProperties(prev => [newProp, ...prev]);
    toast.success("New rental listing published successfully!");
    return newProp;
  };

  const updatePropertyStatus = (propertyId: number, status: ListingStatus) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return { ...p, listingStatus: status, status };
      }
      return p;
    }));
    setFilteredProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return { ...p, listingStatus: status, status };
      }
      return p;
    }));
    toast.success(`Property #${propertyId} status updated to ${status}`);
  };

  const renewListing = (propertyId: number) => {
    const today = new Date().toISOString().split("T")[0];
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return { ...p, listedDate: today, listingStatus: "Available", status: "Available" };
      }
      return p;
    }));
    toast.success(`Listing #${propertyId} renewed for another 45 days!`);
  };

  const featuredProperties = properties.filter(p => p.featured);

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        filteredProperties,
        loading,
        getPropertyById,
        filterProperties,
        resetFilters,
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        savedIds,
        toggleSaveProperty,
        isSaved,
        enquiries,
        addEnquiry,
        updateEnquiryStatus,
        getEnquiriesForOwner,
        getEnquiriesForSeeker,
        bookings,
        addBooking,
        updateBookingStatus,
        getBookingsForUser,
        getBookingsForProperty,
        reports,
        reportProperty,
        addNewListing,
        updatePropertyStatus,
        renewListing,
        featuredProperties
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (context === undefined) {
    throw new Error("useProperties must be used within a PropertiesProvider");
  }
  return context;
};
