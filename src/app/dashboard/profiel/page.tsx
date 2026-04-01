"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Profile {
  context: string;
  best_version_name: string;
  best_version_description: string;
  best_version_keywords: string[];
  best_version_codewords: string[];
  worst_version_name: string;
  worst_version_description: string;
}
interface RoleModel { name: string; domain: string; emoji: string; why_inspiring: string; qualities_to_adopt: string[]; }
interface Mentor { name: string; role: string; emoji: string; whatTheyTeachMe: string; keyLessons: string[]; }
interface Personality { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number; }
interface Memory { summary: string; recurring_stressors: string[]; behavioral_signals: string[]; mood_patterns: string[]; }
interface Goal { date: string; text: string; category: string; }
interface Reflection { created_at: string; mood_icon: string; mood_score: number; event_label: string; ai_summary: string; }

interface Data {
  personality: Personality | null;
  profiles: Profile[];
  roleModels: RoleModel[];
  mentors: Mentor[];
  memory: Memory | null;
  recentGoals: Goal[];
  recentReflections: Reflection[];
}

const TRAIT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  openness: { label: "Openheid", icon: "🎨", color: "#A67C52" },
  conscientiousness: { label: "Zorgvuldigheid", icon: "📋", color: "#6b8f71" },
  extraversion: { label: "Extraversie", icon: "⚡", color: "#c9a67a" },
  agreeableness: { label: "Meegaandheid", icon: "🤝", color: "#7a9e7e" },
  neuroticism: { label: "Emotioneel", icon: "🧘", color: "#8b6f47" },
};

const CONTEXT_LABELS: Record<string, string> = { training: "Training", wedstrijd: "Wedstrijd", algemeen: "Algemeen" };

