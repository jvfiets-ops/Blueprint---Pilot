"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceInput from "@/components/VoiceInput";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

function getContexts(lang: string) {
  const nl = lang === "nl";
  return [
    { key: "wedstrijd", label: nl ? "Wedstrijd" : "Match", icon: "⚽" },
    { key: "presentatie", label: nl ? "Presentatie" : "Presentation", icon: "🎤" },
    { key: "gesprek", label: nl ? "Belangrijk gesprek" : "Important conversation", icon: "💬" },
  ];
}

function getSteps(lang: string) {
  const nl = lang === "nl";
  return [
    { title: nl ? "Context" : "Context", sub: nl ? "Waar bereid je je op voor?" : "What are you preparing for?" },
    { title: nl ? "Visualisatie" : "Visualization", sub: nl ? "Sluit je ogen. Wat zie je als je op je allerbest presteert?" : "Close your eyes. What do you see when you perform at your best?" },
    { title: nl ? "Focuswoorden" : "Focus words", sub: nl ? "Welke 3 woorden beschrijven je flow-staat?" : "Which 3 words describe your flow state?" },
    { title: nl ? "Ademhaling" : "Breathing", sub: nl ? "Welk ademhalingsritme brengt je in focus?" : "Which breathing pattern brings you into focus?" },
    { title: nl ? "Lichaamstaal" : "Body language", sub: nl ? "Hoe sta je? Hoe beweeg je?" : "How do you stand? How do you move?" },
    { title: nl ? "Actie & Mantra" : "Action & Mantra", sub: nl ? "Je eerste 3 acties + persoonlijke mantra" : "Your first 3 actions + personal mantra" },
  ];
}

interface ScriptData {
  context: string;
  visualization: string;
  focusWords: string[];
  breathing: string;
  bodyLanguage: string;
  actionPlan: string;
  mantra: string;
}

const EMPTY: ScriptData = { context: "wedstrijd", visualization: "", focusWords: [], breathing: "", bodyLanguage: "", actionPlan: "", mantra: "" };

