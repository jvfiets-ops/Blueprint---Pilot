"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";

interface Rolmodel { id: string; naam: string; kwaliteit: string; leerpunt: string; domein: string; relatie: string; }

const DOMEIN_LABELS: Record<string, { nl: string; en: string }> = {
  SPORT: { nl: "Sport", en: "Sports" }, KUNST_MUZIEK: { nl: "Kunst & muziek", en: "Arts & music" },
  BUSINESS: { nl: "Business", en: "Business" }, WETENSCHAP: { nl: "Wetenschap", en: "Science" },
  PERSOONLIJK_LEVEN: { nl: "Persoonlijk", en: "Personal" }, ANDERS: { nl: "Anders", en: "Other" },
};

export default function MentorschapPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  const [models, setModels] = useState<Rolmodel[]>([]);

  useEffect(() => {
    fetch("/api/rolmodellen").then(r => r.json()).then(d => { if (Array.isArray(d)) setModels(d); }).catch(() => {});
  }, []);

  const deleteModel = async (id: string) => {
    await fetch("/api/rolmodellen", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setModels(models.filter(m => m.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-black text-white">👥 {nl ? "Mentorschap" : "Mentorship"}</h1>
      <p className="mb-6 text-sm text-gray-400">
        {nl ? "Toppresteerders leren bewust van anderen. Wie inspireert jou — en wat kun je van hen meenemen naar jouw eigen prestaties?" : "Top performers learn consciously from others. Who inspires you — and what can you take from them to your own performance?"}
      </p>

      <Link href="/dashboard/toolkit/mentorschap/nieuw"
        className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#5C6BC0]/40 bg-[#5C6BC0]/5 p-4 text-sm font-bold text-[#5C6BC0] hover:bg-[#5C6BC0]/10">
        + {nl ? "Rolmodel toevoegen" : "Add role model"}
      </Link>

      {models.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] p-6 text-center">
          <p className="text-sm text-gray-500">{nl ? "Nog geen rolmodellen. Denk aan iemand die je bewondert." : "No role models yet. Think of someone you admire."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map(m => (
            <div key={m.id} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{m.naam}</h3>
                  <div className="mt-1 flex gap-1.5">
                    <span className="rounded-full bg-[#5C6BC0]/20 px-2 py-0.5 text-[9px] text-[#5C6BC0]">{DOMEIN_LABELS[m.domein]?.[nl ? "nl" : "en"] || m.domein}</span>
                  </div>
                </div>
                <button onClick={() => deleteModel(m.id)} className="text-[10px] text-gray-600 hover:text-red-400">✕</button>
              </div>
              <div className="mb-2 rounded-lg bg-[#5C6BC0]/10 px-2.5 py-1.5">
                <p className="text-xs font-medium text-[#7986CB]">{m.kwaliteit}</p>
              </div>
              <p className="text-xs text-gray-400">{m.leerpunt.slice(0, 120)}{m.leerpunt.length > 120 ? "..." : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
