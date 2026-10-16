import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

interface Props {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * VoiceSearchBar: Uses browser's Web Speech API to support Hindi (hi-IN)
 * and English (en-IN) voice commands. Falls back to a tooltip message
 * if the browser does not support it.
 */
export const VoiceSearchBar: React.FC<Props> = ({ onTranscript, placeholder, className }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [lang, setLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [partial, setPartial] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec: SpeechRecognitionLike = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setPartial(transcript);
      if (event.results[0].isFinal) {
        onTranscript(transcript);
        setPartial("");
        setListening(false);
      }
    };
    rec.onerror = (e: any) => {
      toast.error(`Voice error: ${e.error || "unknown"}`);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, [lang, onTranscript]);

  const toggle = () => {
    if (!supported) {
      toast.error("Voice search not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.lang = lang;
        rec.start();
        setListening(true);
        setPartial("");
      } catch (e: any) {
        toast.error("Could not start microphone: " + (e?.message || ""));
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={listening ? partial : ""}
          readOnly
          placeholder={placeholder || "Tap mic and say: 2 BHK under 15000 Koramangala"}
          className={`w-full h-10 rounded-md border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${listening ? "border-rose-400 animate-pulse" : "border-slate-300"}`}
        />
        {listening && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-600 uppercase animate-pulse flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Listening…
          </span>
        )}
      </div>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold"
        title="Voice language"
      >
        <option value="en-IN">🇮🇳 English</option>
        <option value="hi-IN">🇮🇳 हिन्दी</option>
      </select>

      <Button
        type="button"
        onClick={toggle}
        size="icon"
        variant={listening ? "destructive" : "default"}
        className="h-10 w-10 shrink-0"
        title={listening ? "Stop listening" : "Start voice search"}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default VoiceSearchBar;
