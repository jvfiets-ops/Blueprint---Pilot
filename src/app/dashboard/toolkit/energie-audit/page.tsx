"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Audit { id: string; activity: string; quadrant: string; }

const QUADRANTS = [
  { key: "high-energy-high-time", label: "Veel energie + Veel tijd", icon: "🔋", color: "#22c55e", tag: "Ideaal" },
  { key: "high-energy-low-time", label: "Veel energie + Weinig tijd", icon: "⚡", color: "#A67C52", tag: "Meer van doen" },
  { key: "low-energy-high-time", label: "Weinig energie + Veel tijd", icon: "😴", color: "#ef4444", tag: "Minimaliseren" },
  { key: "low-energy-low-time", label: "Weinig energie + Weinig tijd", icon: "🔻", color: "#6b7280", tag: "Elimineren" },
];

export default function EnergieAuditPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [activity, setActivity] = useState("");
  const [selectedQ, setSelectedQ] = useState("");

  useEffect(() => { fetch("/api/energy-audit").then(r => r.json()).then(d => { if (Array.isArray(d)) setAudits(d); }).catch(() => {}); }, []);

  const add = async () => {
    if (!activity.trim() || !selectedQ) return;
    const res = await fetch("/api/energy-audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activity: activity.trim(), quadrant: selectedQ }) });
    const a = await res.json();
    setAudits([a, ...audits]);
    setActivity(""); setSelectedQ("");
  };

  const remove = async (id: string) => {
    await fetch("/api/energy-audit", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setAudits(audits.filter(a => a.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => router.push("/dashboard/toolkit")} className="mb-4 text-sm text-gray-500 hover:text-white">← Toolkit</button>
      <h1 className="mb-1 text-xl font-bold text-white">⚡ Energieaudit</h1>
      <p className="mb-6 text-sm text-gray-400">Breng in kaart welke activiteiten je energie geven en welke je energie kosten. Bewustzijn hiervan is essentieel voor duurzame topprestaties.</p>

      {/* Add activity */}
      <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
        <input value={activity} onChange={e => setActivity(e.target.value)} placeholder="Activiteit toevoegen..."
          className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
        <div className="mb-3 grid grid-cols-2 gap-2">
          {QUADRANTS.map(q => (
            <button key={q.key} onClick={() => setSelectedQ(q.key)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors"
              style={{ borderColor: selectedQ === q.key ? q.color : "#2a3e33", background: selectedQ === q.key ? q.color + "15" : "transparent", color: selectedQ === q.key ? q.color : "#9ca3af" }}>
              <span>{q.icon}</span> {q.tag}
            </button>
          ))}
        </div>
        <button onClick={add} disabled={!activity.trim() || !selectedQ} className="w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-40">Toevoegen</button>
      </div>

      {/* Matrix */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUADRANTS.map(q => {
          const items = audits.filter(a => a.quadrant === q.key);
          return (
            <div key={q.key} className="rounded-2xl border bg-[#1a2e23] p-4" style={{ borderColor: q.color + "33" }}>
              <div className="mb-2 flex items-center gap-2">
                <span>{q.icon}</span>
                <span className="text-xs font-bold" style={{ color: q.color }}>{q.tag}</span>
              </div>
              <p className="mb-3 text-[10px] text-gray-600">{q.label}</p>
              {items.length === 0 && <p className="text-xs text-gray-700 italic">Nog geen activiteiten</p>}
              <div className="flex flex-wrap gap-1.5">
                {items.map(a => (
                  <span key={a.id} className="group flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: q.color + "15", color: q.color }}>
                    {a.activity}
                    <button onClick={() => remove(a.id)} className="text-[10px] opacity-0 transition-opacity group-hover:opacity-60">✕</button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
