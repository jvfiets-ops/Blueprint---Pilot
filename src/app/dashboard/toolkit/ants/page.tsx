"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import VoiceInput from "@/components/VoiceInput";

const ANT_TYPES = [
  { id: "ALLES_OF_NIETS", nl: "Alles-of-niets denken", en: "All-or-nothing thinking", nlEx: "Als ik dit mis, ben ik waardeloos", enEx: "If I miss this, I'm worthless" },
  { id: "RAMPDENKEN", nl: "Rampdenken", en: "Catastrophizing", nlEx: "Dit gaat volledig mis", enEx: "This will go completely wrong" },
  { id: "GEDACHTEN_LEZEN", nl: "Gedachten lezen", en: "Mind reading", nlEx: "De coach vindt me slecht", enEx: "The coach thinks I'm bad" },
  { id: "TOEKOMST_VOORSPELLEN", nl: "Toekomst voorspellen", en: "Fortune telling", nlEx: "Ik ga sowieso falen", enEx: "I'm going to fail anyway" },
  { id: "EMOTIONEEL_REDENEREN", nl: "Emotioneel redeneren", en: "Emotional reasoning", nlEx: "Ik voel me slecht, dus ik presteer slecht", enEx: "I feel bad, so I perform badly" },
  { id: "ETIKETTEREN", nl: "Etiketteren", en: "Labeling", nlEx: "Ik ben een slechte speler", enEx: "I'm a bad player" },
  { id: "MOETEN_DENKEN", nl: "Moeten-denken", en: "Should-thinking", nlEx: "Ik moet perfect zijn", enEx: "I must be perfect" },
];

interface AntsLogEntry { id: string; antTekst: string; antType: string; squash: string; createdAt: string; }

