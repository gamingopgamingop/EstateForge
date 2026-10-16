import { generateGeminiResponse, getOfflineRentRightResponse } from "./geminiApi";
import { generateNemotronResponse } from "./nemotronApi";
import type { ChatTurn } from "./siteKnowledge";

/**
 * Dual-model chat orchestrator: every question is answered by BOTH
 * Google Gemini and NVIDIA Nemotron, each grounded in RentRight's own
 * site data (see siteKnowledge.ts). Results are labelled so users can
 * see which model answered.
 */

export type ChatProvider = "Gemini" | "Nemotron" | "Offline";

export type ChatReply = {
  provider: ChatProvider;
  text: string;
};

async function safeGenerate(
  provider: ChatProvider,
  fn: () => Promise<string>
): Promise<ChatReply | null> {
  try {
    const text = await fn();
    return { provider, text };
  } catch (error) {
    console.warn(`${provider} generation failed:`, error);
    return null;
  }
}

/** Ask Gemini and Nemotron in parallel; returns one reply per successful model. */
export async function generateDualChatReplies(
  userInput: string,
  history: ChatTurn[] = []
): Promise<ChatReply[]> {
  const [gemini, nemotron] = await Promise.all([
    safeGenerate("Gemini", () => generateGeminiResponse(userInput, history)),
    safeGenerate("Nemotron", () => generateNemotronResponse(userInput, history))
  ]);

  const replies = [gemini, nemotron].filter((r): r is ChatReply => r !== null);

  if (replies.length > 0) {
    return replies;
  }

  // Both providers unavailable (bad keys, CORS, offline) — rule-engine fallback
  return [{ provider: "Offline", text: getOfflineRentRightResponse(userInput) }];
}
