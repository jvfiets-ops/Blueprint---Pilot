"use client";
import { useSyncExternalStore, useCallback } from "react";
import type { Lang } from "@/lib/i18n";

const KEY = "blauwdruk-lang";
const listeners = new Set<() => void>();

function getLang(): Lang {
  if (typeof window === "undefined") return "nl";
  return (localStorage.getItem(KEY) as Lang) || "nl";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach(cb => cb());
}

export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, getLang, () => "nl" as Lang);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    notify();
  }, []);

  return [lang, setLang];
}
