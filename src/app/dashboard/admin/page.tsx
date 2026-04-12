"use client";
import { useState, useEffect } from "react";

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
  totalSessionDuration: number;
  loginCount: number;
  lastLogin: string | null;
  lastActivity: string | null;
  lastGoal: string | null;
  _count: { reflections: number; chatSessions: number; dailyGoals: number };
}

interface UserDetail {
  user: { id: string; name: string; email: string };
  reflections: Array<{ id: string; created_at: string; mood_icon: string; mood_score: number; event_label: string; event_reflection_text: string; ai_summary: string; conversation_transcript: Array<{ role: string; content: string }> }>;
  chatSessions: Array<{ id: string; created_at: string; title: string; summary: string; messages: Array<{ role: string; content: string }>; stressors_detected: string[] }>;
  dailyGoals: Array<{ id: string; date: string; text: string; category: string }>;
  personality: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number } | null;
  activities: Array<{ id: string; type: string; duration: number | null; created_at: string }>;
}

function formatDate(d: string) { return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }); }
function formatDateTime(d: string) { return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
function daysSince(d: string | null) {
  if (!d) return "Nooit";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return days === 0 ? "Vandaag" : days === 1 ? "Gisteren" : `${days} dagen geleden`;
}
function formatDuration(s: number | null) {
  if (!s) return "—";
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}u ${m % 60}m`;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => { if (r.status === 403) throw new Error("Geen toegang"); return r.json(); })
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const approveUser = async (userId: string, approved: boolean) => {
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved }),
    });
    setUsers(users.map((u) => u.id === userId ? { ...u, approved } : u));
  };

  const loadUser = async (id: string) => {
    setLoadingUser(true); setSelectedUser(null); setExpandedItem(null);
    const data = await fetch(`/api/admin/users?userId=${id}`).then((r) => r.json());
    if (!data.error) setSelectedUser(data);
    setLoadingUser(false);
  };

  const pending = users.filter((u) => !u.approved);
  const allUsers = users; // Show all users, not just approved
  const activeToday = allUsers.filter((u) => {
    const last = u.lastActiveAt || u.lastLogin;
    return last && (Date.now() - new Date(last).getTime()) < 86400000;
  }).length;

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;

  // ══════ USER DETAIL VIEW ══════
  if (selectedUser) {
    const totalDuration = selectedUser.activities.reduce((a, act) => a + (act.duration || 0), 0);
    return (
      <div className="mx-auto max-w-4xl">
        <button onClick={() => setSelectedUser(null)} className="mb-4 text-sm text-gray-500 hover:text-white">← Terug naar overzicht</button>
        <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <h3 className="text-xl font-bold text-white">{selectedUser.user.name}</h3>
          <p className="text-xs text-gray-500">{selectedUser.user.email}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: "Gesprekken", v: selectedUser.chatSessions.length },
              { l: "Reflecties", v: selectedUser.reflections.length },
              { l: "Doelen", v: selectedUser.dailyGoals.length },
              { l: "Totale tijd", v: formatDuration(totalDuration), accent: true },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-[#152620] p-3 text-center">
                <div className={`text-lg font-bold ${s.accent ? "text-[#c9a67a]" : "text-white"}`}>{s.v}</div>
                <div className="text-[9px] text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>
          {selectedUser.personality && (
            <div className="mt-4 flex gap-4">
              {[{l:"Openheid",v:selectedUser.personality.openness},{l:"Zorgvuldig",v:selectedUser.personality.conscientiousness},{l:"Extraversie",v:selectedUser.personality.extraversion},{l:"Meegaand",v:selectedUser.personality.agreeableness},{l:"Emotioneel",v:selectedUser.personality.neuroticism}].map(t=>(
                <div key={t.l} className="text-center"><div className="text-sm font-bold text-[#c9a67a]">{t.v}%</div><div className="text-[8px] text-gray-500">{t.l}</div></div>
              ))}
            </div>
          )}
        </div>
        {selectedUser.activities.length > 0 && (
          <div className="mb-5"><h4 className="mb-2 text-sm font-semibold text-gray-400">📅 Activiteit</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto rounded-xl border border-[#2a3e33] bg-[#152620] p-3">
              {selectedUser.activities.map(a=>(
                <div key={a.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><span className="text-xs">{a.type==="login"?"🔑":a.type==="chat"?"🧠":a.type==="reflection"?"🪞":"📝"}</span><span className="text-xs text-gray-300 capitalize">{a.type}</span>{a.duration&&<span className="text-[10px] text-[#c9a67a]">({formatDuration(a.duration)})</span>}</div>
                  <span className="text-[10px] text-gray-600">{formatDateTime(a.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedUser.dailyGoals.length > 0 && (
          <div className="mb-5"><h4 className="mb-2 text-sm font-semibold text-gray-400">🎯 Doelen</h4>
            <div className="space-y-1 rounded-xl border border-[#2a3e33] bg-[#152620] p-3">
              {selectedUser.dailyGoals.slice(0,15).map(g=>(<div key={g.id} className="flex items-center justify-between py-1"><span className="text-xs text-white">{g.text}</span><span className="text-[10px] text-gray-600">{g.date}</span></div>))}
            </div>
          </div>
        )}
        {selectedUser.chatSessions.length > 0 && (
          <div className="mb-5"><h4 className="mb-2 text-sm font-semibold text-gray-400">🧠 Gesprekken</h4>
            <div className="space-y-2">{selectedUser.chatSessions.map(s=>(
              <div key={s.id} className="overflow-hidden rounded-xl border border-[#2a3e33] bg-[#152620]">
                <button onClick={()=>setExpandedItem(expandedItem===s.id?null:s.id)} className="w-full px-4 py-3 text-left">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-white">{s.title||"Gesprek"}</span><span className="text-[10px] text-gray-500">{formatDate(s.created_at)}</span></div>
                  {s.summary&&<p className="mt-1 text-xs text-gray-400">{s.summary}</p>}
                </button>
                {expandedItem===s.id&&(<div className="border-t border-[#2a3e33] p-3 space-y-2 max-h-80 overflow-y-auto">
                  {s.messages.map((m,i)=>(<div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className="max-w-[80%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap" style={{background:m.role==="user"?"#A67C52":"#1a2e23",color:m.role==="user"?"#fff":"#ccc"}}>{m.content}</div></div>))}
                </div>)}
              </div>
            ))}</div>
          </div>
        )}
        {selectedUser.reflections.length > 0 && (
          <div className="mb-5"><h4 className="mb-2 text-sm font-semibold text-gray-400">🪞 Reflecties</h4>
            <div className="space-y-2">{selectedUser.reflections.map(r=>(
              <div key={r.id} className="overflow-hidden rounded-xl border border-[#2a3e33] bg-[#152620]">
                <button onClick={()=>setExpandedItem(expandedItem===r.id?null:r.id)} className="w-full px-4 py-3 text-left">
                  <div className="flex items-center gap-2"><span>{r.mood_icon}</span><span className="text-sm text-white">{r.event_label}</span><span className="ml-auto text-[10px] text-gray-500">{formatDate(r.created_at)}</span></div>
                  {r.ai_summary&&<p className="mt-1 text-xs text-gray-400">{r.ai_summary}</p>}
                </button>
                {expandedItem===r.id&&r.conversation_transcript.length>0&&(<div className="border-t border-[#2a3e33] p-3 space-y-2 max-h-80 overflow-y-auto">
                  {r.event_reflection_text&&<div className="rounded-lg bg-[#0f1a14] p-2 text-xs text-gray-300">{r.event_reflection_text}</div>}
                  {r.conversation_transcript.map((m:{role:string;content:string},i:number)=>(<div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className="max-w-[80%] rounded-xl px-3 py-2 text-xs" style={{background:m.role==="user"?"#A67C52":"#1a2e23",color:m.role==="user"?"#fff":"#ccc"}}>{m.content}</div></div>))}
                </div>)}
              </div>
            ))}</div>
          </div>
        )}
      </div>
    );
  }
  if (loadingUser) return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;

  // ══════ MAIN DASHBOARD ══════
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-2xl font-black text-white">👁️ Manager Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Gebruikersbeheer en activiteitoverzicht</p>

      {/* KPI */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Wachtend", value: pending.length, color: pending.length > 0 ? "#f59e0b" : "#666" },
          { label: "Totaal gebruikers", value: allUsers.length, color: "#22c55e" },
          { label: "Actief vandaag", value: activeToday, color: "#c9a67a" },
          { label: "Totaal gesprekken", value: users.reduce((a, u) => a + u._count.chatSessions, 0), color: "#7a9e7e" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
            <p className="text-[10px] uppercase tracking-wide text-gray-600">{kpi.label}</p>
            <p className="text-2xl font-extrabold" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── PENDING APPROVALS ── */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-[#f59e0b]">⏳ Wachtend op goedkeuring ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/5 p-4">
                <div>
                  <span className="font-semibold text-white">{u.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{u.email}</span>
                  <p className="mt-0.5 text-[10px] text-gray-600">Aangemeld: {formatDate(u.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveUser(u.id, true)}
                    className="rounded-lg bg-[#22c55e] px-4 py-2 text-xs font-bold text-white hover:bg-[#16a34a]"
                  >
                    ✓ Goedkeuren
                  </button>
                  <button
                    onClick={() => approveUser(u.id, false)}
                    className="rounded-lg border border-red-800 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-900/20"
                  >
                    ✕ Weigeren
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── APPROVED USERS TABLE ── */}
      <h2 className="mb-3 text-sm font-bold text-white">Alle gebruikers ({allUsers.length})</h2>
      <div className="overflow-hidden rounded-2xl border border-[#2a3e33]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a3e33] bg-[#152620] text-left text-[10px] uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Gebruiker</th>
              <th className="px-4 py-3">Laatste bezoek</th>
              <th className="px-4 py-3 hidden sm:table-cell">Logins</th>
              <th className="px-4 py-3 hidden sm:table-cell">Gesprekken</th>
              <th className="px-4 py-3 hidden md:table-cell">Reflecties</th>
              <th className="px-4 py-3 hidden md:table-cell">Doelen</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.id} className="border-b border-[#2a3e33]/50 bg-[#1a2e23] hover:bg-[#1f3429] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{u.name}</span>
                    {u.role === "admin" && <span className="rounded-full bg-[#A67C52]/20 px-1.5 py-0.5 text-[8px] text-[#c9a67a]">admin</span>}
                  </div>
                  <div className="text-[10px] text-gray-600">{u.email || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-400">{daysSince(u.lastActiveAt || u.lastLogin)}</span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-white hidden sm:table-cell">{u.loginCount || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-300 hidden sm:table-cell">{u._count.chatSessions}</td>
                <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">{u._count.reflections}</td>
                <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">{u._count.dailyGoals}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => loadUser(u.id)}
                    className="rounded-lg border border-[#A67C52]/30 px-2.5 py-1 text-[10px] font-medium text-[#c9a67a] hover:bg-[#A67C52]/10">
                    Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allUsers.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-600">Nog geen gebruikers.</div>
        )}
      </div>
    </div>
  );
}
