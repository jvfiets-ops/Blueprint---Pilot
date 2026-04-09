"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";

interface RoutineLog { id: string; datum: string; status: string; }
interface Routine { id: string; naam: string; categorie: string; tijdstip: string; frequentie: string; isHelpend: boolean | null; logs: RoutineLog[]; }

const TIJDSTIP_ORDER = ["OCHTEND", "MIDDAG", "AVOND", "NACHT", "FLEXIBEL"];
const TIJDSTIP_LABELS: Record<string, { nl: string; en: string; icon: string }> = {
  OCHTEND: { nl: "Ochtend", en: "Morning", icon: "🌅" },
  MIDDAG: { nl: "Middag", en: "Afternoon", icon: "☀️" },
  AVOND: { nl: "Avond", en: "Evening", icon: "🌙" },
  NACHT: { nl: "Nacht", en: "Night", icon: "😴" },
  FLEXIBEL: { nl: "Flexibel", en: "Flexible", icon: "⏰" },
};

export default function RoutinesPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  const [routines, setRoutines] = useState<Routine[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fetch("/api/routines").then(r => r.json()).then(d => { if (Array.isArray(d)) setRoutines(d); }).catch(() => {});
  }, []);

  const toggleCheck = async (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    const todayLog = routine.logs.find(l => l.datum === today);
    const newStatus = todayLog?.status === "VOLTOOID" ? "OVERGESLAGEN" : "VOLTOOID";
    await fetch("/api/routine-logs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId, datum: today, status: newStatus }),
    });
    setRoutines(routines.map(r => r.id === routineId ? {
      ...r, logs: todayLog
        ? r.logs.map(l => l.datum === today ? { ...l, status: newStatus } : l)
        : [...r.logs, { id: "temp", datum: today, status: newStatus }]
    } : r));
  };

  const grouped = TIJDSTIP_ORDER.map(t => ({
    tijdstip: t,
    ...TIJDSTIP_LABELS[t],
    routines: routines.filter(r => r.tijdstip === t),
  })).filter(g => g.routines.length > 0);

  const completedToday = routines.filter(r => r.logs.some(l => l.datum === today && l.status === "VOLTOOID")).length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">🔄 {nl ? "Routines" : "Routines"}</h1>
          <p className="text-xs text-gray-500">{today} — {completedToday}/{routines.length} {nl ? "voltooid" : "completed"}</p>
        </div>
        <Link href="/dashboard/routines/nieuw" className="rounded-xl bg-[#A67C52] px-4 py-2 text-xs font-bold text-white">+ {nl ? "Nieuw" : "New"}</Link>
      </div>

      {routines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] p-8 text-center">
          <p className="mb-3 text-sm text-gray-500">{nl ? "Nog geen routines. Maak je eerste aan." : "No routines yet. Create your first."}</p>
          <Link href="/dashboard/routines/nieuw" className="rounded-xl bg-[#A67C52] px-6 py-2.5 text-sm font-bold text-white">{nl ? "Routine aanmaken" : "Create routine"}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(g => (
            <section key={g.tijdstip}>
              <h2 className="mb-2 text-xs font-bold text-gray-500">{g.icon} {nl ? g.nl : g.en}</h2>
              <div className="space-y-1.5">
                {g.routines.map(r => {
                  const todayLog = r.logs.find(l => l.datum === today);
                  const done = todayLog?.status === "VOLTOOID";
                  return (
                    <div key={r.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${done ? "border-[#7a9e7e]/30 bg-[#7a9e7e]/5" : "border-[#2a3e33] bg-[#1a2e23]"}`}>
                      <button onClick={() => toggleCheck(r.id)}
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${done ? "border-[#7a9e7e] bg-[#7a9e7e] text-white" : "border-[#2a3e33] text-gray-600 hover:border-[#A67C52]"}`}>
                        {done ? "✓" : ""}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${done ? "text-gray-500 line-through" : "text-white"}`}>{r.naam}</p>
                        <div className="flex gap-1.5">
                          <span className="text-[9px] text-gray-600">{r.categorie}</span>
                          {r.isHelpend === true && <span className="text-[9px] text-[#7a9e7e]">✓ {nl ? "helpend" : "helpful"}</span>}
                          {r.isHelpend === false && <span className="text-[9px] text-[#E85D4A]">⚠ {nl ? "belemmerend" : "hindering"}</span>}
                        </div>
                      </div>
                      {/* Last 7 days mini chips */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: 7 }, (_, i) => {
                          const d = new Date(); d.setDate(d.getDate() - (6 - i));
                          const dateStr = d.toISOString().slice(0, 10);
                          const log = r.logs.find(l => l.datum === dateStr);
                          return <div key={i} className={`h-2 w-2 rounded-full ${log?.status === "VOLTOOID" ? "bg-[#7a9e7e]" : log?.status === "OVERGESLAGEN" ? "bg-[#E85D4A]/40" : "bg-[#2a3e33]"}`} />;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
