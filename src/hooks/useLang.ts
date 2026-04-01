"use client";
import { useState, useEffect, useCallback } from "react";
import type { Lang } from "@/lib/i18n";

const KEY = "blauwdruk-lang";

function readLang(): Lang {
  if (typeof window === "undefined") return "nl";
  return (localStorage.getItem(KEY) as Lang) || "nl";
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    setLangState(readLang());
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(KEY, l);
    setLangState(l);
    document.documentElement.lang = l;
    // Dispatch storage event so other components pick it up
    window.dispatchEvent(new Event("lang-change"));
  }, []);

  useEffect(() => {
    const handler = () => setLangState(readLang());
    window.addEventListener("lang-change", handler);
    return () => window.removeEventListener("lang-change", handler);
  }, []);

  return [lang, setLang];
}
