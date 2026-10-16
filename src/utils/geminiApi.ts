import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "AIzaSyDummyKey");

// Fallback response engine for RentRight if API key is rate-limited or offline
const getOfflineRentRightResponse = (input: string): string => {
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

export async function generateGeminiResponse(userInput: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const rentRightPrompt = `You are the AI assistant for RentRight, a transparent rental accommodation discovery platform for university students and early-career working professionals.
    Address questions about:
    - Finding student PGs, shared flats, and private rooms
    - The 30% rental affordability rule
    - Comparing rent, security deposits, and mess food
    - On-site property inspection checklists
    - Tenant rights and zero-discrimination fair housing practices
    Be helpful, concise, and informative. User question: ${userInput}`;

    const result = await model.generateContent(rentRightPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.warn('Gemini API call fallback to RentRight rule engine:', error);
    return getOfflineRentRightResponse(userInput);
  }
}

export async function testGeminiConnection(): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('ping');
    return result.response.text();
  } catch (error) {
    return 'RentRight Offline Engine Active';
  }
}
