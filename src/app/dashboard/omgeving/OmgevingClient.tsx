"use client";
import { useState } from "react";

interface Person {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  gives: string[];
  costs: string[];
}

const EMOJIS = ["👤","👨","👩","🧑","👦","👧","🧔","👱","🙂","😊","💪","🏃","🎯","⭐","🦁","🔥"];

export default function OmgevingClient({ initialPersons }: { initialPersons: Person[] }) {
  const [persons, setPersons] = useState<Person[]>(initialPersons);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", role: "", emoji: "👤" });
  const [tagInputs, setTagInputs] = useState<Record<string, { gives: string; costs: string }>>({});

  const totalGives = persons.reduce((s, p) => s + p.gives.length, 0);
  const totalCosts = persons.reduce((s, p) => s + p.costs.length, 0);
  const total = totalGives + totalCosts || 1;
  const givePct = Math.round((totalGives / total) * 100);

  const getStatus = (p: Person) => {
    if (p.gives.length > p.costs.length) return { label: "Energiegever", color: "#22c55e" };
    if (p.costs.length > p.gives.length) return { label: "Energiekoster", color: "#ef4444" };
    return { label: "Neutraal", color: "#94a3b8" };
  };

  const addPerson = async () => {
    if (!newPerson.name.trim()) return;
    const res = await fetch("/api/environment-persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPerson),
    });
    const data = await res.json();
    if (data.id) setPersons([...persons, data]);
    setNewPerson({ name: "", role: "", emoji: "👤" });
    setAdding(false);
  };

  const addTag = async (personId: string, field: "gives" | "costs", value: string) => {
    if (!value.trim()) return;
    const person = persons.find(p => p.id === personId)!;
    const updated = [...person[field], value.trim()];
    await fetch("/api/environment-persons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: personId, [field]: updated }),
    });
    setPersons(persons.map(p => p.id === personId ? { ...p, [field]: updated } : p));
    setTagInputs(t => ({ ...t, [personId]: { ...t[personId], [field]: "" } }));
  };

  const removeTag = async (personId: string, field: "gives" | "costs", idx: number) => {
    const person = persons.find(p => p.id === personId)!;
    const updated = person[field].filter((_, i) => i !== idx);
    await fetch("/api/environment-persons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: personId, [field]: updated }),
    });
    setPersons(persons.map(p => p.id === personId ? { ...p, [field]: updated } : p));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">🏠 Omgeving</h1>
        <p className="mt-1 text-sm text-gray-500">Je bent de manager van je eigen omgeving.</p>
        <p className="text-xs text-gray-600">Mensen geven je energie of kosten je energie — bewustzijn hiervan is een fundament voor high performance.</p>
      </div>

      {/* Energy balance */}
      <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>⚡ Energiegevers ({totalGives} tags)</span>
          <span>🔋 Energiekosters ({totalCosts} tags)</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#2a3e33]">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${givePct}%` }} />
        </div>
        <p className="mt-2 text-center text-xs font-medium" style={{ color: givePct >= 50 ? "#22c55e" : "#ef4444" }}>
          {givePct >= 60 ? "✅ Jouw omgeving geeft meer dan het kost" :
           givePct >= 40 ? "⚖️ Jouw omgeving is in balans" :
           "⚠️ Jouw omgeving kost meer dan het geeft"}
        </p>
      </div>

      {/* Person cards */}
      {persons.map(p => {
        const status = getStatus(p);
        const isOpen = expanded === p.id;
        const ti = tagInputs[p.id] ?? { gives: "", costs: "" };
        return (
          <div key={p.id} className="mb-2 overflow-hidden rounded-2xl border border-[#2a3e33] bg-[#1a2e23]">
            <button onClick={() => setExpanded(isOpen ? null : p.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{p.name}</div>
                {p.role && <div className="text-xs text-gray-500">{p.role}</div>}
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: status.color + "22", color: status.color }}>{status.label}</span>
              <span className="text-xs text-gray-600">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className="border-t border-[#2a3e33] px-4 pb-4 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  {(["gives", "costs"] as const).map(field => (
                    <div key={field}>
                      <p className="mb-2 text-xs font-semibold" style={{ color: field === "gives" ? "#22c55e" : "#ef4444" }}>
                        {field === "gives" ? "⚡ Geeft je energie" : "🔋 Kost je energie"}
                      </p>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {p[field].map((tag, i) => (
                          <span key={i} onClick={() => removeTag(p.id, field, i)}
                            className="cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ background: (field === "gives" ? "#22c55e" : "#ef4444") + "22", color: field === "gives" ? "#22c55e" : "#ef4444" }}>
                            {tag} ×
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input value={ti[field]} onChange={e => setTagInputs(t => ({ ...t, [p.id]: { ...t[p.id], [field]: e.target.value } }))}
                          onKeyDown={e => { if (e.key === "Enter") addTag(p.id, field, ti[field]); }}
                          placeholder="Tag toevoegen..."
                          className="flex-1 rounded-lg border border-[#2a3e33] bg-[#0f1a14] px-2 py-1 text-xs text-white outline-none placeholder:text-gray-700" />
                        <button onClick={() => addTag(p.id, field, ti[field])}
                          className="rounded-lg px-2 py-1 text-xs font-bold text-white"
                          style={{ background: field === "gives" ? "#22c55e22" : "#ef444422", color: field === "gives" ? "#22c55e" : "#ef4444" }}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add person */}
      {adding ? (
        <div className="mt-3 rounded-2xl border border-[#A67C52]/40 bg-[#1a2e23] p-4">
          <p className="mb-3 text-sm font-semibold text-white">Persoon toevoegen</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setNewPerson(n => ({ ...n, emoji: e }))}
                className="rounded-lg p-1.5 text-lg transition-colors"
                style={{ background: newPerson.emoji === e ? "#A67C5233" : "transparent" }}>
                {e}
              </button>
            ))}
          </div>
          <input value={newPerson.name} onChange={e => setNewPerson(n => ({ ...n, name: e.target.value }))}
            placeholder="Naam *" className="mb-2 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
          <input value={newPerson.role} onChange={e => setNewPerson(n => ({ ...n, role: e.target.value }))}
            placeholder="Rol (bijv. Coach, Vader, Teamgenoot)" className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
          <div className="flex gap-2">
            <button onClick={addPerson} className="flex-1 rounded-xl bg-[#A67C52] py-2 text-sm font-bold text-white">Toevoegen</button>
            <button onClick={() => setAdding(false)} className="rounded-xl border border-[#2a3e33] px-4 py-2 text-sm text-gray-500">Annuleren</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="mt-3 w-full rounded-2xl border border-dashed border-[#2a3e33] py-3 text-sm text-gray-600 hover:border-[#A67C52] hover:text-[#A67C52]">
          + Persoon toevoegen
        </button>
      )}
    </div>
  );
}
