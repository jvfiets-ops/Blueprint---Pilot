"use client";
import { useState, useEffect } from "react";
import VoiceInput from "@/components/VoiceInput";

type Context = "training" | "wedstrijd" | "algemeen";

interface Profile {
  id?: string;
  user_id?: string;
  context: Context;
  best_version_name: string;
  best_version_description: string;
  best_version_keywords: string[];
  best_version_codewords: string[];
  best_version_external_perspective: string;
  worst_version_name: string;
  worst_version_description: string;
  worst_version_keywords: string[];
  worst_version_codewords: string[];
  worst_version_external_perspective: string;
}

const EMPTY = (ctx: Context): Profile => ({
  context: ctx, best_version_name: "", best_version_description: "", best_version_keywords: [],
  best_version_codewords: [], best_version_external_perspective: "", worst_version_name: "",
  worst_version_description: "", worst_version_keywords: [], worst_version_codewords: [],
  worst_version_external_perspective: "",
});

const CONTEXTS: Context[] = ["training", "wedstrijd", "algemeen"];
const CONTEXT_LABELS = { training: "Training", wedstrijd: "Wedstrijd", algemeen: "Algemeen" };

function TagInput({ tags, onChange, placeholder, color = "#A67C52" }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string; color?: string }) {
  const [input, setInput] = useState("");
  const add = () => { if (input.trim()) { onChange([...tags, input.trim()]); setInput(""); } };
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap gap-1">
        {tags.map((t, i) => (
          <span key={i} onClick={() => onChange(tags.filter((_, j) => j !== i))}
            className="cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: color + "22", color }}>
            {t} ×
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Toevoegen..."}
          className="flex-1 rounded-lg border border-[#2a3e33] bg-[#0f1a14] px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-gray-700" />
        <button onClick={add} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-white" style={{ background: color + "33", color }}>+</button>
      </div>
    </div>
  );
}

export default function BesteVersieClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [activeCtx, setActiveCtx] = useState<Context>("training");
  const [profiles, setProfiles] = useState<Record<Context, Profile>>({
    training: initialProfiles.find(p => p.context === "training") ?? EMPTY("training"),
    wedstrijd: initialProfiles.find(p => p.context === "wedstrijd") ?? EMPTY("wedstrijd"),
    algemeen: initialProfiles.find(p => p.context === "algemeen") ?? EMPTY("algemeen"),
  });
  const [saved, setSaved] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const profile = profiles[activeCtx];
  const setProfile = (p: Profile) => setProfiles(prev => ({ ...prev, [activeCtx]: p }));

  const save = async () => {
    await fetch("/api/performance-profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] p-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-gray-600">Jouw codewoorden</p>
        <p className="mb-8 text-sm text-gray-500">{profile.best_version_name || "Beste versie"}</p>
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {profile.best_version_codewords.map((w, i) => (
            <span key={i} className="gradient-text text-4xl font-black">{w}</span>
          ))}
        </div>
        <button onClick={() => setFocusMode(false)} className="text-xs text-gray-600 hover:text-gray-400">Sluiten</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">⭐ Beste versie van mezelf</h1>
        <p className="mt-1 text-sm text-gray-500">Bouw je persoonlijk prestatieprofiel per context.</p>
      </div>

      {/* Context tabs */}
      <div className="mb-6 flex gap-2">
        {CONTEXTS.map(ctx => (
          <button key={ctx} onClick={() => setActiveCtx(ctx)}
            className="flex-1 rounded-xl py-2 text-sm font-semibold transition-colors"
            style={{ background: activeCtx === ctx ? "#A67C52" : "#1a2e23", color: activeCtx === ctx ? "#fff" : "#9ca3af" }}>
            {CONTEXT_LABELS[ctx]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Best version */}
        <div className="rounded-2xl border border-[#22c55e]/30 bg-[#1a2e23] p-4">
          <h3 className="mb-4 text-sm font-bold text-green-400">✨ Beste versie</h3>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Naam</label>
          <input value={profile.best_version_name} onChange={e => setProfile({ ...profile, best_version_name: e.target.value })}
            placeholder="bijv. De Leeuw" className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Beschrijving</label>
          <textarea value={profile.best_version_description} onChange={e => setProfile({ ...profile, best_version_description: e.target.value })}
            rows={3} placeholder="Hoe ziet jouw beste versie eruit?"
            className="mb-3 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Trefwoorden</label>
          <div className="mb-3">
            <TagInput tags={profile.best_version_keywords} onChange={t => setProfile({ ...profile, best_version_keywords: t })} placeholder="bijv. Gefocust" color="#22c55e" />
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">🔑 Codewoorden (mentale ankers)</label>
          <div className="mb-3">
            <TagInput tags={profile.best_version_codewords} onChange={t => setProfile({ ...profile, best_version_codewords: t })} placeholder="1–3 woorden" color="#A67C52" />
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Buitenperspectief</label>
          <textarea value={profile.best_version_external_perspective} onChange={e => setProfile({ ...profile, best_version_external_perspective: e.target.value })}
            rows={2} placeholder="Hoe zou een coach jouw beste versie omschrijven?"
            className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
        </div>

        {/* Worst version */}
        <div className="rounded-2xl border border-[#ef4444]/30 bg-[#1a2e23] p-4">
          <h3 className="mb-4 text-sm font-bold text-red-400">⚡ Minder goede versie</h3>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Naam</label>
          <input value={profile.worst_version_name} onChange={e => setProfile({ ...profile, worst_version_name: e.target.value })}
            placeholder="bijv. In mijn hoofd" className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Beschrijving</label>
          <textarea value={profile.worst_version_description} onChange={e => setProfile({ ...profile, worst_version_description: e.target.value })}
            rows={3} placeholder="Hoe ziet deze versie eruit?"
            className="mb-3 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Trefwoorden</label>
          <div className="mb-3">
            <TagInput tags={profile.worst_version_keywords} onChange={t => setProfile({ ...profile, worst_version_keywords: t })} placeholder="bijv. Afgeleid" color="#ef4444" />
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">🚨 Signaalkwoorden</label>
          <div className="mb-3">
            <TagInput tags={profile.worst_version_codewords} onChange={t => setProfile({ ...profile, worst_version_codewords: t })} placeholder="Herkenningssignaal" color="#f97316" />
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Wat merken anderen?</label>
          <textarea value={profile.worst_version_external_perspective} onChange={e => setProfile({ ...profile, worst_version_external_perspective: e.target.value })}
            rows={2} placeholder="Wat zouden anderen als eerste merken?"
            className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" />
        </div>
      </div>

      {/* Codeword card */}
      {profile.best_version_codewords.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#A67C52]/30 bg-[#1a2e23] p-4 text-center">
          <p className="mb-3 text-xs uppercase tracking-widest text-gray-600">Codewoorden — {profile.best_version_name}</p>
          <div className="mb-3 flex flex-wrap justify-center gap-3">
            {profile.best_version_codewords.map((w, i) => (
              <span key={i} className="gradient-text text-2xl font-extrabold">{w}</span>
            ))}
          </div>
          <button onClick={() => setFocusMode(true)} className="text-xs text-[#A67C52] hover:underline">
            Toon focus-modus →
          </button>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={save} className="flex-1 rounded-xl bg-[#A67C52] py-3 text-sm font-bold text-white">
          {saved ? "✅ Opgeslagen!" : "Opslaan"}
        </button>
      </div>

      {/* Zelfvertrouwen sectie — verplaatst vanuit Blauwdruk > Vertrouwen */}
      <ConfidenceSection />
    </div>
  );
}

// ─── Zelfvertrouwen sectie ────────────────────────────────────────────
// Slaat antwoorden op als BlauwdrukBron met thema="VERTROUWEN"
function ConfidenceSection() {
  const [sources, setSources] = useState("");          // Waar haal jij je zelfvertrouwen uit?
  const [empowerment, setEmpowerment] = useState("");  // Wat maakt jou zelfverzekerd?
  const [strength, setStrength] = useState("");        // Wat maakt jou krachtig?
  const [loading, setLoading] = useState(true);
  const [existingIds, setExistingIds] = useState<Record<string, string>>({});
  const [confSaved, setConfSaved] = useState(false);

  // Categorie-specifieke labels die we gebruiken om bronnen te herkennen
  const LABEL_SOURCES = "__confidence_sources__";
  const LABEL_EMPOWER = "__confidence_empowerment__";
  const LABEL_STRENGTH = "__confidence_strength__";

  useEffect(() => {
    fetch("/api/blauwdruk-bronnen?thema=VERTROUWEN")
      .then(r => r.json())
      .then(d => {
        if (!Array.isArray(d)) return;
        const map: Record<string, string> = {};
        for (const b of d) {
          if (b.titel === LABEL_SOURCES) { setSources(b.beschrijving || ""); map.sources = b.id; }
          if (b.titel === LABEL_EMPOWER) { setEmpowerment(b.beschrijving || ""); map.empowerment = b.id; }
          if (b.titel === LABEL_STRENGTH) { setStrength(b.beschrijving || ""); map.strength = b.id; }
        }
        setExistingIds(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upsert = async (titel: string, beschrijving: string, existingId?: string) => {
    if (existingId) {
      // delete + recreate is easiest given current API has no PUT for bronnen
      await fetch("/api/blauwdruk-bronnen", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existingId }),
      }).catch(() => {});
    }
    const res = await fetch("/api/blauwdruk-bronnen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thema: "VERTROUWEN", titel, beschrijving, categorie: "OVERTUIGING" }),
    });
    const bron = await res.json();
    return bron?.id as string | undefined;
  };

  const saveConfidence = async () => {
    const [s, e, st] = await Promise.all([
      upsert(LABEL_SOURCES, sources, existingIds.sources),
      upsert(LABEL_EMPOWER, empowerment, existingIds.empowerment),
      upsert(LABEL_STRENGTH, strength, existingIds.strength),
    ]);
    setExistingIds({
      sources: s ?? existingIds.sources,
      empowerment: e ?? existingIds.empowerment,
      strength: st ?? existingIds.strength,
    });
    setConfSaved(true);
    setTimeout(() => setConfSaved(false), 2000);
  };

  if (loading) return null;

  const fields: { label: string; value: string; set: (v: string) => void }[] = [
    { label: "Waar haal jij je zelfvertrouwen uit?", value: sources, set: setSources },
    { label: "Wat maakt jou zelfverzekerd?", value: empowerment, set: setEmpowerment },
    { label: "Wat maakt jou krachtig?", value: strength, set: setStrength },
  ];

  return (
    <section className="mt-8 rounded-2xl border border-[#D4A76A]/30 bg-[#D4A76A]/5 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🛡️</span>
        <h3 className="text-base font-black text-[#D4A76A]">Zelfvertrouwen</h3>
      </div>
      <p className="mb-4 text-xs text-gray-400">
        Je beste versie staat of valt met zelfvertrouwen. Beantwoord deze drie vragen voor jezelf.
      </p>

      {fields.map((f, i) => (
        <div key={i} className="mb-3">
          <label className="mb-1 block text-xs font-semibold text-gray-400">{f.label}</label>
          <div className="flex gap-2">
            <textarea
              value={f.value}
              onChange={e => f.set(e.target.value)}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#D4A76A]"
            />
            <VoiceInput
              onTranscript={text => f.set(f.value ? f.value + " " + text : text)}
              lang="nl"
            />
          </div>
        </div>
      ))}

      <button
        onClick={saveConfidence}
        className="mt-2 w-full rounded-xl bg-[#D4A76A] py-2.5 text-sm font-bold text-white"
      >
        {confSaved ? "✅ Opgeslagen!" : "Zelfvertrouwen opslaan"}
      </button>
    </section>
  );
}
