"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceInput from "@/components/VoiceInput";

interface Review { id: string; weekStart: string; highlight: string | null; challenge: string | null; nextWeek: string | null; aiSummary: string | null; }

export default function WeekReviewPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [nextWeek, setNextWeek] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetch("/api/week-review").then(r => r.json()).then(d => { if (Array.isArray(d)) setReviews(d); }).catch(() => {}); }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/week-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ highlight, challenge, nextWeek }) });
    const review = await res.json();
    setReviews([review, ...reviews.filter(r => r.weekStart !== review.weekStart)]);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const questions = [
    { emoji: "🏆", label: "Wat was je hoogtepunt deze week?", value: highlight, set: setHighlight },
    { emoji: "💪", label: "Waar liep je tegenaan?", value: challenge, set: setChallenge },
    { emoji: "🎯", label: "Wat is je intentie voor volgende week?", value: nextWeek, set: setNextWeek },
  ];

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={() => router.push("/dashboard/toolkit")} className="mb-4 text-sm text-gray-500 hover:text-white">← Toolkit</button>
      <h1 className="mb-1 text-xl font-bold text-white">📅 Weekreview</h1>
      <p className="mb-6 text-sm text-gray-400">Kijk terug op je week. Herken patronen en bereid de volgende week voor.</p>

      {/* Current week review */}
      <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        {questions.map(({ emoji, label, value, set }) => (
          <div key={label} className="mb-4">
            <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <span>{emoji}</span> {label}
            </label>
            <div className="relative">
              <textarea value={value} onChange={e => set(e.target.value)} rows={2}
                placeholder="Typ of spreek in..."
                className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />
              <div className="absolute right-2 top-2">
                <VoiceInput size="sm" onTranscript={t => set(value ? value + " " + t : t)} />
              </div>
            </div>
          </div>
        ))}
        <button onClick={save} disabled={saving || (!highlight.trim() && !challenge.trim() && !nextWeek.trim())}
          className="w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {saving ? "Opslaan..." : saved ? "✓ Opgeslagen" : "Opslaan"}
        </button>
      </div>

      {/* Previous weeks */}
      {reviews.length > 0 && (
        <>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Eerdere weken</h2>
          {reviews.map(r => (
            <div key={r.id} className="mb-2 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="flex w-full items-center justify-between p-4 text-left">
                <span className="text-sm font-semibold text-white">Week van {r.weekStart}</span>
                <span className="text-xs text-gray-500">{expandedId === r.id ? "▲" : "▼"}</span>
              </button>
              {expandedId === r.id && (
                <div className="border-t border-[#2a3e33] px-4 pb-4 pt-3 space-y-2">
                  {r.highlight && <p className="text-xs text-gray-400"><span className="font-semibold text-[#22c55e]">🏆</span> {r.highlight}</p>}
                  {r.challenge && <p className="text-xs text-gray-400"><span className="font-semibold text-[#f59e0b]">💪</span> {r.challenge}</p>}
                  {r.nextWeek && <p className="text-xs text-gray-400"><span className="font-semibold text-[#c9a67a]">🎯</span> {r.nextWeek}</p>}
                  {r.aiSummary && <p className="mt-2 rounded-lg bg-[#0f1a14] p-2 text-xs italic text-gray-500">{r.aiSummary}</p>}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
