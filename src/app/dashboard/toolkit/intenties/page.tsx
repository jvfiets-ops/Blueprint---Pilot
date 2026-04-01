"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceInput from "@/components/VoiceInput";

interface Intention { id: string; date: string; activity: string; intention: string; followUpScore: number | null; followUpNote: string | null; }

export default function IntentiesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Intention[]>([]);
  const [activity, setActivity] = useState("");
  const [intention, setIntention] = useState("");
  const [followUpId, setFollowUpId] = useState<string | null>(null);
  const [score, setScore] = useState(7);
  const [note, setNote] = useState("");

  useEffect(() => { fetch("/api/intentions").then(r => r.json()).then(d => { if (Array.isArray(d)) setItems(d); }).catch(() => {}); }, []);

  const save = async () => {
    if (!activity.trim() || !intention.trim()) return;
    const res = await fetch("/api/intentions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activity, intention }) });
    const item = await res.json();
    setItems([item, ...items]);
    setActivity(""); setIntention("");
  };

  const followUp = async (id: string) => {
    const res = await fetch("/api/intentions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, followUpScore: score, followUpNote: note }) });
    const updated = await res.json();
    setItems(items.map(i => i.id === id ? updated : i));
    setFollowUpId(null); setScore(7); setNote("");
  };

  const scoreColor = (n: number) => n >= 7 ? "#22c55e" : n >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={() => router.push("/dashboard/toolkit")} className="mb-4 text-sm text-gray-500 hover:text-white">← Toolkit</button>
      <h1 className="mb-1 text-xl font-bold text-white">🎯 Intenties</h1>
      <p className="mb-6 text-sm text-gray-400">Stel een bewuste intentie voor elke belangrijke activiteit. Na afloop koppel je terug: hoe ging het?</p>

      {/* New intention form */}
      <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <input value={activity} onChange={e => setActivity(e.target.value)} placeholder="Wat ga je doen? (bijv. Training, vergadering...)"
          className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
        <div className="relative mb-3">
          <textarea value={intention} onChange={e => setIntention(e.target.value)} rows={2} placeholder="Wat is je intentie? Waar ga je op letten?"
            className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
          <div className="absolute right-2 top-2"><VoiceInput size="sm" onTranscript={t => setIntention(intention ? intention + " " + t : t)} /></div>
        </div>
        <button onClick={save} disabled={!activity.trim() || !intention.trim()} className="w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-40">
          Intentie vastleggen
        </button>
      </div>

      {/* List */}
      {items.map(item => (
        <div key={item.id} className="mb-3 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">{item.date} — {item.activity}</span>
            {item.followUpScore !== null && (
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: scoreColor(item.followUpScore) + "22", color: scoreColor(item.followUpScore) }}>
                {item.followUpScore}/10
              </span>
            )}
          </div>
          <p className="mb-2 text-sm text-gray-300">{item.intention}</p>

          {item.followUpScore !== null ? (
            item.followUpNote && <p className="text-xs italic text-gray-500">{item.followUpNote}</p>
          ) : followUpId === item.id ? (
            <div className="mt-2 rounded-xl border border-[#2a3e33] bg-[#0f1a14] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">Hoe ging het?</span>
                <span className="text-lg font-bold" style={{ color: scoreColor(score) }}>{score}</span>
              </div>
              <input type="range" min="1" max="10" value={score} onChange={e => setScore(Number(e.target.value))} className="mb-2 w-full" style={{ accentColor: "#A67C52" }} />
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Korte terugkoppeling..."
                className="mb-2 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-2 text-xs text-white outline-none" />
              <div className="flex gap-2">
                <button onClick={() => followUp(item.id)} className="flex-1 rounded-lg bg-[#A67C52] py-2 text-xs font-bold text-white">Opslaan</button>
                <button onClick={() => setFollowUpId(null)} className="rounded-lg border border-[#2a3e33] px-3 py-2 text-xs text-gray-500">Annuleer</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setFollowUpId(item.id)} className="mt-1 text-xs font-semibold text-[#c9a67a] hover:underline">
              Hoe ging het? →
            </button>
          )}
        </div>
      ))}

      {items.length === 0 && <p className="text-center text-sm text-gray-600">Nog geen intenties. Stel je eerste in.</p>}
    </div>
  );
}
