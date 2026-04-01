"use client";
import { useState, useEffect } from "react";

interface Dilemma {
  id: string;
  dilemma: string;
  optionA: string;
  optionB: string;
  choice24h: string;
  reason24h: string;
  choice10y: string;
  reason10y: string;
  aligned: boolean;
  reflection: string;
  chosenOption: string | null;
  category: string;
  createdAt: string;
}

const CATEGORIES = [
  { key: "carriere", label: "Carrière", icon: "💼" },
  { key: "relaties", label: "Relaties", icon: "❤️" },
  { key: "gezondheid", label: "Gezondheid", icon: "🏃" },
  { key: "financieel", label: "Financieel", icon: "💶" },
  { key: "persoonlijk", label: "Persoonlijk", icon: "🧠" },
  { key: "algemeen", label: "Algemeen", icon: "🎯" },
];

type Step = "intro" | "dilemma" | "perspectives" | "insight" | "history";

export default function ErgodischPage() {
  const [step, setStep] = useState<Step>("intro");
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [dilemmaText, setDilemmaText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [category, setCategory] = useState("algemeen");
  const [choice24h, setChoice24h] = useState<"a" | "b" | "">("");
  const [reason24h, setReason24h] = useState("");
  const [choice10y, setChoice10y] = useState<"a" | "b" | "">("");
  const [reason10y, setReason10y] = useState("");
  const [reflection, setReflection] = useState("");
  const [chosenOption, setChosenOption] = useState<"a" | "b" | "">("");

  useEffect(() => {
    fetch("/api/ergodic").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setDilemmas(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const aligned = choice24h && choice10y && choice24h === choice10y;
  const misaligned = choice24h && choice10y && choice24h !== choice10y;

  const saveDilemma = async () => {
    if (!dilemmaText.trim() || !optionA.trim() || !optionB.trim() || !choice24h || !choice10y) return;
    setSaving(true);
    const res = await fetch("/api/ergodic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dilemma: dilemmaText, optionA, optionB, choice24h, reason24h, choice10y, reason10y, reflection, chosenOption: chosenOption || null, category }),
    });
    const saved = await res.json();
    if (saved.id) setDilemmas([saved, ...dilemmas]);
    setSaving(false);
    reset();
    setStep("history");
  };

  const reset = () => {
    setDilemmaText(""); setOptionA(""); setOptionB(""); setCategory("algemeen");
    setChoice24h(""); setReason24h(""); setChoice10y(""); setReason10y("");
    setReflection(""); setChosenOption("");
  };

  const alignedCount = dilemmas.filter((d) => d.aligned).length;
  const misalignedCount = dilemmas.filter((d) => !d.aligned).length;

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;

  // ══════ INTRO ══════
  if (step === "intro") {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-xl font-black text-white">🔄 Ergodisch denken</h1>
        <p className="mb-5 text-xs text-gray-500">Neem betere beslissingen door twee tijdshorizonten te vergelijken</p>

        <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <h3 className="mb-3 text-sm font-bold text-[#c9a67a]">Wat is ergodisch denken?</h3>
          <p className="mb-3 text-xs leading-relaxed text-gray-300">
            In de wiskunde beschrijft <span className="text-white font-semibold">ergodiciteit</span> of het gemiddelde over tijd hetzelfde is als het gemiddelde over een groep. In het dagelijks leven betekent dit: <span className="text-white font-semibold">wat goed voelt op korte termijn is niet altijd wat goed is op lange termijn</span>.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-gray-300">
            De meeste slechte beslissingen komen voort uit het verwarren van deze twee perspectieven. Je 24-uur-versie wil comfort, bevestiging en zekerheid. Je 10-jaar-versie wil groei, betekenis en vrijheid.
          </p>
          <p className="text-xs leading-relaxed text-gray-300">
            Door bij elk dilemma bewust <span className="text-white font-semibold">beide versies van jezelf</span> te raadplegen, ontdek je waar je op automatische piloot handelt en waar je een bewustere keuze kunt maken.
          </p>
        </div>

        <div className="mb-5 rounded-2xl border border-[#A67C52]/30 bg-[#A67C52]/5 p-5">
          <h3 className="mb-2 text-sm font-bold text-[#c9a67a]">Hoe werkt het?</h3>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex gap-2"><span className="text-[#c9a67a]">1.</span> Beschrijf een dilemma met twee keuzes</div>
            <div className="flex gap-2"><span className="text-[#c9a67a]">2.</span> Kies: waar zou je <b className="text-white">24-uur-versie</b> blij mee zijn?</div>
            <div className="flex gap-2"><span className="text-[#c9a67a]">3.</span> Kies: waar zou je <b className="text-white">10-jaar-versie</b> blij mee zijn?</div>
            <div className="flex gap-2"><span className="text-[#c9a67a]">4.</span> Ontdek de spanning — en maak een bewuste keuze</div>
          </div>
        </div>

        {dilemmas.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-3 text-center">
              <div className="text-lg font-bold text-[#22c55e]">{alignedCount}</div>
              <div className="text-[9px] text-gray-500">Aligned keuzes</div>
            </div>
            <div className="rounded-xl border border-[#E85D4A]/30 bg-[#E85D4A]/5 p-3 text-center">
              <div className="text-lg font-bold text-[#E85D4A]">{misalignedCount}</div>
              <div className="text-[9px] text-gray-500">Spanning ontdekt</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setStep("dilemma")}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
            Nieuw dilemma →
          </button>
          {dilemmas.length > 0 && (
            <button onClick={() => setStep("history")}
              className="rounded-xl border border-[#2a3e33] px-4 py-3 text-xs text-gray-400 hover:text-white">
              Geschiedenis
            </button>
          )}
        </div>
      </div>
    );
  }

  // ══════ DILEMMA INPUT ══════
  if (step === "dilemma") {
    return (
      <div className="mx-auto max-w-lg">
        <button onClick={() => setStep("intro")} className="mb-4 text-sm text-gray-500 hover:text-white">← Terug</button>
        <h2 className="mb-1 text-lg font-bold text-white">Beschrijf je dilemma</h2>
        <p className="mb-5 text-xs text-gray-500">Een keuze waar je mee worstelt — groot of klein.</p>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">Categorie</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className="rounded-full border px-2.5 py-1 text-xs"
                style={{ borderColor: category === c.key ? "#A67C52" : "#2a3e33", color: category === c.key ? "#c9a67a" : "#888" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">Het dilemma</label>
          <textarea value={dilemmaText} onChange={(e) => setDilemmaText(e.target.value)} rows={2}
            placeholder="Bijv: Ik overweeg om van baan te wisselen naar een onzekere startup..."
            className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none focus:border-[#A67C52]" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">Keuze A</label>
            <textarea value={optionA} onChange={(e) => setOptionA(e.target.value)} rows={2}
              placeholder="Bijv: Blijven bij huidige werkgever"
              className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-500">Keuze B</label>
            <textarea value={optionB} onChange={(e) => setOptionB(e.target.value)} rows={2}
              placeholder="Bijv: Overstappen naar de startup"
              className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none" />
          </div>
        </div>

        <button onClick={() => setStep("perspectives")}
          disabled={!dilemmaText.trim() || !optionA.trim() || !optionB.trim()}
          className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
          Verder →
        </button>
      </div>
    );
  }

  // ══════ TWO PERSPECTIVES ══════
  if (step === "perspectives") {
    return (
      <div className="mx-auto max-w-lg">
        <button onClick={() => setStep("dilemma")} className="mb-4 text-sm text-gray-500 hover:text-white">← Terug</button>

        <div className="mb-5 rounded-xl border border-[#2a3e33] bg-[#152620] p-3">
          <p className="text-xs text-gray-400">{dilemmaText}</p>
        </div>

        {/* 24h perspective */}
        <div className="mb-5 rounded-2xl border border-[#c9a67a]/30 bg-[#c9a67a]/5 p-5">
          <h3 className="mb-1 text-sm font-bold text-[#c9a67a]">⏰ Jouw versie over 24 uur</h3>
          <p className="mb-3 text-[10px] text-gray-500">Wat zou je morgen het fijnst vinden? Denk vanuit comfort, gemak en direct resultaat.</p>

          <div className="mb-3 flex gap-2">
            <button onClick={() => setChoice24h("a")}
              className="flex-1 rounded-xl border p-3 text-left text-xs"
              style={{ borderColor: choice24h === "a" ? "#c9a67a" : "#2a3e33", color: choice24h === "a" ? "#c9a67a" : "#aaa", background: choice24h === "a" ? "rgba(201,166,122,0.1)" : "#152620" }}>
              <span className="mb-1 block text-[9px] font-bold uppercase">A</span>{optionA}
            </button>
            <button onClick={() => setChoice24h("b")}
              className="flex-1 rounded-xl border p-3 text-left text-xs"
              style={{ borderColor: choice24h === "b" ? "#c9a67a" : "#2a3e33", color: choice24h === "b" ? "#c9a67a" : "#aaa", background: choice24h === "b" ? "rgba(201,166,122,0.1)" : "#152620" }}>
              <span className="mb-1 block text-[9px] font-bold uppercase">B</span>{optionB}
            </button>
          </div>
          {choice24h && (
            <textarea value={reason24h} onChange={(e) => setReason24h(e.target.value)} rows={2}
              placeholder="Waarom zou je 24u-versie hiervoor kiezen?"
              className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 resize-none" />
          )}
        </div>

        {/* 10y perspective */}
        <div className="mb-5 rounded-2xl border border-[#7a9e7e]/30 bg-[#7a9e7e]/5 p-5">
          <h3 className="mb-1 text-sm font-bold text-[#7a9e7e]">🔮 Jouw versie over 10 jaar</h3>
          <p className="mb-3 text-[10px] text-gray-500">Wat zou de wijzere, ervaren versie van jezelf kiezen? Denk vanuit groei, waarden en lange termijn.</p>

          <div className="mb-3 flex gap-2">
            <button onClick={() => setChoice10y("a")}
              className="flex-1 rounded-xl border p-3 text-left text-xs"
              style={{ borderColor: choice10y === "a" ? "#7a9e7e" : "#2a3e33", color: choice10y === "a" ? "#7a9e7e" : "#aaa", background: choice10y === "a" ? "rgba(122,158,126,0.1)" : "#152620" }}>
              <span className="mb-1 block text-[9px] font-bold uppercase">A</span>{optionA}
            </button>
            <button onClick={() => setChoice10y("b")}
              className="flex-1 rounded-xl border p-3 text-left text-xs"
              style={{ borderColor: choice10y === "b" ? "#7a9e7e" : "#2a3e33", color: choice10y === "b" ? "#7a9e7e" : "#aaa", background: choice10y === "b" ? "rgba(122,158,126,0.1)" : "#152620" }}>
              <span className="mb-1 block text-[9px] font-bold uppercase">B</span>{optionB}
            </button>
          </div>
          {choice10y && (
            <textarea value={reason10y} onChange={(e) => setReason10y(e.target.value)} rows={2}
              placeholder="Waarom zou je 10-jaar-versie hiervoor kiezen?"
              className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 resize-none" />
          )}
        </div>

        <button onClick={() => setStep("insight")}
          disabled={!choice24h || !choice10y}
          className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
          Ontdek het inzicht →
        </button>
      </div>
    );
  }

  // ══════ INSIGHT ══════
  if (step === "insight") {
    return (
      <div className="mx-auto max-w-lg">
        <button onClick={() => setStep("perspectives")} className="mb-4 text-sm text-gray-500 hover:text-white">← Terug</button>

        {/* Result */}
        {aligned ? (
          <div className="mb-5 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-5 text-center">
            <span className="text-3xl">✅</span>
            <h3 className="mt-2 text-lg font-bold text-[#22c55e]">Aligned</h3>
            <p className="mt-1 text-xs text-gray-400">
              Je korte- en langetermijnversie kiezen hetzelfde. Dit is een <span className="text-white font-semibold">ergodische keuze</span> — het pad dat op beide tijdshorizonten het beste uitkomt.
            </p>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-[#E85D4A]/30 bg-[#E85D4A]/5 p-5 text-center">
            <span className="text-3xl">⚡</span>
            <h3 className="mt-2 text-lg font-bold text-[#E85D4A]">Spanning ontdekt</h3>
            <p className="mt-1 text-xs text-gray-400">
              Er is een <span className="text-white font-semibold">niet-ergodische spanning</span>. Wat nu goed voelt is niet wat op lange termijn het beste is. Dit is precies het moment waar bewuste keuzes het verschil maken.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#c9a67a]/30 bg-[#c9a67a]/5 p-3">
            <p className="mb-1 text-[9px] font-bold uppercase text-[#c9a67a]">⏰ 24 uur</p>
            <p className="text-xs font-semibold text-white">{choice24h === "a" ? optionA : optionB}</p>
            {reason24h && <p className="mt-1 text-[10px] text-gray-500">{reason24h}</p>}
          </div>
          <div className="rounded-xl border border-[#7a9e7e]/30 bg-[#7a9e7e]/5 p-3">
            <p className="mb-1 text-[9px] font-bold uppercase text-[#7a9e7e]">🔮 10 jaar</p>
            <p className="text-xs font-semibold text-white">{choice10y === "a" ? optionA : optionB}</p>
            {reason10y && <p className="mt-1 text-[10px] text-gray-500">{reason10y}</p>}
          </div>
        </div>

        {misaligned && (
          <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-500">🤔 Reflectievraag</p>
            <p className="mb-3 text-xs leading-relaxed text-gray-300">
              Je 24-uur-versie kiest voor het comfort van <span className="text-[#c9a67a] font-semibold">{choice24h === "a" ? "A" : "B"}</span>, maar je 10-jaar-versie weet dat <span className="text-[#7a9e7e] font-semibold">{choice10y === "a" ? "A" : "B"}</span> het pad is naar groei. Wat houdt je tegen om nu al te kiezen voor de langetermijnversie?
            </p>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3}
              placeholder="Schrijf je gedachten op..."
              className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none" />
          </div>
        )}

        {/* Final choice */}
        <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <p className="mb-2 text-sm font-bold text-white">Wat kies je uiteindelijk?</p>
          <p className="mb-3 text-[10px] text-gray-500">Dit is geen verplichting — het is een bewuste registratie van je keuze.</p>
          <div className="flex gap-2">
            <button onClick={() => setChosenOption("a")}
              className="flex-1 rounded-xl border p-3 text-xs text-center"
              style={{ borderColor: chosenOption === "a" ? "#A67C52" : "#2a3e33", color: chosenOption === "a" ? "#c9a67a" : "#888", background: chosenOption === "a" ? "rgba(166,124,82,0.1)" : "#152620" }}>
              A: {optionA}
            </button>
            <button onClick={() => setChosenOption("b")}
              className="flex-1 rounded-xl border p-3 text-xs text-center"
              style={{ borderColor: chosenOption === "b" ? "#A67C52" : "#2a3e33", color: chosenOption === "b" ? "#c9a67a" : "#888", background: chosenOption === "b" ? "rgba(166,124,82,0.1)" : "#152620" }}>
              B: {optionB}
            </button>
          </div>
        </div>

        <button onClick={saveDilemma} disabled={saving}
          className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
          {saving ? "Opslaan..." : "Opslaan & afsluiten"}
        </button>
      </div>
    );
  }

  // ══════ HISTORY ══════
  if (step === "history") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">🔄 Eerdere dilemma&apos;s</h2>
            <p className="text-xs text-gray-500">{dilemmas.length} dilemma&apos;s — {alignedCount} aligned, {misalignedCount} met spanning</p>
          </div>
          <button onClick={() => { reset(); setStep("dilemma"); }}
            className="rounded-xl px-4 py-2 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
            + Nieuw
          </button>
        </div>

        {dilemmas.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2a3e33] py-12 text-center">
            <p className="text-sm text-gray-500">Nog geen dilemma&apos;s geanalyseerd.</p>
            <button onClick={() => { reset(); setStep("dilemma"); }}
              className="mt-3 rounded-xl px-4 py-2 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
              Begin je eerste
            </button>
          </div>
        )}

        <div className="space-y-2">
          {dilemmas.map((d) => {
            const cat = CATEGORIES.find((c) => c.key === d.category);
            return (
              <div key={d.id} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{d.dilemma}</p>
                    <p className="text-[10px] text-gray-600">{cat?.icon} {cat?.label} · {new Date(d.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${d.aligned ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-[#E85D4A]/20 text-[#E85D4A]"}`}>
                    {d.aligned ? "Aligned" : "Spanning"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-[#152620] p-2">
                    <span className="text-[#c9a67a]">⏰ 24u:</span> <span className="text-gray-400">{d.choice24h === "a" ? d.optionA : d.optionB}</span>
                  </div>
                  <div className="rounded-lg bg-[#152620] p-2">
                    <span className="text-[#7a9e7e]">🔮 10j:</span> <span className="text-gray-400">{d.choice10y === "a" ? d.optionA : d.optionB}</span>
                  </div>
                </div>
                {d.chosenOption && (
                  <p className="mt-2 text-[10px] text-gray-500">Gekozen: <span className="text-white font-semibold">{d.chosenOption === "a" ? d.optionA : d.optionB}</span></p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => setStep("intro")} className="mt-4 text-sm text-gray-500 hover:text-white">← Terug naar intro</button>
      </div>
    );
  }

  return null;
}