export default function MatchScriptPage() {
  const router = useRouter();
  const [lang] = useLang();
  const tt = getT(lang);
  const CONTEXTS = getContexts(lang);
  const STEPS = getSteps(lang);
  const nl = lang === "nl";
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ScriptData>(EMPTY);
  const [wordInput, setWordInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    fetch("/api/match-script").then(r => r.json()).then(d => { if (d) setData(d); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/match-script", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setSaving(false);
    setSaved(true);
  };

  const addWord = () => {
    if (wordInput.trim() && data.focusWords.length < 3) {
      setData({ ...data, focusWords: [...data.focusWords, wordInput.trim()] });
      setWordInput("");
    }
  };

  const set = (key: keyof ScriptData, val: string) => setData({ ...data, [key]: val });
  const hasContent = data.visualization || data.focusWords.length > 0 || data.mantra;

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={() => router.push("/dashboard/toolkit")} className="mb-4 text-sm text-gray-500 hover:text-white">{tt.backToolkit}</button>
      <h1 className="mb-1 text-xl font-bold text-white">📋 {tt.msTitle}</h1>
      <p className="mb-6 text-sm text-gray-400">{tt.msSub}</p>

      {/* Full screen view */}
      {showFullScreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f1a14] p-6">
          <h2 className="mb-6 text-2xl font-bold text-[#c9a67a]">{tt.msYourScript}</h2>
          <div className="w-full max-w-md space-y-4 text-center">
            {data.visualization && <p className="text-sm text-gray-300 italic">&ldquo;{data.visualization}&rdquo;</p>}
            {data.focusWords.length > 0 && (
              <div className="flex justify-center gap-3">
                {data.focusWords.map((w, i) => <span key={i} className="rounded-full bg-[#A67C52]/20 px-4 py-2 text-lg font-bold text-[#c9a67a]">{w}</span>)}
              </div>
            )}
            {data.breathing && <p className="text-sm text-gray-400">🫁 {data.breathing}</p>}
            {data.bodyLanguage && <p className="text-sm text-gray-400">💪 {data.bodyLanguage}</p>}
            {data.mantra && <p className="mt-4 text-xl font-extrabold text-white">&ldquo;{data.mantra}&rdquo;</p>}
          </div>
          <button onClick={() => setShowFullScreen(false)} className="mt-8 rounded-xl border border-[#2a3e33] px-6 py-2.5 text-sm text-gray-400 hover:text-white">{tt.close}</button>
        </div>
      )}

      {/* Progress */}
      <div className="mb-5 flex gap-1">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= i ? "bg-[#A67C52]" : "bg-[#2a3e33]"}`} />
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
        <h2 className="mb-1 text-lg font-bold text-white">{STEPS[step].title}</h2>
        <p className="mb-5 text-sm text-gray-400">{STEPS[step].sub}</p>

        {step === 0 && (
          <div className="grid grid-cols-3 gap-2">
            {CONTEXTS.map(c => (
              <button key={c.key} onClick={() => { set("context", c.key); setStep(1); }}
                className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
                style={{ borderColor: data.context === c.key ? "#A67C52" : "#2a3e33", background: data.context === c.key ? "#A67C52" + "15" : "transparent" }}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs text-gray-300">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="relative">
            <textarea value={data.visualization} onChange={e => set("visualization", e.target.value)} rows={4}
              placeholder={nl ? "Beschrijf zo levendig mogelijk wat je ziet, voelt en hoort..." : "Describe as vividly as possible what you see, feel and hear..."}
              className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
            <div className="absolute right-2 top-2"><VoiceInput size="sm" onTranscript={t => set("visualization", data.visualization ? data.visualization + " " + t : t)} /></div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {data.focusWords.map((w, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-[#A67C52]/20 px-3 py-1.5 text-sm font-semibold text-[#c9a67a]">
                  {w} <button onClick={() => setData({ ...data, focusWords: data.focusWords.filter((_, j) => j !== i) })} className="ml-1 text-xs opacity-50 hover:opacity-100">✕</button>
                </span>
              ))}
            </div>
            {data.focusWords.length < 3 && (
              <div className="flex gap-2">
                <input value={wordInput} onChange={e => setWordInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addWord(); } }}
                  placeholder={nl ? `Woord ${data.focusWords.length + 1} van 3...` : `Word ${data.focusWords.length + 1} of 3...`}
                  className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
                <VoiceInput onTranscript={t => { if (data.focusWords.length < 3) setData({ ...data, focusWords: [...data.focusWords, t.trim()] }); }} />
                <button onClick={addWord} className="rounded-xl bg-[#A67C52] px-4 text-sm font-bold text-white">+</button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {["4-4-4-4 (Box)", "4-7-8 (Rust)", "6-2-6 (Flow)", "Eigen ritme"].map(b => (
                <button key={b} onClick={() => set("breathing", b)}
                  className="rounded-xl border px-3 py-2 text-sm transition-colors"
                  style={{ borderColor: data.breathing === b ? "#A67C52" : "#2a3e33", color: data.breathing === b ? "#c9a67a" : "#9ca3af" }}>
                  {b}
                </button>
              ))}
            </div>
            {data.breathing === "Eigen ritme" && (
              <input value={data.breathing} onChange={e => set("breathing", e.target.value)} placeholder="Beschrijf je eigen ritme..."
                className="w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none" />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="relative">
            <textarea value={data.bodyLanguage} onChange={e => set("bodyLanguage", e.target.value)} rows={3}
              placeholder={nl ? "Schouders naar achteren, borst open, stevige pas..." : "Shoulders back, chest open, firm stride..."}
              className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
            <div className="absolute right-2 top-2"><VoiceInput size="sm" onTranscript={t => set("bodyLanguage", data.bodyLanguage ? data.bodyLanguage + " " + t : t)} /></div>
          </div>
        )}

        {step === 5 && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-400">{tt.msFirstActions}</label>
            <div className="relative mb-4">
              <textarea value={data.actionPlan} onChange={e => set("actionPlan", e.target.value)} rows={3}
                placeholder="1. ...\n2. ...\n3. ..."
                className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
              <div className="absolute right-2 top-2"><VoiceInput size="sm" onTranscript={t => set("actionPlan", data.actionPlan ? data.actionPlan + " " + t : t)} /></div>
            </div>
            <label className="mb-1 block text-xs font-semibold text-gray-400">{tt.msMantra}</label>
            <div className="relative">
              <input value={data.mantra || ""} onChange={e => set("mantra", e.target.value)}
                placeholder={nl ? "Eén zin die jou activeert..." : "One sentence that activates you..."}
                className="w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
              <div className="absolute right-2 top-1.5"><VoiceInput size="sm" onTranscript={t => set("mantra", t)} /></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-5 flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-sm text-gray-400">←</button>}
          {step < 5 && step > 0 && <button onClick={() => setStep(step + 1)} className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white">{tt.msNext}</button>}
          {step === 5 && (
            <button onClick={save} disabled={saving} className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {saving ? tt.saving : saved ? tt.msSaved : tt.msSave}
            </button>
          )}
        </div>
      </div>

      {/* Use script button */}
      {hasContent && (
        <button onClick={() => setShowFullScreen(true)} className="mt-4 w-full rounded-xl border border-[#A67C52]/40 py-3 text-sm font-semibold text-[#c9a67a] hover:bg-[#A67C52]/10">
          📋 {tt.msUseScript}
        </button>
      )}
    </div>
  );
}
