import propertiesData from "../data/properties.json";

/**
 * Site knowledge base for RAG-style answers.
 * Everything the chat assistant knows about RentRight comes from here:
 * the page catalog and the live property listings shipped with the app.
 */

export type SitePage = {
  path: string;
  title: string;
  description: string;
  keywords: string[];
};

export const SITE_PAGES: SitePage[] = [
  {
    path: "/",
    title: "Home",
    description:
      "RentRight landing page for students and early-career professionals finding verified PGs, hostels, shared flats and private rooms.",
    keywords: ["home", "landing", "start"]
  },
  {
    path: "/properties",
    title: "Browse Properties",
    description:
      "Search and filter all verified rental listings by city, locality, budget, accommodation type (PG, hostel, shared flat, private room), furnishing and target audience.",
    keywords: ["properties", "listings", "search", "browse", "filter", "rent", "rooms"]
  },
  {
    path: "/compare",
    title: "Comparison Matrix",
    description:
      "Select up to 4 accommodations and compare them side-by-side: monthly rent, security deposit, maintenance, meals included, amenities and house rules.",
    keywords: ["compare", "comparison", "side-by-side", "shortlist"]
  },
  {
    path: "/affordability",
    title: "Affordability Calculator",
    description:
      "RentRight 30% rule calculator: maximum healthy rent is 30% of in-hand salary or stipend. Enter income and see your rent ceiling.",
    keywords: ["afford", "budget", "30%", "salary", "stipend", "income", "calculator", "emi"]
  },
  {
    path: "/roommate-matcher",
    title: "Roommate Compatibility Matcher",
    description:
      "Match with compatible flatmates by sleep schedule, cleanliness habits, dietary preferences and social vibe.",
    keywords: ["roommate", "flatmate", "match", "sharing", "compatibility"]
  },
  {
    path: "/inspection-checklist",
    title: "15-Point Property Inspection Checklist",
    description:
      "Checklist for physical visits: water pump pressure, mobile signal, sub-meter tariffs, ventilation, locks, geyser, power backup before paying any token advance.",
    keywords: ["inspect", "checklist", "visit", "site", "verification"]
  },
  {
    path: "/locality-compare",
    title: "Locality Comparison",
    description:
      "Compare localities on metro distance, college distance, safety, food options and typical rent ranges before zeroing in on an area.",
    keywords: ["locality", "area", "neighborhood", "compare area", "metro"]
  },
  {
    path: "/tools",
    title: "Tenant Tools Hub",
    description:
      "One hub for all free RentRight tools: affordability, comparison, roommate matcher, inspection checklist and locality compare.",
    keywords: ["tools", "features", "free tools"]
  },
  {
    path: "/owner/enquiries",
    title: "Owner Portal (RBAC protected)",
    description:
      "Landlord & PG operator workspace to manage tenant enquiries, publish listings, mark rooms rented and renew 45-day expiring listings. Access restricted to owner and admin roles only.",
    keywords: ["owner", "landlord", "list property", "pg operator", "manage listings", "enquiries"]
  },
  {
    path: "/dashboard",
    title: "My Dashboard",
    description:
      "Personal seeker dashboard with saved properties, sent enquiries and scheduled visits. Login required.",
    keywords: ["dashboard", "saved", "profile", "account"]
  },
  {
    path: "/about",
    title: "About RentRight",
    description:
      "Mission: transparent, zero-discrimination rental discovery for students and professionals with verified listings and double-blind privacy.",
    keywords: ["about", "mission", "trust", "why rentright"]
  },
  {
    path: "/contact",
    title: "Contact & Support",
    description:
      "Reach the RentRight trust & support team for escalations, listing complaints and partnership enquiries.",
    keywords: ["contact", "support", "help", "email", "phone", "complaint"]
  }
];

