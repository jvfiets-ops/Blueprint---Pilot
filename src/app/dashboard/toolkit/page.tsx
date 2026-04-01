"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ToolSection {
  title: string;
  desc: string;
  tools: { href: string; icon: string; title: string; desc: string; color: string; checkKey?: string }[];
}

const SECTIONS: ToolSection[] = [
  {
    title: "🔥 Prestatierituelen",
    desc: "Mentale voorbereiding op belangrijke momenten",
    tools: [
      { href: "/dashboard/toolkit/match-script", icon: "📋", title: "Match Script", desc: "Stapsgewijze mentale voorbereiding op een wedstrijd of presentatie", color: "#A67C52", checkKey: "match-script" },
      { href: "/dashboard/toolkit/game-face", icon: "🔥", title: "Game Face", desc: "Codewoorden die je mentale staat activeren als flashcard", color: "#ef4444", checkKey: "game-face" },
    ],
  },
  {
    title: "🧬 Zelfinzicht",
    desc: "Leer jezelf kennen en definieer je ideale prestatieprofiel",
    tools: [
      { href: "/dashboard/toolkit/persoonlijkheid", icon: "🧬", title: "Persoonlijkheid", desc: "Ontdek je Big 5 profiel — kwaliteiten en valkuilen", color: "#A67C52", checkKey: "persoonlijkheid" },
      { href: "/dashboard/toolkit/beste-versie", icon: "⭐", title: "Beste versie", desc: "Definieer je ideale prestatieprofiel per context", color: "#c9a67a", checkKey: "beste-versie" },
      { href: "/dashboard/toolkit/rolmodellen", icon: "🌟", title: "Rolmodellen", desc: "Wie inspireert jou en welke kwaliteiten wil je overnemen?", color: "#6b8f71", checkKey: "rolmodellen" },
      { href: "/dashboard/toolkit/mentoren", icon: "🧭", title: "Mentoren", desc: "Wie begeleidt je en wat leer je van hen?", color: "#8b6f47", checkKey: "mentoren" },
    ],
  },
  {
    title: "📈 Groei & Progressie",
    desc: "Volg je voortgang en herken patronen",
    tools: [
      { href: "/dashboard/toolkit/weekreview", icon: "📅", title: "Weekreview", desc: "Interactieve wekelijkse terugblik op patronen en voortgang", color: "#3b82f6", checkKey: "weekreview" },
      { href: "/dashboard/toolkit/ergodisch", icon: "🔄", title: "Ergodisch denken", desc: "Vergelijk je 24-uur en 10-jaar perspectief bij dilemma's", color: "#7a9e7e", checkKey: "ergodisch" },
      { href: "/dashboard/toolkit/intenties", icon: "🎯", title: "Intenties", desc: "Stel bewuste intenties en koppel terug na afloop", color: "#f59e0b", checkKey: "intenties" },
    ],
  },
  {
    title: "⚡ Omgeving & Energie",
    desc: "Beheer je omgeving en energiebalans",
    tools: [
      { href: "/dashboard/toolkit/omgeving", icon: "🏠", title: "Omgeving", desc: "Wie geeft energie en wie kost energie?", color: "#7a9e7e", checkKey: "omgeving" },
      { href: "/dashboard/toolkit/energie-audit", icon: "⚡", title: "Energieaudit", desc: "Welke activiteiten geven of kosten je energie?", color: "#22c55e", checkKey: "energie-audit" },
    ],
  },
];

export default function ToolkitPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/match-script").then(r => r.json()).then(d => !!d?.visualization).catch(() => false),
      fetch("/api/game-face").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/personality").then(r => r.json()).then(d => d?.openness !== undefined).catch(() => false),
      fetch("/api/performance-profiles").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/role-models").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/mentors").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/week-review").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/ergodic").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/intentions").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/environment-persons").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
      fetch("/api/energy-audit").then(r => r.json()).then(d => Array.isArray(d) && d.length > 0).catch(() => false),
    ]).then(([ms, gf, pers, best, role, ment, wr, ergo, intent, env, ea]) => {
      setCompleted({
        "match-script": ms, "game-face": gf, persoonlijkheid: pers, "beste-versie": best,
        rolmodellen: role, mentoren: ment, weekreview: wr, ergodisch: ergo, intenties: intent,
        omgeving: env, "energie-audit": ea,
      });
    }).catch(() => {});
  }, []);

  const totalTools = SECTIONS.flatMap(s => s.tools).length;
  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black text-white">🧠 Toolkit</h1>
      <p className="mb-1 text-sm text-gray-400">Tools voor zelfinzicht, voorbereiding en groei</p>
      <p className="mb-6 text-xs text-gray-600">{completedCount}/{totalTools} ingevuld — bekijk en update regelmatig</p>

      {SECTIONS.map(section => (
        <div key={section.title} className="mb-6">
          <h2 className="mb-1 text-sm font-bold text-[#c9a67a]">{section.title}</h2>
          <p className="mb-3 text-[11px] text-gray-600">{section.desc}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.tools.map(tool => {
              const done = tool.checkKey ? completed[tool.checkKey] : false;
              return (
                <Link key={tool.href} href={tool.href}
                  className="group relative rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4 transition-all hover:border-[#A67C52]/50">
                  {done && <span className="absolute right-3 top-3 text-[10px] text-[#22c55e]">✓</span>}
                  <span className="text-xl">{tool.icon}</span>
                  <h3 className="mt-1.5 text-sm font-bold text-white group-hover:text-[#c9a67a]">{tool.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
