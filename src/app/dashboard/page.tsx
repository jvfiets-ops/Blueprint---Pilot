"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";

interface ReflectionEntry {
  id: string;
  date: string;
  dailyIntention: string;
  dailyReview: string;
}

export default function ReflectiePage() {
  const [lang] = useLang();
  const t = getT(lang);

  const [devGoal, setDevGoal] = useState("");
  const [devGoalSaved, setDevGoalSaved] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [intention, setIntention] = useState("");
  const [review, setReview] = useState("");
  const [history, setHistory] = useState<ReflectionEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [todaySaved, setTodaySaved] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch("/api/reflections")
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          date: ((r.created_at || r.createdAt) as string)?.slice(0, 10) || "",
          dailyIntention: (r.event_reflection_text || "") as string,
          dailyReview: (r.ai_summary || "") as string,
          label: (r.event_label || "") as string,
          devGoal: (r.eventReflectionVoiceTranscript || "") as string,
        }));
        setHistory(mapped.filter(r => r.label !== "DevGoal"));
        const goalEntry = mapped.find(r => r.label === "DevGoal");
        if (goalEntry?.devGoal) {
          setDevGoal(goalEntry.devGoal);
          setDevGoalSaved(goalEntry.devGoal);
        }
        const todayEntry = mapped.find(r => r.date === today && r.label !== "DevGoal");
        if (todayEntry) {
          setIntention(todayEntry.dailyIntention);
          setReview(todayEntry.dailyReview);
          setTodaySaved(true);
        }
      })
      .catch(() => {});
  }, [today]);

  const saveDevGoal = async () => {
    await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood_icon: "🎯", mood_score: 5,
        event_label: "DevGoal",
        event_reflection_text: "",
        eventReflectionVoiceTranscript: devGoal,
      }),
    });
    setDevGoalSaved(devGoal);
    setEditingGoal(false);
    flashSaved();
  };

  const saveDay = async () => {
    await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood_icon: "📝", mood_score: 5,
        event_label: "Reflectie",
        event_reflection_text: intention,
        ai_summary: review,
      }),
    });
    setTodaySaved(true);
    flashSaved();
  };

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="mx-auto max-w-2xl">
      {saved && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#22c55e]/90 px-4 py-1.5 text-xs font-bold text-black">
          {t.refSaved}
        </div>
      )}

      <h1 className="mb-6 text-2xl font-black text-white">🪞 {t.navReflectie}</h1>

      {/* Ontwikkeldoel */}
      <section className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#c9a67a]">{t.refDevGoalLabel}</h2>
          {devGoalSaved && !editingGoal && (
            <button onClick={() => setEditingGoal(true)} className="text-xs text-gray-500 hover:text-[#c9a67a]">{t.refEdit}</button>
          )}
        </div>
        <p className="mb-3 text-xs text-gray-500">{t.refDevGoalHint}</p>
        {(!devGoalSaved || editingGoal) ? (
          <>
            <div className="flex gap-2">
              <textarea value={devGoal} onChange={e => setDevGoal(e.target.value)} placeholder={t.refDevGoalQ} rows={2}
                className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
              <VoiceInput onTranscript={text => setDevGoal(prev => prev ? prev + " " + text : text)} lang={lang} />
            </div>
            <button onClick={saveDevGoal} disabled={!devGoal.trim()} className="mt-3 w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-30">{t.refSave}</button>
          </>
        ) : (
          <p className="rounded-xl bg-[#0f1a14] px-3 py-2.5 text-sm text-gray-200">{devGoalSaved}</p>
        )}
      </section>

      {/* Dagelijkse intentie */}
      <section className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <h2 className="mb-2 text-sm font-bold text-[#c9a67a]">{t.refIntentionLabel}</h2>
        <div className="flex gap-2">
          <textarea value={intention} onChange={e => setIntention(e.target.value)} placeholder={t.refIntentionQ} rows={2}
            className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
          <VoiceInput onTranscript={text => setIntention(prev => prev ? prev + " " + text : text)} lang={lang} />
        </div>
      </section>

      {/* Dagelijkse terugblik */}
      <section className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <h2 className="mb-2 text-sm font-bold text-[#c9a67a]">{t.refReviewLabel}</h2>
        <div className="flex gap-2">
          <textarea value={review} onChange={e => setReview(e.target.value)} placeholder={t.refReviewQ} rows={2}
            className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
          <VoiceInput onTranscript={text => setReview(prev => prev ? prev + " " + text : text)} lang={lang} />
        </div>
        <button onClick={saveDay} disabled={!intention.trim() && !review.trim()}
          className="mt-4 w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-30">
          {todaySaved ? "✓ " : ""}{t.refSave}
        </button>
      </section>

      {/* Historisch overzicht */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-[#c9a67a]">{t.refHistory}</h2>
        {history.length === 0 ? (
          <p className="text-xs text-gray-600">{t.refNoHistory}</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map(entry => (
              <div key={entry.id} className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3">
                <p className="mb-1 text-[10px] text-gray-500">{entry.date}</p>
                {entry.dailyIntention && <p className="text-xs text-gray-300"><span className="text-[#c9a67a]">→</span> {entry.dailyIntention}</p>}
                {entry.dailyReview && <p className="mt-0.5 text-xs text-gray-400"><span className="text-[#7a9e7e]">←</span> {entry.dailyReview}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