type SiteProperty = {
  id: number;
  title: string;
  monthlyRent: number;
  securityDeposit: number;
  accommodationType: string;
  locality: string;
  city: string;
  furnishing: string;
  targetAudience: string;
  listingStatus: string;
  verificationStatus: string;
  amenities: string[];
  houseRules: string[];
  description: string;
  rating: number;
  availableFrom: string;
};

const PROPERTIES = propertiesData as unknown as SiteProperty[];

const STOP_WORDS = new Set([
  "what", "the", "is", "are", "can", "you", "i", "to", "of", "in", "for", "a",
  "and", "my", "on", "how", "do", "me", "with", "about", "tell", "please"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9%]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function scorePage(page: SitePage, terms: string[]): number {
  const headline = (page.title + " " + page.keywords.join(" ")).toLowerCase();
  const body = page.description.toLowerCase();
  return terms.reduce(
    (score, t) => score + (headline.includes(t) ? 3 : body.includes(t) ? 1 : 0),
    0
  );
}

/** Parse a budget out of natural language, e.g. "under 10000", "8k rent". */
export function parseBudget(text: string): number | null {
  const matches = text.toLowerCase().match(/\d[\d,]*/g);
  if (!matches) return null;
  for (const rawNum of matches) {
    const value = parseInt(rawNum.replace(/,/g, ""), 10);
    if (!Number.isNaN(value) && value >= 3000 && value <= 500000) return value;
  }
  return null;
}

/**
 * Resolve what rent amount the user can actually target.
 * If they quote an income ("afford on 40000 salary") we apply RentRight's
 * own 30% rule; otherwise we take the stated rent budget as-is.
 */
export function resolveRentCeiling(text: string): { ceiling: number | null; fromIncome: boolean } {
  const lower = text.toLowerCase();
  const budget = parseBudget(text);
  if (budget === null) return { ceiling: null, fromIncome: false };

  const incomeWords = ["salary", "income", "stipend", "earn", "ctc", "in hand", "per month take"];
  const mentionsIncome = incomeWords.some((w) => lower.includes(w));
  if (mentionsIncome && /afford|budget|can i|limit|maximum|rule/.test(lower)) {
    return { ceiling: Math.round((budget * 0.3) / 500) * 500, fromIncome: true };
  }
  return { ceiling: budget, fromIncome: false };
}

function scoreProperty(
  p: SiteProperty,
  terms: string[],
  budget: number | null
): number {
  const headline = (p.title + " " + p.accommodationType + " " + p.locality + " " + p.city + " " + p.targetAudience + " " + p.furnishing).toLowerCase();
  const details = (p.amenities.join(" ") + " " + p.houseRules.join(" ") + " " + p.description).toLowerCase();

  let score = terms.reduce(
    (s, t) => s + (headline.includes(t) ? 3 : details.includes(t) ? 1 : 0),
    0
  );

  // Budget fit: strongly prefer listings the user can actually afford
  if (budget !== null) {
    if (p.monthlyRent <= budget) score += 6;
    else if (p.monthlyRent <= budget * 1.3) score += 2;
    else score -= 6;
  }

  if (p.verificationStatus === "Verified") score += 1;
  if (p.listingStatus === "Available") score += 1;

  return score;
}

/** Retrieve the most relevant site content for a user question. */
export function retrieveSiteContext(userInput: string, maxPages = 3, maxProperties = 3): string {
  const terms = tokenize(userInput);
  const { ceiling: budget, fromIncome } = resolveRentCeiling(userInput);

  const pageScores = SITE_PAGES.map((p) => ({ p, score: scorePage(p, terms) }));
  // When a budget is mentioned, the affordability tool is nearly always useful
  if (budget !== null) {
    const aff = SITE_PAGES.find((p) => p.path === "/affordability");
    if (aff && !pageScores.some((r) => r.p.path === "/affordability" && r.score > 0)) {
      pageScores.push({ p: aff, score: 1 });
    }
  }

  const rankedPages = pageScores
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPages);

  const rankedProps = PROPERTIES.map((prop) => ({
    prop,
    score: scoreProperty(prop, terms, budget)
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxProperties);

  const parts: string[] = [];

  if (rankedPages.length > 0) {
    parts.push(
      "Relevant RentRight pages:\n" +
        rankedPages
          .map(({ p }) => `- ${p.title} (${p.path}): ${p.description}`)
          .join("\n")
    );
  }

  if (rankedProps.length > 0) {
    parts.push(
      "Relevant live listings (from the site's own property data)" +
        (budget !== null
          ? " \u2014 " +
            (fromIncome
              ? "RentRight 30% rule ceiling for the stated income: \u20B9" + budget + "/month"
              : "user's stated budget: \u20B9" + budget + "/month")
          : "") +
        ":\n" +
        rankedProps
          .map(
            ({ prop }) =>
              `- [ID ${prop.id}] ${prop.title} — ₹${prop.monthlyRent}/mo, deposit ₹${prop.securityDeposit}, ${prop.accommodationType}, ${prop.locality}, ${prop.city}. ${prop.verificationStatus}, ${prop.listingStatus}, rating ${prop.rating}/5, available from ${prop.availableFrom}. Amenities: ${prop.amenities.slice(0, 5).join(", ")}.`
          )
          .join("\n")
    );
  }

  if (parts.length === 0) {
    // No keyword hits: still anchor the model with the general site map.
    parts.push(
      "RentRight site map:\n" +
        SITE_PAGES.map((p) => `- ${p.path}: ${p.title}`).join("\n")
    );
  }

  return parts.join("\n\n");
}

const PERSONA = `You are the RentRight AI assistant. RentRight is a transparent rental accommodation platform for university students and early-career working professionals in India (PGs, hostels, shared flats, private rooms).

Core site facts you must stay consistent with:
- 30% affordability rule: rent should not exceed 30% of in-hand salary/stipend (see /affordability).
- Security deposits: typically 1-2 months rent for PGs, 2-3 months for flats, always shown upfront.
- All listings are verification-checked; fair-housing zero-discrimination policy is enforced.
- Double-blind privacy: tenant contacts are only shared after the owner accepts the enquiry.
- Owner Portal at /owner/enquiries is role-protected (owners/admins only); tenants cannot access it.
- Free tools: /compare (up to 4 listings), /roommate-matcher, /inspection-checklist (15 points), /locality-compare.

Rules for answering:
1. Ground your answer in the provided SITE CONTEXT when it is relevant; quote real prices, localities and amenities from it.
2. Always point users to the exact RentRight page path that helps them next.
3. If the site context does not cover the question, answer helpfully from general rental advice and say it is not from RentRight data.
4. Be concise (under 120 words), friendly, and India-relevant (₹ amounts).
5. Reply in plain text only — no markdown formatting, no code blocks.`;

/** Build the RAG prompt (system instructions + retrieved site context + question). */
export function buildRagPrompt(userInput: string): string {
  const context = retrieveSiteContext(userInput);
  return `${PERSONA}

SITE CONTEXT:
${context}

USER QUESTION: ${userInput}`;
}

/** Conversation turn used by both model providers. */
export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * Normalize a chat log into strictly alternating turns:
 * - drops empty turns (e.g. the seeded greeting that has no provider)
 * - merges consecutive turns from the same speaker (we render one bubble
 *   per model, so a question can produce two assistant turns in a row)
 * - ensures the history starts with a user turn (required by Gemini)
 */
export function normalizeHistory(turns: ChatTurn[], maxTurns = 6): ChatTurn[] {
  const merged: ChatTurn[] = [];
  for (const turn of turns) {
    if (!turn.content?.trim()) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === turn.role) last.content += "\n\n" + turn.content;
    else merged.push({ ...turn });
  }

  while (merged.length > 0 && merged[0].role !== "user") merged.shift();

  return merged.slice(-maxTurns);
}
