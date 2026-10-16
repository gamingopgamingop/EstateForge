import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildRagPrompt, type ChatTurn } from './siteKnowledge';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "AIzaSyDummyKey");

// Fallback response engine for RentRight if API key is rate-limited or offline
// Exported so the offline rule engine can back-stop any provider failure
export const getOfflineRentRightResponse = (input: string): string => {
  const query = input.toLowerCase();

  if (query.includes("afford") || query.includes("budget") || query.includes("30%")) {
    return "💡 According to RentRight's 30% Rule: You should spend a maximum of 30% of your in-hand monthly salary or student stipend on rent. For example, on a ₹30,000 income, your ideal ceiling is ₹9,000/month. You can test your exact numbers on our /affordability page!";
  }

  if (query.includes("compare") || query.includes("comparison") || query.includes("shortlist")) {
    return "⚖️ RentRight's Comparison Matrix lets you select up to 4 accommodations side-by-side! You can compare monthly rent, refundable deposit, included meals, sub-meter tariffs, and house rules on the /compare page.";
  }

  if (query.includes("deposit") || query.includes("security")) {
    return "🛡️ On RentRight, security deposits are clearly specified upfront (typically 1-2 months rent for PGs and 2-3 months for flats). We recommend checking our Inspection Checklist before paying advance tokens to document existing room conditions.";
  }

  if (query.includes("roommate") || query.includes("flatmate")) {
    return "🤝 Looking for a compatible flatmate? Check out our Roommate Compatibility Matcher at /roommate-matcher! It scores sleep schedules, cleanliness habits, dietary preferences, and social vibes.";
  }

  if (query.includes("inspect") || query.includes("checklist") || query.includes("visit")) {
    return "📋 Use our 15-point Property Inspection Checklist at /inspection-checklist during physical visits. Check water pump pressure, mobile signal strength, and sub-meter unit rates before signing!";
  }

  if (query.includes("owner") || query.includes("list") || query.includes("landlord")) {
    return "🏢 Property owners and PG operators can manage listings, renew expiring properties, and respond to tenant inquiries securely via the Owner Portal at /owner/enquiries.";
  }

  return "Hello! I am your RentRight Assistant. I can help you find student PGs, calculate your 30% affordability limit, guide you through our side-by-side comparison matrix, or explain our non-discrimination fair housing standards. What would you like to explore?";
};

export async function generateGeminiResponse(
  userInput: string,
  history: ChatTurn[] = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // RAG prompt: RentRight persona + retrieved site pages/listings as context
    const prompt = buildRagPrompt(userInput);

    // Replay the last few turns so follow-up questions keep context
    const chatHistory = history.slice(-6).map((turn) => ({
      role: turn.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: turn.content }]
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    // Re-throw: chatApi orchestrates the offline fallback so failures are
    // not silently mislabelled as a Gemini answer.
    console.warn('Gemini API call failed:', error);
    throw error;
  }
}

export async function testGeminiConnection(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('ping');
    return result.response.text();
  } catch (error) {
    console.warn('Gemini connection test failed:', error);
    throw error;
  }
}
