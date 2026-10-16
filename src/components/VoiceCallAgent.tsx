import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { generateDualChatReplies, type ChatProvider } from "../utils/chatApi";
import type { ChatTurn } from "../utils/siteKnowledge";
import { parseVoiceQuery, isVoiceSearchIntent, voiceErrorHint } from "../utils/voiceSearch";
import { useProperties } from "../contexts/PropertiesContext";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

type CallTurn = { id: string; speaker: "you" | "agent"; text: string; provider?: ChatProvider };
type CallStatus = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended";

/** Keep spoken replies short and free of markdown decoration. */
function toSpokenText(text: string): string {
  const plain = text
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  const sentences = plain.split(/(?<=[.!?।])\s+/).slice(0, 3);
  const capped = sentences.join(" ");
  return capped.length > 420 ? capped.slice(0, 400) + "…" : capped;
}

/**
 * VoiceCallAgent: a hands-free "call the assistant" experience. Uses the Web
 * Speech API for speech recognition (en-IN / hi-IN) and speech synthesis to
 * speak replies generated from RentRight site data (Gemini + Nemotron).
 * Search commands spoken during the call apply filters and navigate live.
 */
export const VoiceCallAgent: React.FC = () => {
  const [inCall, setInCall] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [turns, setTurns] = useState<CallTurn[]>([]);
  const [partial, setPartial] = useState("");
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const inCallRef = useRef(false);
  const speakingRef = useRef(false);
  const micPausedRef = useRef(false);
  const runningRef = useRef(false);
  const turnsRef = useRef<CallTurn[]>([]);
  const langRef = useRef(lang);
  langRef.current = lang;

  const navigate = useNavigate();
  const { filterProperties } = useProperties();

  const addTurn = (turn: CallTurn) => {
    turnsRef.current = [...turnsRef.current, turn];
    setTurns(turnsRef.current);
  };

  const pickVoiceForLang = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis?.getVoices() || [];
    const prefix = langRef.current === "hi-IN" ? "hi" : "en";
    return (
      voices.find((v) => v.lang.startsWith(prefix)) ||
      voices.find((v) => v.lang.startsWith("en-IN")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  };

  const restartListening = () => {
    const rec = recRef.current;
    if (!rec || !inCallRef.current || speakingRef.current || micPausedRef.current || runningRef.current) return;
    try {
      setStatus("listening");
      runningRef.current = true;
      rec.start();
    } catch {
      // already started — ignore
    }
  };

  const speak = (text: string) => {
    const clean = toSpokenText(text);
    if (!clean || !("speechSynthesis" in window)) {
      restartListening();
      return;
    }
    speakingRef.current = true;
    setStatus("speaking");
    const utter = new SpeechSynthesisUtterance(clean);
    const voice = pickVoiceForLang();
    if (voice) utter.voice = voice;
    utter.lang = langRef.current;
    utter.rate = 1.02;
    const finish = () => {
      speakingRef.current = false;
      // Small gap so the mic doesn't capture the tail of our own voice
      setTimeout(() => restartListening(), 350);
    };
    utter.onend = finish;
    utter.onerror = finish;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const handleUtterance = async (text: string) => {
    addTurn({ id: `${Date.now()}-you`, speaker: "you", text });

    // 1. Property search commands execute directly on the site
    if (isVoiceSearchIntent(text)) {
      const filters = parseVoiceQuery(text);
      setStatus("thinking");
      const summaryBits: string[] = [];
      if (filters.locality) summaryBits.push(`in ${filters.locality}`);
      if (filters.accommodationType) summaryBits.unshift(filters.accommodationType);
      if (filters.maxRent) summaryBits.push(`under ₹${filters.maxRent} a month`);
      const spoken =
        langRef.current === "hi-IN"
          ? `ठीक है, ${summaryBits.length ? summaryBits.join(", ") : "सभी"} फ़िल्टर लगाकर प्रॉपर्टी दिखा रहे हैं।`
          : `Sure! Showing rentals ${summaryBits.length ? summaryBits.join(" ") : "with all listings"} for you.`;
      filterProperties({ ...filters, availableOnly: true });
      addTurn({ id: `${Date.now()}-agent`, speaker: "agent", text: `[Search] ${JSON.stringify(filters)} → /properties` });
      speak(spoken);
      navigate("/properties");
      return;
    }

    // 2. General questions → answer from RentRight site data via dual models
    setStatus("thinking");
    const history: ChatTurn[] = turnsRef.current
      .filter((t) => !t.text.startsWith("[Search]"))
      .slice(-6)
      .map((t) => ({
        role: t.speaker === "you" ? ("user" as const) : ("assistant" as const),
        content: t.text,
      }));

    try {
      const replies = await generateDualChatReplies(text, history);
      // Speak the best available reply; show which model answered
      const primary = replies.find((r) => r.provider !== "Offline") || replies[0];
      addTurn({ id: `${Date.now()}-agent`, speaker: "agent", text: primary.text, provider: primary.provider });
      speak(primary.text);
    } catch (e) {
      const fallback =
        langRef.current === "hi-IN"
          ? "माफ़ कीजिए, अभी जवाब नहीं हो सका। दोबारा कहिए।"
          : "Sorry, I couldn't fetch an answer just now. Please try again.";
      addTurn({ id: `${Date.now()}-agent`, speaker: "agent", text: fallback });
      speak(fallback);
    }
  };

  const startCall = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice calling needs Chrome or Edge (Web Speech API not supported here).");
      return;
    }
    if (!window.isSecureContext && !location.hostname.match(/^localhost$|^127\.|^\[?::1\]?$/)) {
      toast.error(
        "Mic requires a secure context. Open this site via http://localhost:8080 (or HTTPS) — LAN IPs over plain http block microphone access.",
        { duration: 10000 }
      );
      return;
    }
    if (!("speechSynthesis" in window)) {
      toast.error("This browser can't speak replies back. Try Chrome or Edge.");
      return;
    }

    const rec: SpeechRecognitionLike = new SR();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setPartial(transcript);
      if (event.results[0].isFinal) {
        setPartial("");
        runningRef.current = false;
        try { rec.stop(); } catch {}
        handleUtterance(transcript);
      }
    };
    rec.onerror = (e: any) => {
      const code = e?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        // Browser hard-blocks all future starts after one denial, so end the call
        toast.error(voiceErrorHint(code), { duration: 10000 });
        endCall();
      } else if (code === "audio-capture") {
        toast.error(voiceErrorHint(code), { duration: 9000 });
        endCall();
      }
      // "no-speech" / "aborted" are benign — onend restarts the loop
    };
    rec.onend = () => {
      runningRef.current = false;
      if (inCallRef.current && !speakingRef.current && !micPausedRef.current) {
        try {
          setStatus("listening");
          runningRef.current = true;
          rec.start();
        } catch {
          // start() while already starting — safe to ignore
        }
      }
    };

    recRef.current = rec;
    turnsRef.current = [];
    setTurns([]);
    setInCall(true);
    inCallRef.current = true;
    micPausedRef.current = false;
    setStatus("connecting");

    const greeting =
      lang === "hi-IN"
        ? "नमस्ते! मैं RentRight वॉइस असिस्टेंट हूँ। आप बोलिए — मैं साइट के डेटा से जवाब दूँगा।"
        : "Hello! You've reached the RentRight voice assistant. Ask me about PGs, deposits, or say a search like two BHK under 15000 in Koramangala.";
    setTimeout(() => speak(greeting), 250);
  };

  const endCall = () => {
    inCallRef.current = false;
    speakingRef.current = false;
    micPausedRef.current = false;
    setInCall(false);
    setStatus("idle");
    setPartial("");
    try { recRef.current?.abort(); } catch {}
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const toggleMuteMic = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (!micPausedRef.current) {
      micPausedRef.current = true;
      runningRef.current = false;
      try { rec.stop(); } catch {}
      setStatus("ended"); // paused — stays in call but stops capturing
      toast("Mic paused. Tap the mic to resume.");
    } else {
      micPausedRef.current = false;
      restartListening();
    }
  };

  const statusLabel: Record<CallStatus, string> = {
    idle: "",
    connecting: "Connecting…",
    listening: partial ? `Heard: “${partial}”` : "Listening… speak now",
    thinking: "Thinking…",
    speaking: "Agent speaking…",
    ended: "Mic paused — tap mic to resume",
  };

  return (
    <>
      {/* Floating call button (bottom-left, chat stays bottom-right) */}
      {!inCall && (
        <Button
          onClick={startCall}
          className="fixed bottom-5 left-5 h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg z-50 p-0"
          aria-label="Start voice call with RentRight assistant"
          title="Call the RentRight voice agent"
        >
          <Phone className="w-5 h-5" />
        </Button>
      )}

      {/* In-call panel */}
      {inCall && (
        <div className="fixed bottom-5 left-5 w-80 sm:w-96 bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-700 z-50 overflow-hidden animate-fade-in">
          <div className="p-4 flex flex-col items-center gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2 self-start w-full">
              <span className="text-xs font-bold text-emerald-400">RentRight Voice Agent</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="ml-auto h-7 rounded-md border border-slate-700 bg-slate-900 px-1.5 text-[10px] font-semibold"
                title="Call language"
              >
                <option value="en-IN">🇮🇳 English</option>
                <option value="hi-IN">🇮🇳 हिन्दी</option>
              </select>
            </div>

            {/* Pulsing call orb */}
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  status === "speaking"
                    ? "bg-emerald-500"
                    : status === "listening"
                    ? "bg-sky-500"
                    : status === "thinking"
                    ? "bg-violet-500"
                    : "bg-slate-600"
                }`}
              >
                {status === "thinking" ? (
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                ) : status === "speaking" ? (
                  <Volume2 className="w-7 h-7 text-white" />
                ) : (
                  <Phone className="w-7 h-7 text-white" />
                )}
              </div>
              {(status === "listening" || status === "speaking") && (
                <span
                  className={`absolute inset-0 rounded-full animate-ping ${
                    status === "speaking" ? "bg-emerald-400/40" : "bg-sky-400/40"
                  }`}
                />
              )}
            </div>

            <p className="text-xs text-slate-300 min-h-[1rem] text-center">{statusLabel[status]}</p>
          </div>

          {/* Live call transcript */}
          {turns.length > 0 && (
            <div className="max-h-36 overflow-y-auto p-3 space-y-2 text-xs">
              {turns.slice(-6).map((t) => (
                <div key={t.id} className={`flex ${t.speaker === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-2.5 py-1.5 max-w-[85%] ${
                      t.speaker === "you" ? "bg-sky-600/40 text-sky-100" : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {t.provider && t.provider !== "Offline" && (
                      <span className="block text-[9px] font-bold uppercase text-emerald-400 mb-0.5">
                        {t.provider}
                      </span>
                    )}
                    {t.speaker === "agent" && t.text.startsWith("[Search]")
                      ? "Applied your spoken search filters → open the listings page."
                      : t.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="p-3 flex items-center justify-center gap-3 border-t border-slate-800">
            <Button
              size="icon"
              variant={micPausedRef.current ? "outline" : "secondary"}
              onClick={toggleMuteMic}
              className="h-10 w-10 rounded-full"
              title={micPausedRef.current ? "Resume microphone" : "Pause microphone"}
            >
              {micPausedRef.current ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={endCall}
              className="h-11 w-11 rounded-full bg-rose-600 hover:bg-rose-700"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceCallAgent;
