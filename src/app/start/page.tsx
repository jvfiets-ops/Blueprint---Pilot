"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "atleet", icon: "⚽", nl: "Atleet", en: "Athlete" },
  { id: "artiest", icon: "🎭", nl: "Artiest", en: "Artist" },
  { id: "ondernemer", icon: "💼", nl: "Ondernemer", en: "Entrepreneur" },
  { id: "anders", icon: "🌟", nl: "Anders", en: "Other" },
];

export default function StartPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"nl" | "en">("nl");

  useEffect(() => {
    const existing = localStorage.getItem("pilot-category");
    if (existing) router.replace("/dashboard");
    const savedLang = localStorage.getItem("blauwdruk-lang");
    if (savedLang === "en") setLang("en");
  }, [router]);

  const t = {
    nl: {
      title: "Blauwdruk voor High Performance",
      subtitle: "Welkom",
      question: "Wat beschrijft jou het best?",
      hint: "Dit helpt ons de app te personaliseren voor jouw context.",
      langSwitch: "English",
    },
    en: {
      title: "Blueprint for High Performance",
      subtitle: "Welcome",
      question: "What describes you best?",
      hint: "This helps us personalize the app for your context.",
      langSwitch: "Nederlands",
    },
  }[lang];

  const selectCategory = (id: string) => {
    localStorage.setItem("pilot-category", id);
    localStorage.setItem("blauwdruk-lang", lang);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1a14] px-4">
      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "nl" ? "en" : "nl")}
        className="fixed right-4 top-4 rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-1.5 text-xs text-[#c9a67a] transition-colors hover:bg-[#1a3028]"
      >
        {t.langSwitch}
      </button>

      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <h1 className="mb-1 text-3xl font-black italic" style={{ color: "#c9a67a" }}>
          Blueprint
        </h1>
        <p className="mb-10 text-sm text-[#7a9e7e]">{t.title}</p>

        {/* Question */}
        <h2 className="mb-2 text-xl font-bold text-white">{t.question}</h2>
        <p className="mb-8 text-xs text-gray-500">{t.hint}</p>

        {/* Category cards */}
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6 transition-all hover:border-[#c9a67a] hover:bg-[#1e3428] active:scale-95"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-semibold text-white">
                {lang === "nl" ? cat.nl : cat.en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
