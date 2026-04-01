"use client";
import { useState, useRef, useCallback } from "react";

interface ReadAloudProps {
  text: string;
  lang?: string;
  className?: string;
  size?: "sm" | "md";
}

const LANG_MAP: Record<string, string> = {
  nl: "nl-NL",
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-PT",
};

export default function ReadAloud({ text, lang = "nl", className = "", size = "md" }: ReadAloudProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggle = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!text.trim() || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang] || "nl-NL";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [text, lang, speaking]);

  if (typeof window !== "undefined" && !window.speechSynthesis) {
    return null;
  }

  const sizeClasses = size === "sm"
    ? "h-6 w-6 text-[10px]"
    : "h-7 w-7 text-xs";

  return (
    <button
      type="button"
      onClick={toggle}
      title={speaking ? "Stop voorlezen" : "Lees voor"}
      className={`flex-shrink-0 flex items-center justify-center rounded-md transition-all ${sizeClasses} ${
        speaking
          ? "bg-[#A67C52]/20 text-[#c9a67a] animate-pulse"
          : "text-gray-600 hover:text-[#c9a67a] hover:bg-[#1a2e23]/50"
      } ${className}`}
    >
      {speaking ? "⏹" : "🔊"}
    </button>
  );
}
