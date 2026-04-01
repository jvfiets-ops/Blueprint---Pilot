"use client";
import { useState, useRef } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  lang?: string;
  size?: string;
  className?: string;
}

export default function VoiceInput({ onTranscript, lang = "nl", size, className = "" }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang === "en" ? "en-US" : "nl-NL";
    r.continuous = false;
    r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => { onTranscript(e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <button type="button" onClick={toggle}
      className={`flex flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
        size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-base"
      } ${
        listening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-[#1a2e23] text-gray-400 hover:text-white"
      } ${className}`}
      title={listening ? "Stop opname" : "Start spraakopname"}>🎙</button>
  );
}
