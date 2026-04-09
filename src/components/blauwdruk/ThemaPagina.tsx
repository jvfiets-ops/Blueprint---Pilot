"use client";
import { useState, useEffect } from "react";
import VoiceInput from "@/components/VoiceInput";

interface Bron {
  id: string;
  titel: string;
  beschrijving?: string;
  categorie: string;
  createdAt: string;
}

interface ThemaPaginaProps {
  thema: string;
  icon: string;
  title: string;
  intro: string;
  color: string;
  categories: { id: string; label: string }[];
  prompts: string[];
  lang: string;
}

export default function ThemaPagina({ thema, icon, title, intro, color, categories, prompts, lang }: ThemaPaginaProps) {
  const [bronnen, setBronnen] = useState<Bron[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [titel, setTitel] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [categorie, setCategorie] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/blauwdruk-bronnen?thema=${thema}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setBronnen(d); })
      .catch(() => {});
  }, [thema]);

  const save = async () => {
    if (!titel.trim() || !categorie) return;
    setSaving(true);
    const res = await fetch("/api/blauwdruk-bronnen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thema, titel: titel.trim(), beschrijving: beschrijving.trim() || null, categorie }),
    });
    const bron = await res.json();
    setBronnen([bron, ...bronnen]);
    setTitel(""); setBeschrijving(""); setCategorie(""); setShowForm(false);
    setSaving(false);
  };

  const deleteBron = async (id: string) => {
    await fetch("/api/blauwdruk-bronnen", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBronnen(bronnen.filter(b => b.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-black text-white">{icon} {title}</h1>
      <p className="mb-6 text-sm leading-relaxed text-gray-400">{intro}</p>

      {/* Bronnen header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color }}>{lang === "nl" ? "Jouw bronnen" : "Your sources"}</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: color }}>
          {showForm ? "✕" : "+ " + (lang === "nl" ? "Toevoegen" : "Add")}
        </button>
      </div>

      {/* Formulier */}
      {showForm && (
        <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <div className="mb-3 flex gap-2">
            <input value={titel} onChange={e => setTitel(e.target.value)} maxLength={80}
              placeholder={lang === "nl" ? "Titel (max 80 tekens)" : "Title (max 80 chars)"}
              className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
            <VoiceInput onTranscript={t => setTitel(prev => prev ? prev + " " + t : t)} lang={lang} />
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategorie(c.id)}
                className="rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors"
                style={{ borderColor: categorie === c.id ? color : "#2a3e33", color: categorie === c.id ? color : "#888" }}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="mb-3 flex gap-2">
            <textarea value={beschrijving} onChange={e => setBeschrijving(e.target.value)} rows={2}
              placeholder={lang === "nl" ? "Beschrijving (optioneel)" : "Description (optional)"}
              className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
            <VoiceInput onTranscript={t => setBeschrijving(prev => prev ? prev + " " + t : t)} lang={lang} />
          </div>

          <button onClick={save} disabled={!titel.trim() || !categorie || saving}
            className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-30" style={{ background: color }}>
            {saving ? "..." : (lang === "nl" ? "Opslaan" : "Save")}
          </button>
        </div>
      )}

      {/* Lege staat */}
      {bronnen.length === 0 && !showForm && (
        <div className="mb-4 rounded-2xl border border-dashed border-[#2a3e33] p-6 text-center">
          <p className="mb-3 text-sm text-gray-500">{lang === "nl" ? "Nog geen bronnen toegevoegd." : "No sources added yet."}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {prompts.map((p, i) => (
              <button key={i} onClick={() => { setTitel(p); setShowForm(true); }}
                className="rounded-full border border-[#2a3e33] px-3 py-1 text-[10px] text-gray-400 hover:border-gray-500 hover:text-gray-300">
                "{p}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bronnen lijst */}
      <div className="space-y-2">
        {bronnen.map(b => (
          <div key={b.id} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <span className="mr-2 rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ background: color + "22", color }}>
                  {categories.find(c => c.id === b.categorie)?.label || b.categorie}
                </span>
              </div>
              <button onClick={() => deleteBron(b.id)} className="text-[10px] text-gray-600 hover:text-red-400">✕</button>
            </div>
            <h3 className="text-sm font-bold text-white">{b.titel}</h3>
            {b.beschrijving && <p className="mt-1 text-xs text-gray-400">{b.beschrijving}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
