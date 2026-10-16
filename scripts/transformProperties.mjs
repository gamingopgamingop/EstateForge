import fs from "fs";
import path from "path";

const dataPath = path.resolve("src/data/properties.json");
const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// 37 verified-working Unsplash photo IDs (each returns HTTP 200).
const pool = [
  "photo-1555854877-bab0e564b8d5", "photo-1522708323590-d24dbb6b0267",
  "photo-1502672260266-1c1ef2d93688", "photo-1560448204-e02f11c3d0e2",
  "photo-1484154218962-a197022b5858", "photo-1595526114035-0d45ed16cfbf",
  "photo-1505691938895-1758d7feb511", "photo-1586023492125-27b2c045efd7",
  "photo-1522771739844-6a9f6d5f14af", "photo-1493809842364-78817add7ffb",
  "photo-1512917774080-9991f1c4c750", "photo-1502672023488-70e25813eb80",
  "photo-1600585154340-be6161a56a0c", "photo-1513694203232-719a280e022f",
  "photo-1536376072261-38c75010e6c9", "photo-1512918728675-ed5a9ecdebfd",
  "photo-1560185007-cde436f6a4d0", "photo-1598928506311-c55ded91a20c",
  "photo-1600566753376-12c8ab7fb75b", "photo-1493246507139-91e8fad9978e",
  "photo-1600607687939-ce8a6c25118c", "photo-1600210492486-724fe5c67fb0",
  "photo-1544923246-77307dd654cb", "photo-1533090161767-e6ffed986c88",
  "photo-1505693416388-ac5ce068fe85", "photo-1616486029423-aaa4789e8c9a",
  "photo-1583394838336-acd977736f90", "photo-1556912167-f556f1f39fdf",
  "photo-1556911220-bff31c812dba", "photo-1600566752355-35792bedcfea",
  "photo-1560184897-ae75f418493e", "photo-1618221195710-dd6b41faaea6",
  "photo-1570129477492-45c003edd2be", "photo-1580587771525-78b9dba3b914",
  "photo-1582268611958-ebfd161ef9cf", "photo-1614613535308-eb5fbd3d2c17",
  "photo-1542314831-068cd1dbfeeb",
];
const url = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

// Build a 3-image gallery for property index i.
// pool[i] is the unique hero for property i (i < pool.length), guaranteeing
// no two listings share the same main photo.
function galleryFor(i) {
  const hero = pool[i % pool.length];
  const s2 = pool[(i + 13) % pool.length];
  const s3 = pool[(i + 25) % pool.length];
  return [hero, s2, s3].map(url);
}

// 1) Reassign distinct images to every existing property.
raw.forEach((p, i) => {
  p.images = galleryFor(i);
});

