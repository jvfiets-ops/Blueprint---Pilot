"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import VoiceInput from "@/components/VoiceInput";

const DOMEINEN = [
  { id: "SPORT", nl: "Sport", en: "Sports" }, { id: "KUNST_MUZIEK", nl: "Kunst & muziek", en: "Arts & music" },
  { id: "BUSINESS", nl: "Business", en: "Business" }, { id: "WETENSCHAP", nl: "Wetenschap", en: "Science" },
  { id: "PERSOONLIJK_LEVEN", nl: "Persoonlijk", en: "Personal" }, { id: "ANDERS", nl: "Anders", en: "Other" },
];
const RELATIES = [
  { id: "PUBLIEK_FIGUUR", nl: "Publiek figuur", en: "Public figure" }, { id: "COACH_TRAINER", nl: "Coach of trainer", en: "Coach or trainer" },
  { id: "TEAMGENOOT", nl: "Teamgenoot", en: "Teammate" }, { id: "FAMILIE_VRIEND", nl: "Familie of vriend", en: "Family or friend" },
  { id: "HISTORISCH_FIGUUR", nl: "Historisch figuur", en: "Historical figure" }, { id: "ANDERS", nl: "Anders", en: "Other" },
];

export default function NieuwRolmodelPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [naam, setNaam] = useState("");
  const [domein, setDomein] = useState("");
  const [relatie, setRelatie] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [kwaliteit, setKwaliteit] = useState("");
  const [leerpunt, setLeerpunt] = useState("");
  const [toepassing, setToepassing] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch("/api/rolmodellen", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, domein, relatie, omschrijving, kwaliteit, leerpunt, toepassing }),
    });
    router.push("/dashboard/toolkit/mentorschap");
  };

  return (
    <div className="mx-auto max-w-lg">
      <p className="mb-1 text-[10px] text-gray-500">{nl ? `Stap ${step}/3` : `Step ${step}/3`}</p>

      {step === 1 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-white">{nl ? "Wie is dit?" : "Who is this?"}</h2>
          <input value={naam} onChange={e => setNaam(e.target.value)} maxLength={60} placeholder={nl ? "Naam" : "Name"}
            className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#5C6BC0]" />
          <label className="mb-2 block text-xs text-gray-400">{nl ? "Domein" : "Domain"}</label>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {DOMEINEN.map(d => (
              <button key={d.id} onClick={() => setDomein(d.id)}
                className="rounded-full border px-2.5 py-1 text-[10px]" style={{ borderColor: domein === d.id ? "#5C6BC0" : "#2a3e33", color: domein === d.id ? "#7986CB" : "#888" }}>
                {nl ? d.nl : d.en}
              </button>
            ))}
          </div>
          <label className="mb-2 block text-xs text-gray-400">{nl ? "Relatie" : "Relationship"}</label>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {RELATIES.map(r => (
              <button key={r.id} onClick={() => setRelatie(r.id)}
                className="rounded-full border px-2.5 py-1 text-[10px]" style={{ borderColor: relatie === r.id ? "#5C6BC0" : "#2a3e33", color: relatie === r.id ? "#7986CB" : "#888" }}>
                {nl ? r.nl : r.en}
              </button>
            ))}
          </div>
          <div className="mb-4 flex gap-2">
            <textarea value={omschrijving} onChange={e => setOmschrijving(e.target.value)} rows={2}
              placeholder={nl ? "Beschrijving (optioneel)" : "Description (optional)"}
              className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none focus:border-[#5C6BC0]" />
            <VoiceInput onTranscript={t => setOmschrijving(prev => prev ? prev + " " + t : t)} lang={lang} />
          </div>
          <button onClick={() => setStep(2)} disabled={!naam.trim() || !domein} className="w-full rounded-xl bg-[#5C6BC0] py-2.5 text-sm font-bold text-white disabled:opacity-30">{nl ? "Volgende →" : "Next →"}</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-white">{nl ? "Wat bewonder je?" : "What do you admire?"}</h2>
          <label className="mb-1 block text-xs text-gray-400">{nl ? "Welke specifieke kwaliteit bewonder je?" : "Which specific quality do you admire?"}</label>
          <div className="mb-3 flex gap-2">
            <input value={kwaliteit} onChange={e => setKwaliteit(e.target.value)} maxLength={100}
              className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#5C6BC0]" />
            <VoiceInput onTranscript={t => setKwaliteit(prev => prev ? prev + " " + t : t)} lang={lang} />
          </div>
          <label className="mb-1 block text-xs text-gray-400">{nl ? "Wat kun je van hen leren?" : "What can you learn from them?"}</label>
          <div className="mb-4 flex gap-2">
            <textarea value={leerpunt} onChange={e => setLeerpunt(e.target.value)} rows={3}
              className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none focus:border-[#5C6BC0]" />
            <VoiceInput onTranscript={t => setLeerpunt(prev => prev ? prev + " " + t : t)} lang={lang} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-xs text-gray-400">{nl ? "← Terug" : "← Back"}</button>
            <button onClick={() => setStep(3)} disabled={!kwaliteit.trim() || !leerpunt.trim()} className="flex-1 rounded-xl bg-[#5C6BC0] py-2.5 text-sm font-bold text-white disabled:opacity-30">{nl ? "Volgende →" : "Next →"}</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-white">{nl ? "Hoe benut je dit?" : "How do you use this?"}</h2>
          <label className="mb-1 block text-xs text-gray-400">{nl ? "Hoe ga je dit toepassen op jouw prestaties?" : "How will you apply this to your performance?"}</label>
          <div className="mb-4 flex gap-2">
            <textarea value={toepassing} onChange={e => setToepassing(e.target.value)} rows={3}
              placeholder={nl ? 'Bijv. "Wanneer ik twijfel, vraag ik me af: wat zou [naam] doen?"' : 'E.g. "When I doubt, I ask myself: what would [name] do?"'}
              className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none focus:border-[#5C6BC0]" />
            <VoiceInput onTranscript={t => setToepassing(prev => prev ? prev + " " + t : t)} lang={lang} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-xs text-gray-400">{nl ? "← Terug" : "← Back"}</button>
            <button onClick={save} disabled={saving} className="flex-1 rounded-xl bg-[#5C6BC0] py-2.5 text-sm font-bold text-white disabled:opacity-30">{saving ? "..." : (nl ? "Opslaan" : "Save")}</button>
          </div>
        </>
      )}
    </div>
  );
}
