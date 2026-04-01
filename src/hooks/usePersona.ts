"use client";
import { useState, useEffect } from "react";
import { useLang } from "./useLang";
import { getPersona, type Category, type PersonaTerms } from "@/lib/persona";

const KEY = "blauwdruk-category";

export function usePersona(): { persona: PersonaTerms; setCategory: (c: Category) => void; category: Category } {
  const [lang] = useLang();
  const [category, setCategoryState] = useState<Category>("");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Category;
    if (stored) setCategoryState(stored);

    // Also try to load from server
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d?.category) {
        setCategoryState(d.category);
        localStorage.setItem(KEY, d.category);
      }
    }).catch(() => {});
  }, []);

  const setCategory = (c: Category) => {
    setCategoryState(c);
    localStorage.setItem(KEY, c);
    // Persist to server
    fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: c }),
    }).catch(() => {});
  };

  const simpleLang = lang === "en" ? "en" : "nl";
  const persona = getPersona(category, simpleLang);

  return { persona, setCategory, category };
}