// 2) Append new listings with distinct images and full field coverage.
const today = "2026-10-16";
const newListings = [
  {
    title: "Prestige Lakeview 2BHK Family Flat - Gated Community",
    monthlyRent: 27000, securityDeposit: 54000, maintenance: 2500, billsIncluded: false,
    accommodationType: "Entire Apartment", occupancyPreference: "Double", furnishing: "Semi-Furnished",
    targetAudience: "Working Professionals", locality: "Whitefield ITPL Road", city: "Bengaluru", state: "Karnataka",
    address: "Block C, Prestige Lakeview, ITPL Main Road, Whitefield", landmark: "Near DLF Towncenter & Phoenix Marketcity",
    metroDistanceKm: 3.4, collegeDistanceKm: 6.0, bedrooms: 2, bathrooms: 2, area: 1050,
    amenities: ["Clubhouse & Gym", "Swimming Pool", "Covered Car Parking", "24x7 Security & CCTV", "Modular Kitchen", "Wide Balcony with Lake View", "Lift Access", "Children's Play Area", "Power Backup"],
    houseRules: ["Family and working professionals preferred", "No commercial or co-working use", "Society maintenance paid by tenant", "Pets allowed with society NOC"],
    ownerId: 2, ownerName: "Karthik Reddy", viewsCount: 148, enquiriesCount: 6, rating: 4.6, featured: false,
    description: "Spacious 2BHK family apartment in a gated lakeside community in Whitefield. Clubhouse, pool and gym included, with quick access to ITPL and Outer Ring Road tech parks.",
    tags: ["Verified", "Family", "Gated Community", "Lake View"],
  },
  {
    title: "Cozy Women-Only PG with Meals near Marathahalli",
    monthlyRent: 10500, securityDeposit: 15000, maintenance: 0, billsIncluded: true,
    accommodationType: "PG", occupancyPreference: "Triple", furnishing: "Fully Furnished",
    targetAudience: "Students", locality: "Marathahalli Bridge", city: "Bengaluru", state: "Karnataka",
    address: "No 45, 5th Cross, Marathahalli", landmark: "Near Army Service Hospital & Inorbit Mall",
    metroDistanceKm: 4.2, collegeDistanceKm: 2.5, bedrooms: 3, bathrooms: 2, area: 140,
    amenities: ["3 Meals Daily (Veg/Non-Veg)", "High-Speed WiFi", "Hot Water 24/7", "Attached Washrooms", "Wardrobe & Study Table", "Weekly Housekeeping", "Washing Machine", "CCTV & Ladies Warden"],
    houseRules: ["Strictly women & girls only", "Visitors only in ground-floor lounge", "Curfew at 11:00 PM for safety", "No smoking or alcohol inside"],
    ownerId: 2, ownerName: "Lakshmi PG Residency", viewsCount: 210, enquiriesCount: 11, rating: 4.4, featured: false,
    description: "Safe, affordable women-only PG with home-style meals, dedicated ladies warden and all-inclusive bills. Walking distance to Marathahalli tech park and Inorbit Mall.",
    tags: ["Food Included", "Women Only", "Bills Included", "WiFi"],
  },
  {
    title: "Modern Co-living Studio for Professionals - Powai",
    monthlyRent: 22000, securityDeposit: 40000, maintenance: 1500, billsIncluded: false,
    accommodationType: "Room", occupancyPreference: "Single", furnishing: "Fully Furnished",
    targetAudience: "Working Professionals", locality: "Hiranandani Gardens, Powai", city: "Mumbai", state: "Maharashtra",
    address: "Python Apartment, Hiranandani Gardens, Powai", landmark: "Near L & T BDT & IIT Mumbai",
    metroDistanceKm: 2.0, collegeDistanceKm: 1.5, bedrooms: 1, bathrooms: 1, area: 380,
    amenities: ["Premium Fully Furnished Studio", "High-Speed Fiber WiFi", "Air Conditioner (AC)", "Smart TV & Work Desk", "Modern Kitchenette", "Gym & Lounge Access", "24x7 Security", "Weekly Cleaning", "Rooftop Cafeteria"],
    houseRules: ["Professional & quiet community", "Electricity shared via sub-meter", "Guests need prior intimation", "No smoking indoors"],
    ownerId: 2, ownerName: "Zolo Powai Manager", viewsCount: 356, enquiriesCount: 18, rating: 4.7, featured: true,
    description: "Move-in ready premium studio in the heart of Hiranandani Powai. Ideal for IIT and L&T professionals wanting a furnished, serviced co-living space steps from cafes and the lake.",
    tags: ["Verified", "Serviced", "AC", "Co-living"],
  },
  {
    title: "Budget Student Hostel - Near Anna University, Chennai",
    monthlyRent: 6500, securityDeposit: 8000, maintenance: 0, billsIncluded: true,
    accommodationType: "Hostel", occupancyPreference: "Triple", furnishing: "Semi-Furnished",
    targetAudience: "Students", locality: "Guindy, IT Expressway", city: "Chennai", state: "Tamil Nadu",
    address: "New Hostel Block, Guindy Industrial Estate", landmark: "Near Anna University & Phoenix Marketcity",
    metroDistanceKm: 3.0, collegeDistanceKm: 0.7, bedrooms: 3, bathrooms: 1, area: 120,
    amenities: ["2 Meals Included", "Study Halls & Library", "High-Speed WiFi", "RO Drinking Water", "Common Room & TV", "Hot Water Geysers", "Laundry Service", "CCTV & Security Warden"],
    houseRules: ["Students only with valid ID", "Silent hours during exam season", "No outside cooking in dorms", "Attendance roll-call at 10 PM"],
    ownerId: 2, ownerName: "South Campus Hostels", viewsCount: 402, enquiriesCount: 22, rating: 4.3, featured: false,
    description: "Affordable all-meals-included student hostel just 700m from Anna University. Study halls, common room and wardens make it a budget pick for engineering students.",
    tags: ["Students", "Food Included", "Budget", "Near College"],
  },
  {
    title: "Luxury 3BHK Penthouse with Terrace - Gachibowli",
    monthlyRent: 55000, securityDeposit: 110000, maintenance: 4500, billsIncluded: false,
    accommodationType: "Entire Apartment", occupancyPreference: "Any", furnishing: "Fully Furnished",
    targetAudience: "Working Professionals", locality: "Gachibowli Financial District", city: "Hyderabad", state: "Telangana",
    address: "My Home Dashboard, Survey No 640, Nallagandla", landmark: "Near Microsoft Campus & DLF Cyber City",
    metroDistanceKm: 1.2, collegeDistanceKm: 5.0, bedrooms: 3, bathrooms: 3, area: 2100,
    amenities: ["Private Terrace & Skyline View", "VRV Air Conditioning", "Italian Marble Flooring", "Walk-in Wardrobe", "Modular Kitchen with Appliances", "Gated 24x7 Security & Concierge", "Clubhouse, Gym & Pool", "2 Covered Parking Slots", "Smart Home Automation"],
    houseRules: ["Corporate teams & families welcome", "Maintenance & security deposit refundable", "No parties above 8 persons", "Strict society quiet hours 11 PM - 7 AM"],
    ownerId: 2, ownerName: "NTR Properties", viewsCount: 78, enquiriesCount: 4, rating: 4.9, featured: true,
    description: "Top-floor luxury penthouse with a private terrace and unbroken skyline views in Hyderabad's Financial District. Fully automated, premium-finished and minutes from Microsoft and DLF Cyber City.",
    tags: ["Verified", "Luxury", "Penthouse", "Fully Furnished"],
  },
];

