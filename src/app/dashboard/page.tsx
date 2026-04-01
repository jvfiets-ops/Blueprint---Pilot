"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "mentaal", icon: "🧠", label: "Mentaal", href: "/dashboard/coach", color: "#A67C52" },
  { id: "fysiek", icon: "⚡", label: "Fysiek", href: "/dashboard/toolkit", color: "#c9a67a" },
  { id: "leefstijl", icon: "🌿", label: "Leefstijl", href: "/dashboard/toolkit", color: "#6b8f71" },
  { id: "omgeving", icon: "🏠", label: "Omgeving", href: "/dashboard/toolkit/omgeving", color: "#7a9e7e" },
];

interface DailyGoal {
  id: string;
  date: string;
  text: string;
  category: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [goalText, setGoalText] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [todayGoal, setTodayGoal] = useState<DailyGoal | null>(null);
  const [recentGoals, setRecentGoals] = useState<DailyGoal[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/daily-goals")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setRecentGoals(data);
        const today = new Date().toISOString().slice(0, 10);
        const existing = data.find((g: DailyGoal) => g.date === today);
        if (existing) {
          setTodayGoal(existing);
          setGoalText(existing.text);
          setSelectedCat(existing.category);
        }
      })
      .catch(() => {});
  }, []);

  const saveGoal = async () => {
    if (!goalText.trim()) return;
    setSaving(true);
    const category = selectedCat || "algemeen";
    const res = await fetch("/api/daily-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: goalText.trim(), category }),
    });
    const goal = await res.json();
    setTodayGoal(goal);
    setSaving(false);

    // Navigate to the relevant module
    const cat = CATEGORIES.find((c) => c.id === category);
    if (cat) {
      router.push(cat.href);
    }
  };

  // Recurring goals visualization
  const goalCounts: Record<string, number> = {};
  recentGoals.forEach((g) => {
    goalCounts[g.category] = (goalCounts[g.category] || 0) + 1;
  });

  return (
    <div className="mx-auto max-w-2xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-extrabold text-white">
          {todayGoal ? "Je doel voor vandaag" : "Wat is je doel voor vandaag?"}
        </h1>
        <p className="text-sm text-gray-400">
          {todayGoal
            ? "Je kunt je doel bijwerken of direct aan de slag gaan."
            : "Kies een focus of typ je eigen doel. We sturen je naar het juiste onderdeel."}
        </p>
      </div>

      {/* Category cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            className="flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all"
            style={{
              borderColor: selectedCat === cat.id ? cat.color : "#2a3e33",
              background: selectedCat === cat.id ? cat.color + "15" : "#1a2e23",
            }}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-xs font-semibold" style={{ color: selectedCat === cat.id ? cat.color : "#9ca3af" }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Goal text input */}
      <div className="mb-5">
        <textarea
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          placeholder="Beschrijf je doel voor vandaag..."
          rows={3}
          className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#152620] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
        />
      </div>

      <button
        onClick={saveGoal}
        disabled={!goalText.trim() || saving}
        className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-30"
        style={{ background: goalText.trim() ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}
      >
        {saving ? "Opslaan..." : todayGoal ? "Bijwerken & Ga verder" : "Opslaan & Ga aan de slag →"}
      </button>

      {/* Recent goals visualization */}
      {recentGoals.length > 1 && (
        <div className="mt-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Terugkerende thema&apos;s (laatste 30 dagen)
          </h3>
          <div className="flex gap-2">
            {Object.entries(goalCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => {
                const info = CATEGORIES.find((c) => c.id === cat);
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                    style={{ background: (info?.color || "#A67C52") + "22" }}
                  >
                    <span className="text-sm">{info?.icon || "📌"}</span>
                    <span className="text-xs font-medium" style={{ color: info?.color || "#c9a67a" }}>
                      {info?.label || cat}
                    </span>
                    <span className="text-[10px] text-gray-500">×{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
