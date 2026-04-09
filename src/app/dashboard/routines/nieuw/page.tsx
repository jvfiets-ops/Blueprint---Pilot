"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";

const CATEGORIEN = ["SLAAP", "VOEDING", "BEWEGING", "MENTAAL", "SOCIAAL", "HERSTEL", "VOORBEREIDING", "ANDERS"];
const TIJDSTIPPEN = ["OCHTEND", "MIDDAG", "AVOND", "NACHT", "FLEXIBEL"];

const QUICK_ADD = [
  { naam: "Kwaliteitsslaap (22:30–06:30)", categorie: "SLAAP", tijdstip: "NACHT", isHelpend: true },
  { naam: "Ochtendactivatie", categorie: "BEWEGING", tijdstip: "OCHTEND", isHelpend: true },
  { naam: "Visualisatie voor training", categorie: "MENTAAL", tijdstip: "OCHTEND", isHelpend: true },
  { naam: "Avondreflectie", categorie: "MENTAAL", tijdstip: "AVOND", isHelpend: true },
  { naam: "Schermvrij uur voor bed", categorie: "HERSTEL", tijdstip: "AVOND", isHelpend: true },
  { naam: "Herstelprotocol na training", categorie: "HERSTEL", tijdstip: "MIDDAG", isHelpend: true },
];

export default function NieuweRoutinePage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [categorie, setCategorie] = useState("ANDERS");
  const [tijdstip, setTijdstip] = useState("FLEXIBEL");
  const [isHelpend, setIsHelpend] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!naam.trim()) return;
    setSaving(true);
    await fetch("/api/routines", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, categorie, tijdstip, isHelpend }),
    });
    router.push("/dashboard/routines");
  };

  const quickAdd = (q: typeof QUICK_ADD[0]) => {
    setNaam(q.naam); setCategorie(q.categorie); setTijdstip(q.tijdstip); setIsHelpend(q.isHelpend);
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-black text-white">+ {nl ? "Nieuwe routine" : "New routine"}</h1>

      {/* Quick add */}
      <div className="mb-4">
        <p className="mb-2 text-xs text-gray-500">{nl ? "Snel toevoegen:" : "Quick add:"}</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ADD.map(q => (
            <button key={q.naam} onClick={() => quickAdd(q)}
              className="rounded-full border border-[#2a3e33] px-2.5 py-1 text-[10px] text-gray-400 hover:border-[#A67C52] hover:text-[#c9a67a]">
              {q.naam}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <input value={naam} onChange={e => setNaam(e.target.value)} placeholder={nl ? "Naam van de routine" : "Routine name"}
        className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#A67C52]" />

      <label className="mb-1.5 block text-xs text-gray-400">{nl ? "Categorie" : "Category"}</label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATEGORIEN.map(c => (
          <button key={c} onClick={() => setCategorie(c)}
            className="rounded-full border px-2.5 py-1 text-[10px]" style={{ borderColor: categorie === c ? "#A67C52" : "#2a3e33", color: categorie === c ? "#c9a67a" : "#888" }}>
            {c}
          </button>
        ))}
      </div>

      <label className="mb-1.5 block text-xs text-gray-400">{nl ? "Tijdstip" : "Time of day"}</label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TIJDSTIPPEN.map(t => (
          <button key={t} onClick={() => setTijdstip(t)}
            className="rounded-full border px-2.5 py-1 text-[10px]" style={{ borderColor: tijdstip === t ? "#A67C52" : "#2a3e33", color: tijdstip === t ? "#c9a67a" : "#888" }}>
            {t}
          </button>
        ))}
      </div>

      <label className="mb-1.5 block text-xs text-gray-400">{nl ? "Helpt dit je presteren?" : "Does this help you perform?"}</label>
      <div className="mb-5 flex gap-2">
        {[{ v: true, l: nl ? "Helpend" : "Helpful", c: "#7a9e7e" }, { v: false, l: nl ? "Belemmerend" : "Hindering", c: "#E85D4A" }, { v: null as boolean | null, l: nl ? "Weet niet" : "Unknown", c: "#888" }].map(o => (
          <button key={String(o.v)} onClick={() => setIsHelpend(o.v)}
            className="flex-1 rounded-xl border py-2 text-xs font-medium" style={{ borderColor: isHelpend === o.v ? o.c : "#2a3e33", color: isHelpend === o.v ? o.c : "#888" }}>
            {o.l}
          </button>
        ))}
      </div>

      <button onClick={save} disabled={!naam.trim() || saving} className="w-full rounded-xl bg-[#A67C52] py-3 text-sm font-bold text-white disabled:opacity-30">
        {saving ? "..." : (nl ? "Routine opslaan" : "Save routine")}
      </button>
    </div>
  );
}
