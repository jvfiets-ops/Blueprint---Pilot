"use client";
import { useState } from "react";

interface RoleModel {
  id: string;
  name: string;
  domain: string;
  emoji: string;
  why_inspiring: string;
  what_makes_them_inspiring: string[];
  personal_meaning: string;
  qualities_to_adopt: string[];
  connected_to_best_version: boolean;
}

const DOMAINS = ["Sport", "Business", "Persoonlijk", "Algemeen"];
const QUALITY_PRESETS = ["Veerkracht", "Leiderschap", "Discipline", "Authenticiteit", "Focus", "Moed", "Empathie", "Doorzettingsvermogen"];
const EMOJIS = ["⭐","🦁","🔥","💪","🎯","🧠","❤️","🌟","👑","⚡","🏆","🦅"];

function TagInput({ tags, onChange, presets }: { tags: string[]; onChange: (t: string[]) => void; presets?: string[] }) {
  const [input, setInput] = useState("");
  const add = (val: string) => { if (val && !tags.includes(val)) onChange([...tags, val]); setInput(""); };
  return (
    <div>
      {presets && (
        <div className="mb-2 flex flex-wrap gap-1">
          {presets.map(p => (
            <button key={p} onClick={() => add(p)}
              className="rounded-full border px-2 py-0.5 text-[10px] transition-colors"
              style={{ borderColor: tags.includes(p) ? "#A67C52" : "#2a3e33", color: tags.includes(p) ? "#c9a67a" : "#6b7280", background: tags.includes(p) ? "#A67C5222" : "transparent" }}>
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="mb-1.5 flex flex-wrap gap-1">
        {tags.map((t, i) => (
          <span key={i} onClick={() => onChange(tags.filter((_, j) => j !== i))}
            className="cursor-pointer rounded-full bg-[#A67C5222] px-2.5 py-0.5 text-[11px] font-semibold text-[#c9a67a]">
            {t} ×
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(input.trim()); } }}
          placeholder="Eigen kwaliteit toevoegen..."
          className="flex-1 rounded-lg border border-[#2a3e33] bg-[#0f1a14] px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-gray-700" />
        <button onClick={() => add(input.trim())} className="rounded-lg bg-[#A67C5233] px-2.5 py-1.5 text-xs font-bold text-[#c9a67a]">+</button>
      </div>
    </div>
  );
}

export default function RolModellenClient({ initialModels }: { initialModels: RoleModel[] }) {
  const [models, setModels] = useState<RoleModel[]>(initialModels);
  const [adding, setAdding] = useState(false);
  const [focusCard, setFocusCard] = useState<RoleModel | null>(null);
  const [form, setForm] = useState({
    name: "", domain: "Sport", emoji: "⭐", why_inspiring: "",
    what_makes_them_inspiring: [] as string[], personal_meaning: "",
    qualities_to_adopt: [] as string[], connected_to_best_version: false,
  });

  const saveModel = async () => {
    if (!form.name.trim()) return;
    const res = await fetch("/api/role-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.id) setModels([data as RoleModel, ...models]);
    setAdding(false);
    setForm({ name: "", domain: "Sport", emoji: "⭐", why_inspiring: "", what_makes_them_inspiring: [], personal_meaning: "", qualities_to_adopt: [], connected_to_best_version: false });
  };

  if (focusCard) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] p-8">
        <span className="mb-4 text-6xl">{focusCard.emoji}</span>
        <h2 className="mb-1 text-3xl font-black text-white">{focusCard.name}</h2>
        <p className="mb-6 text-sm text-gray-500">{focusCard.domain}</p>
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {focusCard.qualities_to_adopt.map((q, i) => (
            <span key={i} className="gradient-text text-xl font-extrabold">{q}</span>
          ))}
        </div>
        {focusCard.personal_meaning && (
          <p className="max-w-sm text-center text-sm leading-relaxed text-gray-400">{focusCard.personal_meaning}</p>
        )}
        <button onClick={() => setFocusCard(null)} className="mt-8 text-xs text-gray-600 hover:text-gray-400">Sluiten</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">⭐ Rolmodellen</h1>
          <p className="mt-1 text-sm text-gray-500">Bouw je persoonlijke inspiratiebron op.</p>
        </div>
        <button onClick={() => setAdding(true)} className="rounded-xl bg-[#A67C52] px-4 py-2 text-sm font-bold text-white">
          + Toevoegen
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 rounded-2xl border border-[#A67C52]/40 bg-[#1a2e23] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">Nieuw rolmodel</h3>
          <div className="mb-3 flex flex-wrap gap-1">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className="rounded-lg p-1.5 text-xl" style={{ background: form.emoji === e ? "#A67C5233" : "transparent" }}>{e}</button>
            ))}
          </div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Naam (bijv. Kobe Bryant, Mijn vader)"
            className="mb-2 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
          <div className="mb-3 flex gap-2">
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, domain: d }))}
                className="flex-1 rounded-xl py-1.5 text-xs font-medium"
                style={{ background: form.domain === d ? "#A67C52" : "#2a3e33", color: form.domain === d ? "#fff" : "#9ca3af" }}>
                {d}
              </button>
            ))}
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Waarom inspireert deze persoon jou?</label>
          <textarea value={form.why_inspiring} onChange={e => setForm(f => ({ ...f, why_inspiring: e.target.value }))}
            rows={2} className="mb-3 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700" placeholder="In je eigen woorden..." />
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Wat maakt hem/haar inspirerend?</label>
          <div className="mb-3">
            <TagInput tags={form.what_makes_them_inspiring} onChange={t => setForm(f => ({ ...f, what_makes_them_inspiring: t }))} presets={QUALITY_PRESETS} />
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Kwaliteiten die ik wil laten zien</label>
          <div className="mb-3">
            <TagInput tags={form.qualities_to_adopt} onChange={t => setForm(f => ({ ...f, qualities_to_adopt: t }))} presets={QUALITY_PRESETS} />
          </div>
          <label className="mb-1 block text-[10px] uppercase text-gray-600">Persoonlijke betekenis</label>
          <textarea value={form.personal_meaning} onChange={e => setForm(f => ({ ...f, personal_meaning: e.target.value }))}
            rows={2} className="mb-4 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700"
            placeholder="Wat neem jij mee uit het voorbeeld van deze persoon?" />
          <div className="flex gap-2">
            <button onClick={saveModel} className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white">Opslaan</button>
            <button onClick={() => setAdding(false)} className="rounded-xl border border-[#2a3e33] px-4 text-sm text-gray-500">Annuleren</button>
          </div>
        </div>
      )}

      {/* Model cards */}
      {models.map(m => (
        <div key={m.id} className="mb-3 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">{m.emoji}</span>
            <div className="flex-1">
              <div className="font-bold text-white">{m.name}</div>
              <div className="text-xs text-gray-500">{m.domain}</div>
            </div>
            <button onClick={() => setFocusCard(m)} className="text-xs text-[#A67C52] hover:underline">Inspiratiekaart →</button>
          </div>
          {m.why_inspiring && <p className="mb-2 text-sm text-gray-400 line-clamp-2">{m.why_inspiring}</p>}
          {m.what_makes_them_inspiring?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {m.what_makes_them_inspiring.map((q, i) => (
                <span key={i} className="rounded-full bg-[#A67C5222] px-2 py-0.5 text-[10px] text-[#c9a67a]">{q}</span>
              ))}
            </div>
          )}
        </div>
      ))}

      {models.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-12 text-center text-sm text-gray-600">
          Nog geen rolmodellen. Voeg er een toe!
        </div>
      )}
    </div>
  );
}