const startIndex = raw.length; // 32 -> new ids begin here
newListings.forEach((nl, k) => {
  const id = Math.max(...raw.map((p) => p.id)) + 1 + k;
  const availFrom = "2026-11-0" + ((k % 9) + 1);
  const prop = {
    id,
    ...nl,
    availableFrom: availFrom,
    listingStatus: "Available",
    verificationStatus: nl.tags.includes("Verified") ? "Verified" : "Owner Claimed",
    listedDate: today,
    expiryDays: 60,
    ownerResponseTime: "Replies within 1-2 hours",
    images: galleryFor(startIndex + k),
    price: nl.monthlyRent,
    pricePerMonth: nl.monthlyRent,
    type: nl.accommodationType,
    propertyType: nl.accommodationType,
    status: "Available",
    yearBuilt: 2021 + (k % 3),
  };
  raw.push(prop);
});

// Sanity: every hero (first image) must be unique across all listings.
const heroes = raw.map((p) => p.images[0]);
const dupes = heroes.filter((h, i) => heroes.indexOf(h) !== i);
if (dupes.length) {
  console.error("Duplicate heroes detected:", [...new Set(dupes)]);
  process.exit(1);
}

fs.writeFileSync(dataPath, JSON.stringify(raw, null, 2) + "\n", "utf8");
console.log("Total properties:", raw.length);
console.log("Unique hero images:", new Set(heroes).size);
