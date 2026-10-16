# RentRight 🏠

**Transparent Accommodation Discovery for Students & Working Professionals**  
*Privacy-first rental discovery, comparison matrix, affordability calculator, and transparent owner management.*

---

## 🎯 Executive Summary & Problem Solved
Finding rental accommodation in university and IT corridors (Bengaluru, Delhi NCR, Pune, etc.) is plagued by hidden broker fees, fake photo listings, predatory deposit deductions, discriminatory tenancy refusals, and phone number leakage resulting in endless spam.

**RentRight** re-architects rental discovery into a transparent, fair, and privacy-first web application.

---

## 🌟 Core Architecture & Platform Capabilities

### 1. Two Dedicated Roles (Seeker & Owner)
- **Seeker (Student / Working Professional)**: Discover rooms/PGs/flats, save shortlists, send permissioned inquiries, schedule property viewings, and check affordability.
  - *Demo Quick Login*: Rahul Verma (Software Engineer Intern)
- **Owner (Landlord / PG Operator)**: Manage rental inventory, toggle status (`Available` <-> `Rented`), respond to tenant inquiries with double-blind contact protection, and renew listings.
  - *Demo Quick Login*: Priya Sharma (Zolo/Stanza Partner)
- **Admin**: Review flagged listings and inspect platform metrics.

### 2. Rental-Specific Data Schema
Replaced generic "Sale Price" with transparent rental fields:
- `monthlyRent`: Net rent per month
- `securityDeposit`: Refundable security deposit (clearly documented)
- `maintenance`: Fixed monthly maintenance or zero
- `billsIncluded`: Clear flag on whether food, electricity, and WiFi are included
- `accommodationType`: `Room`, `PG`, `Hostel`, `Shared Flat`, `Entire Apartment`
- `occupancyPreference`: `Single`, `Double`, `Triple`, `Any`
- `furnishing`: `Fully Furnished`, `Semi-Furnished`, `Unfurnished`
- `targetAudience`: `Students`, `Working Professionals`, `Both`
- `availableFrom`: Exact ready-to-move date
- `listingStatus`: `Available` or `Rented`
- `verificationStatus`: `Verified` (Physically audited) vs `Owner Claimed`
- `expiryDays`: Auto-expiry trigger (default 45-60 days) to eliminate ghost listings
- `metroDistanceKm` & `collegeDistanceKm`: Transit and campus proximity

### 3. Locality, Budget & Accommodation Search
- Search by locality, landmark, or university corridor (e.g. *Koramangala*, *HSR Layout*, *North Campus*, *Whitefield*).
- Interactive monthly budget slider.
- Multi-dimensional filters for occupancy, furnishing, and target audience.
- Toggles: **Verified Listings Only** & **Hide Already Rented**.

### 4. Property Comparison Matrix (`/compare`)
- Select up to 4 accommodations side-by-side.
- Side-by-side table comparing:
  - Monthly Rent & Security Deposit
  - Estimated Total Move-in Cost (1st Month + Deposit + Maintenance)
  - Included meals, WiFi speed, power backup, AC, attached washrooms
  - Distance to nearest metro and colleges
  - House rules, gate curfew, and visitor policies
  - One-click enquiry trigger directly from the matrix

### 5. Privacy-Respecting Enquiry System
- **Constraint Handled**: *"Do not publish private contact without permission"*.
- Replaced public phone exposure with a double-blind inquiry pipeline:
  - Seeker transmits inquiry with move-in date and duration.
  - Phone number is **masked by default**.
  - Seeker explicitly opts in via checkbox to share phone number with the verified landlord.
  - Generates verifiable reference ticket (e.g. `#ENQ-1001`).

### 6. Visit Scheduling & Saved Shortlist
- Interactive calendar to pick viewing dates and preferred time slots (e.g. *11:00 AM*, *02:30 PM*, *05:00 PM*).
- Supports both **In-Person** and **Virtual Video Tours**.
- Heart bookmarking for instant shortlisting.

### 7. Suspicious & Discriminatory Listing Reporting
- Dedicated "Report Listing" trigger on every property.
- Category reporting for:
  - *Already Rented / Ghost Listing*
  - *Hidden Charges Quoted Offline*
  - *Discriminatory Requirements (Religious, Caste, or Food Bias)*
  - *Misleading Photos or Locality*
- Submits structured ticket with 24h moderation turnaround.

### 8. Dedicated Owner Dashboard (`/owner/enquiries` & `/owner/dashboard`)
- Real-time inquiry queue with applicant profile, stay duration, and message.
- "Reply / Accept" action with direct messaging.
- Real-time toggle: Switch status between **Available** and **Rented**.
- "Renew Listing" button (extends listing expiration by 45 days).
- View counts and inquiry conversion analytics.

---

## 🚀 4 Key Platform Innovations Implemented

| Innovation | Route | Description |
|---|---|---|
| **1. 30% Rental Affordability Calculator** | `/affordability` | Applies standard 30% rule to student stipends and professional salaries. Warns if rent exceeds 30-40% of income and outputs safe budget limit. |
| **2. Roommate Compatibility Matcher** | `/roommate-matcher` | 6-factor quiz evaluating sleep cycles (Night Owl vs Early Riser), cleanliness, diet in kitchen, and social vibes with % match scoring. |
| **3. Property Inspection Checklist** | `/inspection-checklist` | 15-point mobile checklist for physical visits to audit water pump pressure, sub-meter rates, mobile 5G signal, and door security. |
| **4. Locality Intelligence Tool** | `/locality-compare` | Side-by-side comparison of tech and student areas on average PG rent, safety rating, metro transit, and food culture. |

---

## 🛡️ Constraint Compliance
- **Zero Contact Leakage**: Landlord & Seeker direct numbers are masked until permissioned.
- **Verified vs Owner-Claimed**: Distinct visual badges (green ShieldCheck vs amber Claimed).
- **Fair Housing Pledge**: Explicit community policy prohibiting caste, religion, or gender bias in tenancy.

---

## 🧪 Testing Suite
Run automated unit and integration tests:
```bash
npm test
```
**Test Coverage**:
1. Rental schema validation (monthlyRent, securityDeposit, accommodationType, occupancy)
2. Locality and budget filtering accuracy
3. Accommodation type and occupancy filters
4. 30% and 40% affordability warning mathematics
5. Contact masking constraint (no phone leakage without consent)
6. Listing auto-expiry calculation logic
7. Owner listing status toggle (Available <-> Rented)

---

## 💻 Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons, Framer Motion
- **State & Storage**: React Context + localStorage persistence (Supabase / Firebase ready)
- **AI Assistant**: Google Gemini API integration with offline fallback rule engine
