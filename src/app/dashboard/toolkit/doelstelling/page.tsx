"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import VoiceInput from "@/components/VoiceInput";

interface SubGoal { text: string; weekAction: string; done: boolean; }
interface GoalMap { longTerm: string; subGoals: SubGoal[]; }

const EMPTY_MAP: GoalMap = { longTerm: "", subGoals: [{ text: "", weekAction: "", done: false }, { text: "", weekAction: "", done: false }, { text: "", weekAction: "", done: false }] };

export default function DoelstellingPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  const [data, setData] = useState<GoalMap>(EMPTY_MAP);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pilot-goal-map");
    if (stored) setData(JSON.parse(stored));
  }, []);

  const save = (updated: GoalMap) => {
    setData(updated);
    localStorage.setItem("pilot-goal-map", JSON.stringify(updated));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const updateSub = (i: number, field: keyof SubGoal, value: string | boolean) => {
    const subs = [...data.subGoals];
    subs[i] = { ...subs[i], [field]: value };
    save({ ...data, subGoals: subs });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {saved && <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#22c55e]/90 px-4 py-1.5 text-xs font-bold text-black">{nl ? "Opgeslagen" : "Saved"}</div>}

      <h1 className="mb-2 text-2xl font-black text-white">🎯 {nl ? "Doelstelling" : "Goal Setting"}</h1>
      <p className="mb-6 text-sm text-gray-400">
        {nl ? "Effectieve doelstelling combineert uitkomstdoelen met procesbdoelen. Procesbdoelen zijn dagelijks controleerbaar en geven autonomie." : "Effective goal setting combines outcome goals with process goals. Process goals are controllable daily and provide autonomy."}
      </p>

      {/* Langetermijndoel */}
      <section className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <h2 className="mb-2 text-sm font-bold text-[#c9a67a]">{nl ? "Langetermijndoel" : "Long-term goal"}</h2>
        <p className="mb-2 text-xs text-gray-500">{nl ? "Wat wil je bereiken?" : "What do you want to achieve?"}</p>
        <div className="flex gap-2">
          <textarea value={data.longTerm} onChange={e => save({ ...data, longTerm: e.target.value })} rows={2}
            placeholder={nl ? "Beschrijf je grote doel..." : "Describe your big goal..."}
            className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#A67C52]" />
          <VoiceInput onTranscript={t => save({ ...data, longTerm: data.longTerm ? data.longTerm + " " + t : t })} lang={lang} />
        </div>
      </section>

      {/* Tussendoelen */}
      <h2 className="mb-3 text-sm font-bold text-[#c9a67a]">{nl ? "3 tussendoelen (komende maand)" : "3 intermediate goals (next month)"}</h2>
      {data.subGoals.map((sub, i) => (
        <section key={i} className="mb-3 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <div className="mb-2 flex items-center gap-2">
            <button onClick={() => updateSub(i, "done", !sub.done)}
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${sub.done ? "border-[#7a9e7e] bg-[#7a9e7e] text-white" : "border-[#2a3e33]"}`}>
              {sub.done && "✓"}
            </button>
            <span className="text-xs font-bold text-gray-400">{nl ? `Tussendoel ${i + 1}` : `Goal ${i + 1}`}</span>
          </div>
          <div className="mb-2 flex gap-2">
            <input value={sub.text} onChange={e => updateSub(i, "text", e.target.value)}
              placeholder={nl ? "Wat wil je bereiken?" : "What do you want to achieve?"}
              className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none focus:border-[#A67C52]" />
            <VoiceInput onTranscript={t => updateSub(i, "text", sub.text ? sub.text + " " + t : t)} lang={lang} size="sm" />
          </div>
          <div className="flex gap-2">
            <input value={sub.weekAction} onChange={e => updateSub(i, "weekAction", e.target.value)}
              placeholder={nl ? "→ Concrete actie deze week" : "→ Concrete action this week"}
              className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-xs text-white outline-none focus:border-[#7a9e7e]" />
            <VoiceInput onTranscript={t => updateSub(i, "weekAction", sub.weekAction ? sub.weekAction + " " + t : t)} lang={lang} size="sm" />
          </div>
        </section>
      ))}

      <p className="mt-4 text-center text-[10px] text-gray-600">
        {nl ? "Toets: specifiek, uitdagend én in eigen beheer?" : "Check: specific, challenging and in your own control?"}
      </p>
    </div>
  );
}
