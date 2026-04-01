"use client";
import { useState } from "react";

interface HistoryItem {
  id: string;
  type: "reflection" | "chat";
  created_at: string;
  mood_icon: string;
  mood_score: number;
  event_label: string;
  conversation_transcript: { role: string; content: string }[];
  event_reflection_text: string;
  ai_summary: string;
  title: string;
}

export default function GeschiedenisClient({ items }: { items: HistoryItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-4 text-2xl font-extrabold text-white">🕐 Geschiedenis</h1>
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-16 text-center text-sm text-gray-600">
          Nog geen sessies. Start een reflectie of gesprek!
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-extrabold text-white">🕐 Geschiedenis</h1>
      {items.map((r) => {
        const isOpen = open === r.id;
        const date = new Date(r.created_at);
        const dateStr = date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
        const isChat = r.type === "chat";

        return (
          <div key={r.id} className="mb-2 overflow-hidden rounded-2xl border border-[#2a3e33] bg-[#1a2e23]">
            <button
              onClick={() => setOpen(isOpen ? null : r.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="text-2xl">{r.mood_icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white capitalize">
                  {isChat ? r.title : dateStr}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {isChat ? (
                    <>
                      <span className="rounded-full bg-[#1C3D2E] px-1.5 py-0.5 text-[9px] text-[#c9a67a]">Gesprek</span>
                      <span>{dateStr}</span>
                    </>
                  ) : (
                    <>
                      <span>Score {r.mood_score}/10</span>
                      <span>·</span>
                      <span>{r.event_label}</span>
                    </>
                  )}
                </div>
              </div>
              {r.ai_summary && (
                <span className="rounded-full bg-[#A67C5222] px-2 py-0.5 text-[9px] text-[#c9a67a]">
                  AI samenvatting
                </span>
              )}
              <span className="text-xs text-gray-600">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className="space-y-4 border-t border-[#2a3e33] px-4 pb-4 pt-3">
                {r.ai_summary && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-[#c9a67a]">
                      AI Samenvatting
                    </p>
                    <p className="text-sm leading-relaxed text-gray-300">{r.ai_summary}</p>
                  </div>
                )}
                {r.event_reflection_text && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">Reflectie</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-400">
                      {r.event_reflection_text}
                    </p>
                  </div>
                )}
                {r.conversation_transcript?.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase text-gray-500">
                      Transcript ({r.conversation_transcript.length} berichten)
                    </p>
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {r.conversation_transcript.map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed"
                            style={{
                              background: m.role === "user" ? "#A67C5233" : "#2a3e33",
                              color: "#e5e7eb",
                            }}
                          >
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