function EmptyCard({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-dashed border-[#2a3e33] p-5 text-center transition-colors hover:border-[#A67C52]/50 block">
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-sm font-semibold text-gray-400">{title}</p>
      <p className="mt-1 text-[10px] text-gray-600">{desc}</p>
    </Link>
  );
}

export default function PersoonlijkDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/persoonlijk")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;
  if (!data) return <div className="p-8 text-red-400">Kon data niet laden.</div>;

  const hasContent = data.personality || data.profiles.length > 0 || data.roleModels.length > 0 || data.mentors.length > 0 || data.memory;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-black text-white">🏛️ Persoonlijk Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Jouw complete profiel in één overzicht</p>

      {!hasContent && (
        <div className="mb-6 rounded-2xl border border-[#A67C52]/30 bg-[#A67C52]/5 p-5 text-center">
          <p className="text-sm text-gray-300">Je hebt nog geen tools ingevuld. Begin met een van de onderdelen hieronder.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">

        {/* ── PERSOONLIJKHEID ── */}
        {data.personality ? (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">🧬 Persoonlijkheidsprofiel</h2>
              <Link href="/dashboard/toolkit/persoonlijkheid" className="text-[10px] text-[#c9a67a] hover:underline">Bekijk →</Link>
            </div>
            <div className="space-y-2">
              {Object.entries(data.personality).map(([key, val]) => {
                const t = TRAIT_LABELS[key];
                if (!t) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{t.icon} {t.label}</span>
                      <span className="text-xs font-bold" style={{ color: t.color }}>{val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#2a3e33]">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, background: t.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyCard title="Persoonlijkheid" desc="Ontdek je Big 5 profiel" href="/dashboard/toolkit/persoonlijkheid" icon="🧬" />
        )}

        {/* ── BESTE VERSIE ── */}
        {data.profiles.length > 0 ? (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">⭐ Beste versie van mezelf</h2>
              <Link href="/dashboard/toolkit/beste-versie" className="text-[10px] text-[#c9a67a] hover:underline">Bewerk →</Link>
            </div>
            {data.profiles.map((p) => (
              <div key={p.context} className="mb-3 last:mb-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">{CONTEXT_LABELS[p.context] || p.context}</p>
                {p.best_version_name && (
                  <div className="mb-1.5 rounded-xl bg-[#152620] p-3">
                    <p className="text-sm font-semibold text-[#c9a67a]">{p.best_version_name}</p>
                    {p.best_version_description && <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p.best_version_description}</p>}
                    {p.best_version_codewords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.best_version_codewords.map((w) => (
                          <span key={w} className="rounded-full bg-[#A67C52]/20 px-2 py-0.5 text-[9px] font-bold text-[#c9a67a]">{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {p.worst_version_name && (
                  <div className="rounded-xl bg-[#152620] p-3">
                    <p className="text-sm font-semibold text-red-400/80">{p.worst_version_name}</p>
                    {p.worst_version_description && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{p.worst_version_description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyCard title="Beste versie" desc="Definieer je ideale prestatieprofiel" href="/dashboard/toolkit/beste-versie" icon="⭐" />
        )}

        {/* ── ROLMODELLEN ── */}
        {data.roleModels.length > 0 ? (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">🌟 Rolmodellen</h2>
              <Link href="/dashboard/toolkit/rolmodellen" className="text-[10px] text-[#c9a67a] hover:underline">Bekijk →</Link>
            </div>
            <div className="space-y-2">
              {data.roleModels.map((m) => (
                <div key={m.name} className="flex items-start gap-3 rounded-xl bg-[#152620] p-3">
                  <span className="text-xl">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{m.name}</p>
                    {m.domain && <p className="text-[10px] text-gray-600">{m.domain}</p>}
                    {m.qualities_to_adopt.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {m.qualities_to_adopt.map((q) => (
                          <span key={q} className="rounded-full bg-[#7a9e7e]/20 px-2 py-0.5 text-[9px] text-[#7a9e7e]">{q}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyCard title="Rolmodellen" desc="Wie inspireert jou?" href="/dashboard/toolkit/rolmodellen" icon="🌟" />
        )}

        {/* ── MENTOREN ── */}
        {data.mentors.length > 0 ? (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">🧭 Mentoren</h2>
              <Link href="/dashboard/toolkit/mentoren" className="text-[10px] text-[#c9a67a] hover:underline">Bekijk →</Link>
            </div>
            <div className="space-y-2">
              {data.mentors.map((m) => (
                <div key={m.name} className="flex items-start gap-3 rounded-xl bg-[#152620] p-3">
                  <span className="text-xl">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{m.name}</p>
                    {m.role && <p className="text-[10px] text-gray-600">{m.role}</p>}
                    {m.keyLessons.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {m.keyLessons.map((l) => (
                          <span key={l} className="rounded-full bg-[#A67C52]/15 px-2 py-0.5 text-[9px] text-[#c9a67a]">{l}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyCard title="Mentoren" desc="Wie begeleidt jou?" href="/dashboard/toolkit/mentoren" icon="🧭" />
        )}

        {/* ── AI COACH INZICHTEN ── */}
        {data.memory ? (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">🧠 Coach inzichten</h2>
              <Link href="/dashboard/profiel" className="text-[10px] text-[#c9a67a] hover:underline">Geschiedenis →</Link>
            </div>
            {data.memory.summary && (
              <p className="mb-3 text-xs leading-relaxed text-gray-300">{data.memory.summary}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {data.memory.recurring_stressors.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase text-gray-600">Stressoren</p>
                  <div className="flex flex-wrap gap-1">
                    {data.memory.recurring_stressors.map((s) => (
                      <span key={s} className="rounded-full bg-red-900/20 px-2 py-0.5 text-[9px] text-red-400">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.memory.behavioral_signals.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase text-gray-600">Gedragspatronen</p>
                  <div className="flex flex-wrap gap-1">
                    {data.memory.behavioral_signals.map((s) => (
                      <span key={s} className="rounded-full bg-[#A67C52]/15 px-2 py-0.5 text-[9px] text-[#c9a67a]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.memory.mood_patterns.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase text-gray-600">Stemmingspatronen</p>
                  <div className="flex flex-wrap gap-1">
                    {data.memory.mood_patterns.map((p) => (
                      <span key={p} className="rounded-full bg-[#7a9e7e]/20 px-2 py-0.5 text-[9px] text-[#7a9e7e]">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ── RECENTE DOELEN ── */}
        {data.recentGoals.length > 0 && (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <h2 className="mb-3 text-sm font-bold text-white">🎯 Recente doelen</h2>
            <div className="space-y-1.5">
              {data.recentGoals.slice(0, 5).map((g, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-[#152620] px-3 py-2">
                  <span className="text-xs text-gray-300">{g.text}</span>
                  <span className="text-[9px] text-gray-600">{g.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECENTE REFLECTIES ── */}
        {data.recentReflections.length > 0 && (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">🪞 Recente reflecties</h2>
              <Link href="/dashboard/profiel" className="text-[10px] text-[#c9a67a] hover:underline">Alles →</Link>
            </div>
            <div className="space-y-1.5">
              {data.recentReflections.map((r, i) => (
                <div key={i} className="rounded-lg bg-[#152620] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{r.mood_icon}</span>
                    <span className="text-xs font-medium text-white">{r.event_label}</span>
                    <span className="ml-auto text-[9px] text-gray-600">{new Date(r.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                  </div>
                  {r.ai_summary && <p className="mt-1 text-[10px] text-gray-500 line-clamp-1">{r.ai_summary}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
