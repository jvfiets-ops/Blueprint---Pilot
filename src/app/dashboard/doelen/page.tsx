"use client";
import { useState, useEffect } from "react";

interface Action { text: string; done: boolean; }
interface GoalReflection { date: string; text: string; confidence: number; }
interface Goal {
  id: string;
  title: string;
  category: string;
  timeframe: string;
  description: string;
  whyImportant: string;
  successLooksLike: string;
  obstacles: string[];
  actions: Action[];
  confidence: number;
  progress: number;
  status: string;
  reflections: GoalReflection[];
  createdAt: string;
}

const CATEGORIES = [
  { key: "persoonlijk", label: "Persoonlijk", icon: "🎯" },
  { key: "professioneel", label: "Professioneel", icon: "💼" },
  { key: "mentaal", label: "Mentaal", icon: "🧠" },
  { key: "fysiek", label: "Fysiek", icon: "💪" },
  { key: "sociaal", label: "Sociaal", icon: "🤝" },
];

const TIMEFRAMES = ["1 maand", "3 maanden", "6 maanden", "1 jaar"];

function ConfidenceBar({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const color = value >= 7 ? "#22c55e" : value >= 4 ? "#c9a67a" : "#E85D4A";
  const label = value >= 8 ? "Zeer zeker" : value >= 6 ? "Redelijk zeker" : value >= 4 ? "Twijfel" : "Onzeker";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-500">Vertrouwen</span>
        <span className="text-xs font-bold" style={{ color }}>{value}/10 — {label}</span>
      </div>
      {onChange ? (
        <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full" style={{ accentColor: color }} />
      ) : (
        <div className="h-2 rounded-full bg-[#2a3e33]">
          <div className="h-full rounded-full" style={{ width: `${value * 10}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 28; const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  const color = progress >= 75 ? "#22c55e" : progress >= 40 ? "#c9a67a" : "#A67C52";
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#2a3e33" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold text-white">{progress}%</span>
    </div>
  );
}

type View = "list" | "new" | "detail";

export default function DoelenPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);

  // New goal form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("persoonlijk");
  const [timeframe, setTimeframe] = useState("3 maanden");
  const [description, setDescription] = useState("");
  const [whyImportant, setWhyImportant] = useState("");
  const [successLooksLike, setSuccessLooksLike] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [obstacles, setObstacles] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(5);

  // Reflection
  const [reflText, setReflText] = useState("");
  const [reflConf, setReflConf] = useState(5);

  useEffect(() => {
    fetch("/api/goals").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setGoals(d); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const createGoal = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, timeframe, description, whyImportant, successLooksLike, obstacles, confidence }),
    });
    const goal = await res.json();
    if (goal.id) {
      setGoals([goal, ...goals]);
      setView("list");
      setTitle(""); setDescription(""); setWhyImportant(""); setSuccessLooksLike("");
      setObstacles([]); setConfidence(5);
    }
    setSaving(false);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const res = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const updated = await res.json();
    if (updated.id) {
      setGoals(goals.map((g) => g.id === id ? updated : g));
      setSelectedGoal(updated);
    }
  };

  const toggleAction = async (goalId: string, idx: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const newActions = goal.actions.map((a, i) => i === idx ? { ...a, done: !a.done } : a);
    const doneCount = newActions.filter((a) => a.done).length;
    const progress = newActions.length > 0 ? Math.round((doneCount / newActions.length) * 100) : 0;
    await updateGoal(goalId, { actions: newActions, progress });
  };

  const addReflection = async () => {
    if (!selectedGoal || !reflText.trim()) return;
    const newReflection: GoalReflection = { date: new Date().toISOString().slice(0, 10), text: reflText, confidence: reflConf };
    await updateGoal(selectedGoal.id, { reflections: [...selectedGoal.reflections, newReflection], confidence: reflConf });
    setReflText(""); setReflConf(selectedGoal.confidence);
  };

  const activeGoals = goals.filter((g) => g.status === "actief");
  const reachedGoals = goals.filter((g) => g.status === "bereikt");

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;

  // ══════ NEW GOAL ══════
  if (view === "new") {
    return (
      <div className="mx-auto max-w-lg">
        <button onClick={() => setView("list")} className="mb-4 text-sm text-gray-500 hover:text-white">← Terug</button>
        <h2 className="mb-1 text-xl font-black text-white">Nieuw doel stellen</h2>
        <p className="mb-5 text-xs text-gray-500">Gebruik het WOOP-framework: Wish, Outcome, Obstacle, Plan</p>

        {/* Step 1: Wish */}
        <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#c9a67a]">🌟 Wens — Wat wil je bereiken?</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv: meer zelfvertrouwen in presentaties"
            className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Beschrijf je doel in meer detail..."
            className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none" />
        </div>

        {/* Category + Timeframe */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase text-gray-500">Categorie</label>
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
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase text-gray-500">Tijdsframe</label>
            <div className="flex flex-wrap gap-1.5">
              {TIMEFRAMES.map((t) => (
                <button key={t} onClick={() => setTimeframe(t)}
                  className="rounded-full border px-2.5 py-1 text-xs"
                  style={{ borderColor: timeframe === t ? "#A67C52" : "#2a3e33", color: timeframe === t ? "#c9a67a" : "#888" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Outcome */}
        <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#7a9e7e]">✅ Uitkomst — Hoe ziet succes eruit?</label>
          <p className="mb-2 text-[10px] text-gray-600">Stel je voor dat je dit doel bereikt hebt. Wat zie je, voel je, doe je anders?</p>
          <textarea value={successLooksLike} onChange={(e) => setSuccessLooksLike(e.target.value)} rows={2}
            placeholder="Bijv: ik sta ontspannen voor een groep, mijn stem is helder..."
            className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none" />
        </div>

        {/* Why important */}
        <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#A67C52]">❤️ Waarom — Waarom is dit belangrijk voor je?</label>
          <textarea value={whyImportant} onChange={(e) => setWhyImportant(e.target.value)} rows={2}
            placeholder="Bijv: dit raakt aan mijn autonomie en gevoel van competentie..."
            className="w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 resize-none" />
        </div>

        {/* Step 3: Obstacles */}
        <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#E85D4A]">🧱 Obstakels — Wat kan in de weg staan?</label>
          <div className="mb-2 flex gap-2">
            <input value={obstacle} onChange={(e) => setObstacle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && obstacle.trim()) { setObstacles([...obstacles, obstacle.trim()]); setObstacle(""); } }}
              placeholder="Bijv: perfectionisme, tijdgebrek..."
              className="flex-1 rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
          </div>
          {obstacles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {obstacles.map((o, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-[#E85D4A]/10 px-2.5 py-1 text-xs text-[#E85D4A]">
                  {o}
                  <button onClick={() => setObstacles(obstacles.filter((_, j) => j !== i))} className="text-[10px] hover:text-white">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Confidence */}
        <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">📊 Hoe zeker ben je dat je dit kunt bereiken?</label>
          <ConfidenceBar value={confidence} onChange={setConfidence} />
        </div>

        <button onClick={createGoal} disabled={!title.trim() || saving}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
          {saving ? "Opslaan..." : "Doel opslaan"}
        </button>
      </div>
    );
  }

  // ══════ DETAIL VIEW ══════
  if (view === "detail" && selectedGoal) {
    const g = selectedGoal;
    const catInfo = CATEGORIES.find((c) => c.key === g.category);
    return (
      <div className="mx-auto max-w-lg">
        <button onClick={() => { setView("list"); setSelectedGoal(null); }} className="mb-4 text-sm text-gray-500 hover:text-white">← Terug</button>

        <div className="mb-5 flex items-start gap-4">
          <ProgressRing progress={g.progress} />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{g.title}</h2>
            <p className="text-xs text-gray-500">{catInfo?.icon} {catInfo?.label} · {g.timeframe}</p>
            {g.status === "actief" && (
              <button onClick={() => updateGoal(g.id, { status: "bereikt", progress: 100 })}
                className="mt-2 rounded-full bg-[#22c55e]/20 px-3 py-1 text-[10px] font-bold text-[#22c55e] hover:bg-[#22c55e]/30">
                ✓ Markeer als bereikt
              </button>
            )}
          </div>
        </div>

        {g.description && <div className="mb-4 rounded-xl bg-[#152620] p-3"><p className="text-xs text-gray-300">{g.description}</p></div>}

        <div className="mb-4 grid grid-cols-2 gap-3">
          {g.whyImportant && (
            <div className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3">
              <p className="mb-1 text-[9px] font-semibold uppercase text-[#A67C52]">❤️ Waarom</p>
              <p className="text-xs text-gray-300">{g.whyImportant}</p>
            </div>
          )}
          {g.successLooksLike && (
            <div className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3">
              <p className="mb-1 text-[9px] font-semibold uppercase text-[#7a9e7e]">✅ Succes</p>
              <p className="text-xs text-gray-300">{g.successLooksLike}</p>
            </div>
          )}
        </div>

        {/* Confidence */}
        <div className="mb-4 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <ConfidenceBar value={g.confidence} />
        </div>

        {/* Actions / checklist */}
        <div className="mb-4 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-500">Actiestappen</p>
          {g.actions.map((a, i) => (
            <button key={i} onClick={() => toggleAction(g.id, i)}
              className="mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-[#152620]">
              <span className={a.done ? "text-[#22c55e]" : "text-gray-600"}>{a.done ? "✅" : "⬜"}</span>
              <span className={a.done ? "text-gray-500 line-through" : "text-gray-300"}>{a.text}</span>
            </button>
          ))}
          <input placeholder="Nieuwe stap toevoegen..."
            className="mt-1 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-1.5 text-xs text-white outline-none placeholder:text-gray-600"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                const newActions = [...g.actions, { text: (e.target as HTMLInputElement).value.trim(), done: false }];
                updateGoal(g.id, { actions: newActions });
                (e.target as HTMLInputElement).value = "";
              }
            }} />
        </div>

        {/* Obstacles */}
        {g.obstacles.length > 0 && (
          <div className="mb-4 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-500">🧱 Obstakels</p>
            <div className="flex flex-wrap gap-1.5">
              {g.obstacles.map((o, i) => (
                <span key={i} className="rounded-full bg-[#E85D4A]/10 px-2.5 py-1 text-xs text-[#E85D4A]">{o}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reflection journal */}
        <div className="mb-4 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-500">📝 Reflectie-dagboek</p>
          <p className="mb-3 text-[10px] text-gray-600">Schrijf regelmatig op hoe het gaat met dit doel. Wat gaat goed? Wat kan beter?</p>

          {g.reflections.map((r, i) => (
            <div key={i} className="mb-2 rounded-lg bg-[#152620] p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-600">{r.date}</span>
                <span className="text-[10px]" style={{ color: r.confidence >= 7 ? "#22c55e" : r.confidence >= 4 ? "#c9a67a" : "#E85D4A" }}>
                  Vertrouwen: {r.confidence}/10
                </span>
              </div>
              <p className="text-xs text-gray-300">{r.text}</p>
            </div>
          ))}

          <textarea value={reflText} onChange={(e) => setReflText(e.target.value)} rows={2}
            placeholder="Hoe gaat het met dit doel? Wat heb je geleerd?"
            className="mb-2 w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 resize-none" />
          <div className="mb-2"><ConfidenceBar value={reflConf} onChange={setReflConf} /></div>
          <button onClick={addReflection} disabled={!reflText.trim()}
            className="rounded-lg bg-[#A67C52] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-30">
            Reflectie toevoegen
          </button>
        </div>
      </div>
    );
  }

  // ══════ LIST VIEW ══════
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">🎯 Mijn doelen</h1>
          <p className="text-xs text-gray-500">Stel doelen, volg voortgang en reflecteer</p>
        </div>
        <button onClick={() => setView("new")}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
          + Nieuw doel
        </button>
      </div>

      {activeGoals.length === 0 && reachedGoals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-16 text-center">
          <span className="text-3xl">🎯</span>
          <p className="mt-3 text-sm text-gray-400">Je hebt nog geen doelen.</p>
          <p className="mt-1 text-xs text-gray-600">Stel je eerste doel met het WOOP-framework.</p>
          <button onClick={() => setView("new")}
            className="mt-4 rounded-xl px-5 py-2 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
            Eerste doel stellen
          </button>
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Actieve doelen ({activeGoals.length})</p>
          <div className="space-y-2">
            {activeGoals.map((g) => {
              const cat = CATEGORIES.find((c) => c.key === g.category);
              return (
                <button key={g.id} onClick={() => { setSelectedGoal(g); setView("detail"); setReflConf(g.confidence); }}
                  className="w-full rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4 text-left transition-colors hover:border-[#A67C52]/50">
                  <div className="flex items-center gap-3">
                    <ProgressRing progress={g.progress} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{g.title}</p>
                      <p className="text-[10px] text-gray-600">{cat?.icon} {cat?.label} · {g.timeframe}</p>
                      <div className="mt-1"><ConfidenceBar value={g.confidence} /></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reached goals */}
      {reachedGoals.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">✅ Bereikt ({reachedGoals.length})</p>
          <div className="space-y-2">
            {reachedGoals.map((g) => (
              <button key={g.id} onClick={() => { setSelectedGoal(g); setView("detail"); }}
                className="w-full rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-3 text-left">
                <span className="text-sm text-[#22c55e]">✅ {g.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
