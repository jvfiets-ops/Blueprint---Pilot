"use client";
import { useState, useEffect, useCallback } from "react";
import VoiceInput from "@/components/VoiceInput";
import { useLang } from "@/hooks/useLang";

// ── Types ──────────────────────────────────────────────
interface UserOverview {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string | null;
  role: string;
  createdAt: string;
  approved: boolean;
  lastActiveAt: string | null;
  _count: { reflections: number; chatSessions: number; dailyGoals: number; routines: number };
}

interface UserDetail {
  user: { id: string; name: string; email: string };
  reflections: Array<{
    id: string; created_at: string; mood_icon: string; mood_score: number;
    event_label: string; event_reflection_text: string; ai_summary: string;
    conversation_transcript: Array<{ role: string; content: string }>;
  }>;
  chatSessions: Array<{
    id: string; created_at: string; title: string; summary: string;
    messages: Array<{ role: string; content: string }>; stressors_detected: string[];
  }>;
  dailyGoals: Array<{ id: string; date: string; text: string; category: string }>;
  personality: {
    openness: number; conscientiousness: number; extraversion: number;
    agreeableness: number; neuroticism: number;
  } | null;
}

interface AdminMessage {
  id: string;
  userId: string;
  content: string;
  fromAdmin: boolean;
  read: boolean;
  createdAt: string;
  user: { name: string; email: string | null };
}

// ── Helpers ────────────────────────────────────────────
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "toegang" | "gebruik" | "contact";

