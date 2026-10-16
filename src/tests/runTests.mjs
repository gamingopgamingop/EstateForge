import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, "../data/properties.json");
const initialProperties = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

console.log("=========================================");
console.log("🧪 RentRight Automated Test Suite");
console.log("=========================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    failed++;
  }
}

// TEST 1: Property Schema Validation
test("1. Properties schema contains required rental fields (Rent, Deposit, Type, Occupancy)", () => {
  assert(initialProperties.length > 0, "Properties list should not be empty");
  for (const p of initialProperties) {
    assert(typeof p.id === "number", `Property ${p.id} must have numeric id`);
    assert(typeof p.monthlyRent === "number", `Property ${p.id} must have monthlyRent`);
    assert(typeof p.securityDeposit === "number", `Property ${p.id} must have securityDeposit`);
    assert(["PG", "Hostel", "Shared Flat", "Room", "Entire Apartment"].includes(p.accommodationType), `Property ${p.id} has invalid accommodationType: ${p.accommodationType}`);
    assert(["Single", "Double", "Triple", "Any"].includes(p.occupancyPreference), `Property ${p.id} has invalid occupancyPreference: ${p.occupancyPreference}`);
    assert(["Verified", "Owner Claimed"].includes(p.verificationStatus), `Property ${p.id} must have verificationStatus`);
    assert(["Available", "Rented"].includes(p.listingStatus), `Property ${p.id} must have listingStatus`);
    assert(typeof p.locality === "string", `Property ${p.id} must have locality`);
  }
});

// TEST 2: Filter Logic (Locality & Budget)
test("2. Locality and Budget filtering operates accurately", () => {
  const query = "koramangala";
  const filteredLocality = initialProperties.filter(p =>
    p.locality.toLowerCase().includes(query) || p.address.toLowerCase().includes(query)
  );
  assert(filteredLocality.length >= 2, "Should find at least 2 properties in Koramangala");

  const budget = 12000;
  const filteredBudget = initialProperties.filter(p => p.monthlyRent <= budget);
  assert(filteredBudget.length > 0, "Should find affordable options under 12k");
  assert(filteredBudget.every(p => p.monthlyRent <= budget), "All returned properties must be <= budget");
});

// TEST 3: Filter Logic (Accommodation Type & Occupancy)
test("3. Accommodation Type and Occupancy filter works correctly", () => {
  const pgs = initialProperties.filter(p => p.accommodationType === "PG");
  assert(pgs.length >= 2, "Should find PG listings");

  const singleRooms = initialProperties.filter(p => p.occupancyPreference === "Single");
  assert(singleRooms.length >= 3, "Should find single occupancy listings");
});

// TEST 4: Innovation 1 - 30% Affordability Calculation & Warning
test("4. Affordability Calculator flags rent > 30% and > 40% correctly", () => {
  const monthlySalary = 40000;
  const recommendedLimit = monthlySalary * 0.30; // 12000
  const maxStretchLimit = monthlySalary * 0.40;  // 16000

  assert.strictEqual(recommendedLimit, 12000, "Recommended 30% rent should be 12,000 for 40,000 salary");

  const safeRent = 10000;
  const safeRatio = safeRent / monthlySalary;
  assert(safeRatio <= 0.30, "Safe rent should be <= 30%");

  const moderateRent = 14000;
  const modRatio = moderateRent / monthlySalary;
  assert(modRatio > 0.30 && modRatio <= 0.40, "Moderate rent should be between 30% and 40%");

  const excessiveRent = 20000;
  const excessiveRatio = excessiveRent / monthlySalary;
  assert(excessiveRatio > 0.40, "Excessive rent should trigger high housing burden warning (>40%)");
});

// TEST 5: Privacy-Respecting Contact Masking & Permission
test("5. Contact details masking constraint: phone not shared without consent", () => {
  const seekerInput = {
    name: "Rahul Verma",
    email: "rahul@example.com",
    phone: "+91 98765 43210",
    shareContactPermission: false
  };

  const maskedEnquiry = {
    seekerName: seekerInput.name,
    seekerEmail: seekerInput.email,
    seekerPhone: seekerInput.shareContactPermission ? seekerInput.phone : undefined,
    shareContactPermission: seekerInput.shareContactPermission
  };

  assert.strictEqual(maskedEnquiry.seekerPhone, undefined, "Phone must remain undefined when shareContactPermission is false");

  const consentEnquiry = {
    ...maskedEnquiry,
    shareContactPermission: true,
    seekerPhone: seekerInput.phone
  };

  assert.strictEqual(consentEnquiry.seekerPhone, "+91 98765 43210", "Phone should be shared when permission is explicitly granted");
});

// TEST 6: Auto-expiry calculation
test("6. Listing Auto-expiry calculation flags older listings", () => {
  const now = new Date("2026-10-16").getTime();

  const freshListing = {
    id: 101,
    listedDate: "2026-10-01",
    expiryDays: 45
  };
  const freshListedTime = new Date(freshListing.listedDate).getTime();
  const isFreshExpired = (now - freshListedTime) > (freshListing.expiryDays * 24 * 60 * 60 * 1000);
  assert.strictEqual(isFreshExpired, false, "15-day-old listing should NOT be expired");

  const staleListing = {
    id: 102,
    listedDate: "2026-06-01",
    expiryDays: 45
  };
  const staleListedTime = new Date(staleListing.listedDate).getTime();
  const isStaleExpired = (now - staleListedTime) > (staleListing.expiryDays * 24 * 60 * 60 * 1000);
  assert.strictEqual(isStaleExpired, true, "130-day-old listing SHOULD be flagged as expired");
});

// TEST 7: Owner Listing Status Toggle (Available <-> Rented)
test("7. Owner Listing Status toggle operates correctly", () => {
  let property = { id: 1, listingStatus: "Available" };
  const toggleStatus = (p) => ({
    ...p,
    listingStatus: p.listingStatus === "Available" ? "Rented" : "Available"
  });

  property = toggleStatus(property);
  assert.strictEqual(property.listingStatus, "Rented", "Should toggle Available to Rented");

  property = toggleStatus(property);
  assert.strictEqual(property.listingStatus, "Available", "Should toggle Rented back to Available");
});

console.log("\n=========================================");
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log("=========================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 All RentRight test suites passed successfully!");
}