export default function AntsPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  const [step, setStep] = useState(0); // 0=logboek, 1=herken, 2=classificeer, 3=onderzoek, 4=squash, 5=done
  const [antTekst, setAntTekst] = useState("");
  const [antType, setAntType] = useState("");
  const [bewijsVoor, setBewijsVoor] = useState("");
  const [bewijsTegen, setBewijsTegen] = useState("");
  const [squash, setSquash] = useState("");
  const [logs, setLogs] = useState<AntsLogEntry[]>([]);
  const [showAnim, setShowAnim] = useState(false);

  useEffect(() => {
    fetch("/api/ants").then(r => r.json()).then(d => { if (Array.isArray(d)) setLogs(d); }).catch(() => {});
  }, []);

  const saveAnt = async () => {
    if (!squash.trim()) return;
    setShowAnim(true);
    setTimeout(async () => {
      const res = await fetch("/api/ants", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antTekst, antType, bewijsVoor, bewijsTegen, squash }),
      });
      const log = await res.json();
      setLogs([log, ...logs]);
      setShowAnim(false);
      setStep(5);
    }, 1000);
  };

  const reset = () => {
    setStep(0); setAntTekst(""); setAntType(""); setBewijsVoor(""); setBewijsTegen(""); setSquash("");
  };

  // ── Logboek (step 0) ──
  if (step === 0) {
    const monthLogs = logs.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30 * 86400000));
    let topTypeId = "";
    if (logs.length > 0) {
      const counts: Record<string, number> = {};
      logs.forEach(l => { counts[l.antType] = (counts[l.antType] || 0) + 1; });
      topTypeId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    }
    const stats = {
      total: logs.length,
      month: monthLogs.length,
      topType: topTypeId ? ANT_TYPES.find(t => t.id === topTypeId) : null,
    };

    return (
      <div className="mx-auto max-w-2xl">
        {/* Hero card */}
        <div className="mb-6 rounded-2xl border border-[#E85D4A]/20 bg-[#E85D4A]/5 p-5">
          <h1 className="mb-1 text-xl font-black text-white">🐜 ANTs Squasher</h1>
          <p className="mb-3 text-xs text-gray-400">
            {nl ? "Automatic Negative Thoughts herkennen & omdenken" : "Recognize & reframe Automatic Negative Thoughts"}
          </p>
          <p className="mb-4 text-xs italic text-gray-500">
            {nl ? '"ANTs komen altijd. Je kunt ze niet stoppen. Maar je kunt leren ze te squashen." — Dan Abrahams' : '"ANTs always come. You can\'t stop them. But you can learn to squash them." — Dan Abrahams'}
          </p>
          <button onClick={() => setStep(1)} className="w-full rounded-xl bg-[#E85D4A] py-3 text-sm font-bold text-white">
            {nl ? "Start ANTs Squasher" : "Start ANTs Squasher"}
          </button>
        </div>

        {/* Stats */}
        {logs.length > 0 && (
          <div className="mb-4 flex gap-2">
            <div className="flex-1 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
              <p className="text-lg font-bold text-white">{logs.length}</p>
              <p className="text-[9px] text-gray-500">{nl ? "totaal" : "total"}</p>
            </div>
            <div className="flex-1 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
              <p className="text-lg font-bold text-white">{logs.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30 * 86400000)).length}</p>
              <p className="text-[9px] text-gray-500">{nl ? "deze maand" : "this month"}</p>
            </div>
          </div>
        )}

        {/* Logboek */}
        <h2 className="mb-3 text-sm font-bold text-[#E85D4A]">{nl ? "Logboek" : "Log"}</h2>
        {logs.length === 0 ? (
          <p className="text-xs text-gray-600">{nl ? "Nog geen ANTs gesquasht. Start je eerste!" : "No ANTs squashed yet. Start your first!"}</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 15).map(l => (
              <div key={l.id} className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded-full bg-[#E85D4A]/10 px-2 py-0.5 text-[9px] font-medium text-[#E85D4A]">
                    {ANT_TYPES.find(t => t.id === l.antType)?.[nl ? "nl" : "en"] || l.antType}
                  </span>
                  <span className="text-[9px] text-gray-600">{l.createdAt?.slice(0, 10)}</span>
                </div>
                <p className="text-xs text-gray-400 line-through">{l.antTekst}</p>
                <p className="mt-1 text-xs font-medium text-[#7a9e7e]">→ {l.squash}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Stap 1: Herken ──
  if (step === 1) return (
    <div className="mx-auto max-w-lg">
      <p className="mb-1 text-[10px] text-gray-500">{nl ? "Stap 1/4" : "Step 1/4"}</p>
      <h2 className="mb-4 text-lg font-bold text-white">{nl ? "Wat schiet er door je hoofd?" : "What's going through your mind?"}</h2>
      <p className="mb-3 text-xs text-gray-500">{nl ? "Schrijf de gedachte op zoals die in je hoofd klinkt. Woordelijk." : "Write the thought exactly as it sounds in your head. Word for word."}</p>
      <div className="mb-3 flex gap-2">
        <textarea value={antTekst} onChange={e => setAntTekst(e.target.value)} rows={3} autoFocus
          className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#E85D4A]" />
        <VoiceInput onTranscript={t => setAntTekst(prev => prev ? prev + " " + t : t)} lang={lang} />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(nl ? ["Ik speel slecht vandaag", "Ze verwachten te veel van me", "Ik ga dit niet redden", "Iedereen ziet dat ik fout zit"]
              : ["I'm playing badly today", "They expect too much", "I won't make it", "Everyone sees I'm failing"]).map(ex => (
          <button key={ex} onClick={() => setAntTekst(ex)} className="rounded-full border border-[#2a3e33] px-2.5 py-1 text-[10px] text-gray-500 hover:text-gray-300">"{ex}"</button>
        ))}
      </div>
      <button onClick={() => setStep(2)} disabled={!antTekst.trim()} className="w-full rounded-xl bg-[#E85D4A] py-3 text-sm font-bold text-white disabled:opacity-30">{nl ? "Volgende →" : "Next →"}</button>
    </div>
  );

  // ── Stap 2: Classificeer ──
  if (step === 2) return (
    <div className="mx-auto max-w-lg">
      <p className="mb-1 text-[10px] text-gray-500">{nl ? "Stap 2/4" : "Step 2/4"}</p>
      <h2 className="mb-2 text-lg font-bold text-white">{nl ? "Welk type ANT is dit?" : "What type of ANT is this?"}</h2>
      <div className="mb-2 rounded-xl bg-[#E85D4A]/10 px-3 py-2 text-xs text-gray-300">"{antTekst}"</div>
      <div className="space-y-2">
        {ANT_TYPES.map(t => (
          <button key={t.id} onClick={() => { setAntType(t.id); setStep(3); }}
            className="w-full rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-left transition-colors hover:border-[#E85D4A]/40">
            <p className="text-sm font-bold text-white">{nl ? t.nl : t.en}</p>
            <p className="text-[10px] italic text-gray-500">"{nl ? t.nlEx : t.enEx}"</p>
          </button>
        ))}
      </div>
      <button onClick={() => setStep(1)} className="mt-3 text-xs text-gray-500">{nl ? "← Terug" : "← Back"}</button>
    </div>
  );

  // ── Stap 3: Onderzoek ──
  if (step === 3) return (
    <div className="mx-auto max-w-lg">
      <p className="mb-1 text-[10px] text-gray-500">{nl ? "Stap 3/4" : "Step 3/4"}</p>
      <h2 className="mb-2 text-lg font-bold text-white">{nl ? "Onderzoek de ANT" : "Investigate the ANT"}</h2>
      <div className="mb-4 rounded-xl bg-[#E85D4A]/10 px-3 py-2 text-xs text-gray-300">
        "{antTekst}" — <span className="text-[#E85D4A]">{ANT_TYPES.find(t => t.id === antType)?.[nl ? "nl" : "en"]}</span>
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-xs text-gray-400">{nl ? "Wat is het bewijs dat dit klopt?" : "What evidence supports this?"}</label>
        <div className="flex gap-2">
          <textarea value={bewijsVoor} onChange={e => setBewijsVoor(e.target.value)} rows={2}
            className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none focus:border-[#E85D4A]" />
          <VoiceInput onTranscript={t => setBewijsVoor(prev => prev ? prev + " " + t : t)} lang={lang} />
        </div>
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-xs text-gray-400">{nl ? "Wat is het bewijs dat dit NIET klopt?" : "What evidence contradicts this?"}</label>
        <div className="flex gap-2">
          <textarea value={bewijsTegen} onChange={e => setBewijsTegen(e.target.value)} rows={2}
            className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none focus:border-[#E85D4A]" />
          <VoiceInput onTranscript={t => setBewijsTegen(prev => prev ? prev + " " + t : t)} lang={lang} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(2)} className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-xs text-gray-400">{nl ? "← Terug" : "← Back"}</button>
        <button onClick={() => setStep(4)} className="flex-1 rounded-xl bg-[#E85D4A] py-2.5 text-sm font-bold text-white">{nl ? "Volgende →" : "Next →"}</button>
      </div>
    </div>
  );

  // ── Stap 4: Squash ──
  if (step === 4) return (
    <div className="mx-auto max-w-lg">
      <p className="mb-1 text-[10px] text-gray-500">{nl ? "Stap 4/4" : "Step 4/4"}</p>
      <h2 className="mb-2 text-lg font-bold text-white">{nl ? "Squash de ANT" : "Squash the ANT"}</h2>
      <div className="mb-3 rounded-xl bg-[#E85D4A]/10 px-3 py-2 text-xs text-gray-400 line-through">"{antTekst}"</div>
      <p className="mb-2 text-xs text-gray-500">
        {nl ? "Schrijf een helpende, realistische gedachte. Realistisch, in de ik-vorm, gericht op gedrag." : "Write a helpful, realistic thought. Realistic, in first person, focused on behavior."}
      </p>
      <div className="mb-4 flex gap-2">
        <textarea value={squash} onChange={e => setSquash(e.target.value)} rows={2} autoFocus placeholder={nl ? "Ik..." : "I..."}
          className="flex-1 resize-none rounded-xl border border-[#7a9e7e]/50 bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7a9e7e]" />
        <VoiceInput onTranscript={t => setSquash(prev => prev ? prev + " " + t : t)} lang={lang} />
      </div>
      {showAnim ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-bounce text-3xl">✅</div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setStep(3)} className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-xs text-gray-400">{nl ? "← Terug" : "← Back"}</button>
          <button onClick={saveAnt} disabled={!squash.trim()} className="flex-1 rounded-xl bg-[#7a9e7e] py-2.5 text-sm font-bold text-white disabled:opacity-30">
            {nl ? "Squash opslaan ✓" : "Save squash ✓"}
          </button>
        </div>
      )}
    </div>
  );

  // ── Stap 5: Done ──
  return (
    <div className="mx-auto max-w-lg text-center py-8">
      <div className="mb-4 text-5xl">🎯</div>
      <h2 className="mb-2 text-xl font-bold text-white">{nl ? "ANT gesquasht!" : "ANT squashed!"}</h2>
      <div className="mb-4 rounded-xl bg-[#1a2e23] p-4">
        <p className="text-xs text-gray-500 line-through">{antTekst}</p>
        <p className="mt-2 text-sm font-medium text-[#7a9e7e]">→ {squash}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { reset(); setStep(1); }} className="flex-1 rounded-xl bg-[#E85D4A] py-2.5 text-sm font-bold text-white">{nl ? "Nog een squashen" : "Squash another"}</button>
        <button onClick={reset} className="flex-1 rounded-xl border border-[#2a3e33] py-2.5 text-sm text-gray-400">{nl ? "Naar logboek" : "To log"}</button>
      </div>
    </div>
  );
}