// ── Component ──────────────────────────────────────────
export default function AdminPage() {
  const [lang] = useLang();
  const nl = lang === "nl";

  const [tab, setTab] = useState<Tab>("toegang");
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gebruik tab
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Contact tab
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedConvoUser, setSelectedConvoUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // ── Fetch users ──
  const fetchUsers = useCallback(() => {
    fetch("/api/admin/users")
      .then((r) => { if (r.status === 403) throw new Error("Geen toegang"); return r.json(); })
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Fetch messages ──
  const fetchMessages = useCallback(() => {
    setLoadingMessages(true);
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .finally(() => setLoadingMessages(false));
  }, []);

  useEffect(() => { if (tab === "contact") fetchMessages(); }, [tab, fetchMessages]);

  // ── Toggle approve ──
  const toggleApprove = async (userId: string, approved: boolean) => {
    await fetch("/api/admin/approve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved }),
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, approved } : u)));
  };

  // ── Load user detail ──
  const loadUser = async (id: string) => {
    setLoadingUser(true);
    setSelectedUser(null);
    setExpandedItem(null);
    const data = await fetch(`/api/admin/users?userId=${id}`).then((r) => r.json());
    if (!data.error) setSelectedUser(data);
    setLoadingUser(false);
  };

  // ── Send reply ──
  const sendReply = async () => {
    if (!selectedConvoUser || !replyText.trim()) return;
    setSending(true);
    await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedConvoUser, content: replyText.trim() }),
    });
    setReplyText("");
    setSending(false);
    fetchMessages();
  };

  // ── Tab bar ──
  const tabs: { key: Tab; label: string }[] = [
    { key: "toegang", label: nl ? "Toegang" : "Access" },
    { key: "gebruik", label: nl ? "Gebruik" : "Usage" },
    { key: "contact", label: nl ? "Contact" : "Messages" },
  ];

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;

  // ── Group messages by user ──
  const messagesByUser: Record<string, AdminMessage[]> = {};
  messages.forEach((m) => {
    if (!messagesByUser[m.userId]) messagesByUser[m.userId] = [];
    messagesByUser[m.userId].push(m);
  });
  // Sort each conversation chronologically
  Object.values(messagesByUser).forEach((arr) => arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));

  // Unread per user (fromAdmin=false, read=false)
  const unreadByUser: Record<string, number> = {};
  messages.forEach((m) => {
    if (!m.fromAdmin && !m.read) {
      unreadByUser[m.userId] = (unreadByUser[m.userId] || 0) + 1;
    }
  });

  return (
    <div className="mx-auto max-w-5xl min-h-screen bg-[#0f1a14] p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-black text-white">Manager Dashboard</h1>
      <p className="mb-5 text-sm text-gray-500">{nl ? "Gebruikersbeheer en activiteitoverzicht" : "User management and activity overview"}</p>

      {/* ── Tab pills ── */}
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedUser(null); setSelectedConvoUser(null); }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-[#A67C52] text-white" : "bg-[#1a2e23] text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB 1: TOEGANG ═══════════════ */}
      {tab === "toegang" && (
        <div className="overflow-hidden rounded-2xl border border-[#2a3e33]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3e33] bg-[#152620] text-left text-[10px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">{nl ? "Naam" : "Name"}</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">{nl ? "Aanmelddatum" : "Sign-up date"}</th>
                <th className="px-4 py-3 text-center">{nl ? "Toegang" : "Access"}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#2a3e33]/50 bg-[#1a2e23] hover:bg-[#1f3429] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{u.email || "\u2014"}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{fmtDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleApprove(u.id, !u.approved)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        u.approved ? "bg-[#A67C52]" : "bg-[#2a3e33]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          u.approved ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-600">{nl ? "Nog geen gebruikers." : "No users yet."}</div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB 2: GEBRUIK ═══════════════ */}
      {tab === "gebruik" && !selectedUser && !loadingUser && (
        <div className="overflow-hidden rounded-2xl border border-[#2a3e33]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3e33] bg-[#152620] text-left text-[10px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">{nl ? "Naam" : "Name"}</th>
                <th className="px-4 py-3">{nl ? "Laatste bezoek" : "Last visit"}</th>
                <th className="px-4 py-3">{nl ? "Reflecties" : "Reflections"}</th>
                <th className="px-4 py-3">{nl ? "Coach sessies" : "Coach sessions"}</th>
                <th className="px-4 py-3 hidden sm:table-cell">Toolkit</th>
                <th className="px-4 py-3 hidden sm:table-cell">Routines</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => loadUser(u.id)}
                  className="border-b border-[#2a3e33]/50 bg-[#1a2e23] hover:bg-[#1f3429] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{fmtDate(u.lastActiveAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{u._count.reflections}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{u._count.chatSessions}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden sm:table-cell">{u._count.dailyGoals}</td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden sm:table-cell">{u._count.routines}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-600">{nl ? "Nog geen gebruikers." : "No users yet."}</div>
          )}
        </div>
      )}

      {tab === "gebruik" && loadingUser && (
        <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>
      )}

      {/* ── Gebruik: User detail ── */}
      {tab === "gebruik" && selectedUser && (
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => setSelectedUser(null)}
            className="mb-4 text-sm text-gray-500 hover:text-white"
          >
            &larr; {nl ? "Terug naar overzicht" : "Back to overview"}
          </button>

          {/* Header card */}
          <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
            <h3 className="text-xl font-bold text-white">{selectedUser.user.name}</h3>
            <p className="text-xs text-gray-500">{selectedUser.user.email}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { l: nl ? "Gesprekken" : "Sessions", v: selectedUser.chatSessions.length },
                { l: nl ? "Reflecties" : "Reflections", v: selectedUser.reflections.length },
                { l: nl ? "Doelen" : "Goals", v: selectedUser.dailyGoals.length },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-[#152620] p-3 text-center">
                  <div className="text-lg font-bold text-white">{s.v}</div>
                  <div className="text-[9px] text-gray-500">{s.l}</div>
                </div>
              ))}
            </div>
            {selectedUser.personality && (
              <div className="mt-4 flex gap-4 flex-wrap">
                {[
                  { l: "Openheid", v: selectedUser.personality.openness },
                  { l: "Zorgvuldig", v: selectedUser.personality.conscientiousness },
                  { l: "Extraversie", v: selectedUser.personality.extraversion },
                  { l: "Meegaand", v: selectedUser.personality.agreeableness },
                  { l: "Emotioneel", v: selectedUser.personality.neuroticism },
                ].map((t) => (
                  <div key={t.l} className="text-center">
                    <div className="text-sm font-bold text-[#c9a67a]">{t.v}%</div>
                    <div className="text-[8px] text-gray-500">{t.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily goals */}
          {selectedUser.dailyGoals.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-2 text-sm font-semibold text-gray-400">{nl ? "Doelen" : "Goals"}</h4>
              <div className="space-y-1 rounded-xl border border-[#2a3e33] bg-[#152620] p-3">
                {selectedUser.dailyGoals.slice(0, 15).map((g) => (
                  <div key={g.id} className="flex items-center justify-between py-1">
                    <span className="text-xs text-white">{g.text}</span>
                    <span className="text-[10px] text-gray-600">{g.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat sessions */}
          {selectedUser.chatSessions.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-2 text-sm font-semibold text-gray-400">{nl ? "Gesprekken" : "Sessions"}</h4>
              <div className="space-y-2">
                {selectedUser.chatSessions.map((s) => (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-[#2a3e33] bg-[#152620]">
                    <button
                      onClick={() => setExpandedItem(expandedItem === s.id ? null : s.id)}
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{s.title || "Gesprek"}</span>
                        <span className="text-[10px] text-gray-500">{fmtDate(s.created_at)}</span>
                      </div>
                      {s.summary && <p className="mt-1 text-xs text-gray-400">{s.summary}</p>}
                    </button>
                    {expandedItem === s.id && (
                      <div className="border-t border-[#2a3e33] p-3 space-y-2 max-h-80 overflow-y-auto">
                        {s.messages.map((m, i) => (
                          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className="max-w-[80%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap"
                              style={{
                                background: m.role === "user" ? "#A67C52" : "#1a2e23",
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
            </div>
          )}

          {/* Reflections */}
          {selectedUser.reflections.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-2 text-sm font-semibold text-gray-400">{nl ? "Reflecties" : "Reflections"}</h4>
              <div className="space-y-2">
                {selectedUser.reflections.map((r) => (
                  <div key={r.id} className="overflow-hidden rounded-xl border border-[#2a3e33] bg-[#152620]">
                    <button
                      onClick={() => setExpandedItem(expandedItem === r.id ? null : r.id)}
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.mood_icon}</span>
                        <span className="text-sm text-white">{r.event_label}</span>
                        <span className="ml-auto text-[10px] text-gray-500">{fmtDate(r.created_at)}</span>
                      </div>
                      {r.ai_summary && <p className="mt-1 text-xs text-gray-400">{r.ai_summary}</p>}
                    </button>
                    {expandedItem === r.id && (
                      <div className="border-t border-[#2a3e33] p-3 space-y-2 max-h-80 overflow-y-auto">
                        {r.event_reflection_text && (
                          <div className="rounded-lg bg-[#0f1a14] p-2 text-xs text-gray-300">{r.event_reflection_text}</div>
                        )}
                        {r.conversation_transcript.map((m, i) => (
                          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className="max-w-[80%] rounded-xl px-3 py-2 text-xs"
                              style={{
                                background: m.role === "user" ? "#A67C52" : "#1a2e23",
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
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ TAB 3: CONTACT ═══════════════ */}
      {tab === "contact" && loadingMessages && (
        <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>
      )}

      {tab === "contact" && !loadingMessages && !selectedConvoUser && (
        <div className="space-y-2">
          {Object.entries(messagesByUser).length === 0 && (
            <div className="py-12 text-center text-sm text-gray-600">{nl ? "Geen berichten." : "No messages."}</div>
          )}
          {Object.entries(messagesByUser).map(([uid, msgs]) => {
            const last = msgs[msgs.length - 1];
            const userName = last.user.name || last.user.email || uid;
            const hasUnread = (unreadByUser[uid] || 0) > 0;
            return (
              <button
                key={uid}
                onClick={() => setSelectedConvoUser(uid)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4 text-left hover:bg-[#1f3429] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {hasUnread && <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />}
                  <div>
                    <span className="font-medium text-white">{userName}</span>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{last.content}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 flex-shrink-0">{fmtDate(last.createdAt)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Contact: Conversation thread ── */}
      {tab === "contact" && !loadingMessages && selectedConvoUser && (
        <div className="flex flex-col">
          <button
            onClick={() => setSelectedConvoUser(null)}
            className="mb-4 text-sm text-gray-500 hover:text-white self-start"
          >
            &larr; {nl ? "Terug" : "Back"}
          </button>

          <div className="flex-1 space-y-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
            {(messagesByUser[selectedConvoUser] || []).map((m) => (
              <div key={m.id} className={`flex ${m.fromAdmin ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[75%] rounded-xl px-4 py-2 text-sm"
                  style={{
                    background: m.fromAdmin ? "#A67C52" : "#1a2e23",
                    color: m.fromAdmin ? "#fff" : "#ccc",
                  }}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className="mt-1 text-[9px] opacity-50">{fmtDate(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder={nl ? "Typ een bericht..." : "Type a message..."}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            <VoiceInput onTranscript={(t) => setReplyText((prev) => prev + t)} lang={lang} />
            <button
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
              className="rounded-lg bg-[#A67C52] px-4 py-2 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#c9a67a] transition-colors"
            >
              {sending ? "..." : nl ? "Verstuur" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
