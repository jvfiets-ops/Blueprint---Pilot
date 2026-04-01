"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ChatSession {
  id: string;
  created_at: string;
  title: string;
  summary: string;
  messages: Array<{ role: string; content: string }>;
  stressors_detected: string[];
  themes: string[];
}

interface PatternData {
  themes: Record<string, number>;
  stressors: Record<string, number>;
  totalSessions: number;
  totalMessages: number;
}

export default function MentaalGeschiedenisPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [patterns, setPatterns] = useState<PatternData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"patronen" | "gesprekken">("patronen");

  useEffect(() => {
    fetch("/api/chat-sessions")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setSessions(data);

        // Build pattern analysis
        const themes: Record<string, number> = {};
        const stressors: Record<string, number> = {};
        let totalMessages = 0;

        data.forEach((s: ChatSession) => {
          totalMessages += s.messages?.length || 0;
          (s.themes || []).forEach((t: string) => {
            themes[t] = (themes[t] || 0) + 1;
          });
          (s.stressors_detected || []).forEach((st: string) => {
            stressors[st] = (stressors[st] || 0) + 1;
          });
        });

        setPatterns({
          themes,
          stressors,
          totalSessions: data.length,
          totalMessages,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sortedThemes = patterns
    ? Object.entries(patterns.themes).sort((a, b) => b[1] - a[1])
    : [];
  const sortedStressors = patterns
    ? Object.entries(patterns.stressors).sort((a, b) => b[1] - a[1])
    : [];
  const maxThemeCount = sortedThemes[0]?.[1] || 1;
  const maxStressorCount = sortedStressors[0]?.[1] || 1;

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">🧠 Gespreksgeschiedenis</h2>
          <p className="text-xs text-gray-500">Patronen en thema&apos;s uit je coaching-gesprekken</p>
        </div>
        <Link
          href="/dashboard/stressoren/mentaal"
          className="rounded-xl border border-[#2a3e33] px-3 py-1.5 text-xs text-gray-400 hover:text-white"
        >
          ← Terug naar coach
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {([
          { key: "patronen" as const, label: "📊 Patronen & Thema's" },
          { key: "gesprekken" as const, label: "💬 Gesprekken" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: tab === t.key ? "#A67C52" : "#1a2e23",
              color: tab === t.key ? "#fff" : "#9ca3af",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-16 text-center">
          <p className="mb-2 text-2xl">🧠</p>
          <p className="text-sm text-gray-500">Nog geen gesprekken gevoerd.</p>
          <Link
            href="/dashboard/stressoren/mentaal"
            className="mt-3 inline-block rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
          >
            Start je eerste gesprek
          </Link>
        </div>
      )}

      {/* Patronen tab */}
      {tab === "patronen" && sessions.length > 0 && (
        <>
          {/* Stats */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
              <p className="text-[10px] uppercase text-gray-500">Totaal gesprekken</p>
              <p className="text-2xl font-extrabold text-white">{patterns?.totalSessions}</p>
            </div>
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
              <p className="text-[10px] uppercase text-gray-500">Berichten uitgewisseld</p>
              <p className="text-2xl font-extrabold text-[#c9a67a]">{patterns?.totalMessages}</p>
            </div>
          </div>

          {/* Themes */}
          {sortedThemes.length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Gespreksthema&apos;s</h3>
              <p className="mb-4 text-[10px] text-gray-500">
                Hoe vaker een thema terugkomt, hoe breder de balk. Dit laat zien waar je focus ligt.
              </p>
              <div className="space-y-2.5">
                {sortedThemes.map(([theme, count]) => (
                  <div key={theme}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-white capitalize">{theme}</span>
                      <span className="text-[10px] text-gray-500">{count}x</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#2a3e33]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(count / maxThemeCount) * 100}%`,
                          background: "linear-gradient(90deg, #1C3D2E, #A67C52)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stressors */}
          {sortedStressors.length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Herkende stressoren</h3>
              <p className="mb-4 text-[10px] text-gray-500">
                Bronnen van stress die de AI herkent in je gesprekken. Bewustzijn is de eerste stap.
              </p>
              <div className="flex flex-wrap gap-2">
                {sortedStressors.map(([stressor, count]) => (
                  <div
                    key={stressor}
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      borderColor: count >= 3 ? "#A67C52" : "#2a3e33",
                      background: count >= 3 ? "#A67C52/15" : "transparent",
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: count >= 3 ? "#c9a67a" : "#aaa" }}>
                      {stressor}
                    </span>
                    <span className="ml-1.5 text-[10px] text-gray-600">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedThemes.length === 0 && sortedStressors.length === 0 && (
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-8 text-center">
              <p className="text-sm text-gray-500">
                Na een paar gesprekken verschijnen hier patronen en thema&apos;s.
              </p>
            </div>
          )}
        </>
      )}

      {/* Gesprekken tab */}
      {tab === "gesprekken" && sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-[#2a3e33] bg-[#1a2e23]">
              <button
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="w-full px-4 py-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{s.title || "Gesprek"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">
                      {new Date(s.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </span>
                    <span className="text-xs text-gray-600">{expandedId === s.id ? "▲" : "▼"}</span>
                  </div>
                </div>
                {s.summary && (
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">{s.summary}</p>
                )}
                {(s.themes?.length > 0 || s.stressors_detected?.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.themes?.map((t) => (
                      <span key={t} className="rounded-full bg-[#A67C52]/15 px-2 py-0.5 text-[9px] font-semibold text-[#c9a67a]">
                        {t}
                      </span>
                    ))}
                    {s.stressors_detected?.map((st) => (
                      <span key={st} className="rounded-full bg-red-900/20 px-2 py-0.5 text-[9px] text-red-400">
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              {expandedId === s.id && (
                <div className="border-t border-[#2a3e33] p-3 space-y-2 max-h-96 overflow-y-auto">
                  {s.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-relaxed"
                        style={{
                          background: m.role === "user" ? "#A67C52" : "#152620",
                          color: m.role === "user" ? "#fff" : "#ccc",
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
