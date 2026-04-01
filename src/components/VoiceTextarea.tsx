"use client";
import { useState, useRef } from "react";

interface VoiceTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function VoiceTextarea({ value, onChange, placeholder, rows = 3, className = "" }: VoiceTextareaProps) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggle = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "nl-NL"; r.continuous = false; r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => { onChange(value + (value ? " " : "") + e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r; r.start(); setListening(true);
  };

  return (
    <div className="relative">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={`w-full resize-y rounded-xl border border-[#2a3e33] bg-[#152620] px-3.5 py-3 pr-12 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52] ${className}`} />
      <button type="button" onClick={toggle}
        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
          listening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-[#1a2e23] text-gray-400 hover:text-white"
        }`} title={listening ? "Stop" : "Spraak"}>🎙</button>
    </div>
  );
}
