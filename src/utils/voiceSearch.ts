import type { FilterParams } from "../contexts/PropertiesContext";

/** Localities known to the site data, used for voice query parsing. */
export const KNOWN_LOCALITIES = [
  "koramangala",
  "indiranagar",
  "hsr",
  "whitefield",
  "vrindavan",
  "mathura",
  "gwalior",
  "andheri",
  "powai",
  "worcester",
];

/**
 * Human-friendly explanation for Web Speech API recognition errors,
 * so users know how to unblock the mic instead of seeing raw codes.
 */
export function voiceErrorHint(errorCode: string | undefined): string {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return (
        "Microphone blocked. 1) Click the 🔒/mic icon in the address bar → reset permission to Allow. " +
        "2) If you opened this site via a LAN IP over http (e.g. from a phone), the mic only works on " +
        "localhost or HTTPS — use http://localhost:8080 or enable HTTPS."
      );
    case "no-speech":
      return "Didn't hear anything. Tap the mic and speak the query again.";
    case "audio-capture":
      return "No microphone found. Check that a mic is connected and not disabled in OS settings.";
    case "network":
      return "Speech service unreachable — this needs an internet connection (Chrome/Edge cloud STT).";
    case "aborted":
      return ""; // benign, happens when stopping manually
    default:
      return `Voice recognition failed (${errorCode || "unknown error"}). Try again, or type your query.`;
  }
}

/**
 * Parse a natural-language voice search query (Hindi or English) into
 * property filter params. Shared by VoiceSearchBar, the hero voice search
 * and the VoiceCallAgent so spoken queries behave identically everywhere.
 */
export function parseVoiceQuery(text: string): FilterParams {
  const lower = text.toLowerCase();

  const rentMatch = lower.match(/(\d{4,6})\s*(rs|₹|rupees|under|below|का|से)?/);
  const parsedRent = rentMatch ? Number(rentMatch[1]) : undefined;

  const foundLocality = KNOWN_LOCALITIES.find((k) => lower.includes(k));

  const bhkMatch = lower.match(/(\d)\s*bhk/);

  let accommodationType: string | undefined;
  if (bhkMatch) accommodationType = `${bhkMatch[1]} BHK`;
  else if (lower.includes("pg") || lower.includes("पजी")) accommodationType = "PG";
  else if (lower.includes("hostel") || lower.includes("छात्र")) accommodationType = "Hostel";
  else if (lower.includes("shared flat") || lower.includes("flat share")) accommodationType = "Shared Flat";

  return {
    locality: foundLocality ? foundLocality.charAt(0).toUpperCase() + foundLocality.slice(1) : undefined,
    maxRent: parsedRent && parsedRent > 3000 && parsedRent < 200000 ? parsedRent : undefined,
    accommodationType: accommodationType as FilterParams["accommodationType"],
    verifiedOnly: lower.includes("verified") || lower.includes("सत्यापित"),
  };
}

/**
 * Does this spoken utterance look like a property search command (rather
 * than a general question for the AI assistant)?
 */
export function isVoiceSearchIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\d{4,6}/.test(lower) ||
    KNOWN_LOCALITIES.some((k) => lower.includes(k)) ||
    /\bbhk\b/i.test(lower) ||
    lower.includes("pg") ||
    lower.includes("hostel") ||
    lower.includes("मकान") ||
    lower.includes("कमरा") ||
    lower.includes("फ्लैट") ||
    lower.includes("छात्र")
  );
}
