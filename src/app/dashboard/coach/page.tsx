"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Tab = "coaching" | "oefenen";
interface Msg { role: "user" | "assistant"; content: string; feedback?: string; }
type ConvType = "intern" | "extern";
type PracticeStep = "setup" | "chat" | "debrief";

const EXTERN_PRESETS = [
  "Salarisonderhandeling met je manager",
  "Feedback geven aan een collega",
  "Grenzen stellen bij je leidinggevende",
  "Slecht nieuws overbrengen",
  "Confrontatie met een teamgenoot",
];
const INTERN_PRESETS = [
  "Omgaan met faalangst",
  "Imposter syndrome: 'ik hoor hier niet'",
  "Perfectionisme: 'het is nooit goed genoeg'",
  "Vergelijken met anderen",
];
const TRAIT_PRESETS = [
  "Raakt snel gefrustreerd", "Afwijzend en kort", "Emotioneel en defensief",
  "Rationeel en koel", "Dominant en intimiderend", "Passief-agressief",
];

export default function CoachPage() {
  const [tab, setTab] = useState<Tab>("coaching");

  // ═══ COACHING STATE ═══
  const [coachMsgs, setCoachMsgs] = useState<Msg[]>([]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const coachEndRef = useRef<HTMLDivElement>(null);

  // ═══ PRACTICE STATE ═══
  const [practiceStep, setPracticeStep] = useState<PracticeStep>("setup");
  const [convType, setConvType] = useState<ConvType>("extern");
  const [scenario, setScenario] = useState("");
  const [customScenario, setCustomScenario] = useState("");
  const [goal, setGoal] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [practiceMsgs, setPracticeMsgs] = useState<Msg[]>([]);
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceLoading, setPracticeLoading] = useState(false);
  const practiceEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { coachEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [coachMsgs]);
  useEffect(() => { practiceEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [practiceMsgs]);

  // Auto-greeting
  useEffect(() => {
    if (coachMsgs.length === 0) {
      setCoachMsgs([{ role: "assistant", content: "Hoi! Waar kan ik je vandaag mee helpen? Vertel me wat je bezighoudt — ik luister." }]);
    }
  }, []);

  // ═══ COACHING FUNCTIONS ═══
  const sendCoachMsg = async () => {
    if (!coachInput.trim() || coachLoading) return;
    const userMsg: Msg = { role: "user", content: coachInput.trim() };
    const newMsgs = [...coachMsgs, userMsg];
    setCoachMsgs(newMsgs); setCoachInput(""); setCoachLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }) });
      if (res.status === 429) { setCoachMsgs([...newMsgs, { role: "assistant", content: "Demo limiet bereikt. Ga naar Instellingen → AI Provider om je eigen API key toe te voegen." }]); return; }
      if (!res.ok) { setCoachMsgs([...newMsgs, { role: "assistant", content: "AI is momenteel niet beschikbaar." }]); return; }
      const reader = res.body?.getReader(); if (!reader) return;
      const decoder = new TextDecoder(); let reply = "";
      setCoachMsgs([...newMsgs, { role: "assistant", content: "" }]);
      while (true) { const { done, value } = await reader.read(); if (done) break; reply += decoder.decode(value, { stream: true }); setCoachMsgs([...newMsgs, { role: "assistant", content: reply }]); }
    } finally { setCoachLoading(false); }
  };

  const saveSession = async () => {
    if (coachMsgs.length < 3) return;
    setSessionSaved(true);
    const title = coachMsgs.find(m => m.role === "user")?.content.slice(0, 50) || "Gesprek";
    await fetch("/api/chat-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, messages: coachMsgs.map(m => ({ role: m.role, content: m.content })) }) }).catch(() => {});
    await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: coachMsgs.map(m => ({ role: m.role, content: m.content })) }) }).catch(() => {});
  };

  const newCoachSession = () => { setCoachMsgs([{ role: "assistant", content: "Nieuw gesprek. Waar wil je het over hebben?" }]); setSessionSaved(false); };

  // ═══ PRACTICE FUNCTIONS ═══
  const activeScenario = customScenario.trim() || scenario;
  const startPractice = () => {
    const intro = convType === "intern"
      ? `[Innerlijke stem]\n\nOké... laten we eerlijk zijn. Ben je hier echt klaar voor?`
      : `[${activeScenario}]\n\nGoed. Wat wilde je bespreken?`;
    setPracticeMsgs([{ role: "assistant", content: intro }]); setPracticeStep("chat");
  };

  const sendPracticeMsg = async () => {
    if (!practiceInput.trim() || practiceLoading) return;
    const userMsg: Msg = { role: "user", content: practiceInput.trim() };
    const newMsgs = [...practiceMsgs, userMsg];
    setPracticeMsgs(newMsgs); setPracticeInput(""); setPracticeLoading(true);
    try {
      const res = await fetch("/api/practice-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), type: convType, scenario: activeScenario, goal, traits: traits.join(", ") }) });
      if (!res.ok) { setPracticeMsgs([...newMsgs, { role: "assistant", content: "AI niet beschikbaar." }]); return; }
      const reader = res.body?.getReader(); if (!reader) return;
      const decoder = new TextDecoder(); let reply = "";
      setPracticeMsgs([...newMsgs, { role: "assistant", content: "" }]);
      while (true) { const { done, value } = await reader.read(); if (done) break; reply += decoder.decode(value, { stream: true });
        const feedbackMatch = reply.match(/\[FEEDBACK\]\s*([\s\S]*?)$/);
        const mainContent = reply.replace(/\[FEEDBACK\][\s\S]*$/, "").trim();
        setPracticeMsgs([...newMsgs, { role: "assistant", content: mainContent, feedback: feedbackMatch?.[1]?.trim() }]);
      }
    } finally { setPracticeLoading(false); }
  };

  const resetPractice = () => { setPracticeStep("setup"); setPracticeMsgs([]); setScenario(""); setCustomScenario(""); setGoal(""); setTraits([]); };

  // ═══ RENDER ═══
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      {/* Tab bar */}
      <div className="mb-4 flex items-center gap-2">
        {([{ key: "coaching" as Tab, label: "💬 Coaching" }, { key: "oefenen" as Tab, label: "🎭 Gesprek oefenen" }]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: tab === t.key ? "#A67C52" : "#1a2e23", color: tab === t.key ? "#fff" : "#9ca3af" }}>
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        {tab === "coaching" && (
          <Link href="/dashboard/profiel" className="text-[10px] text-gray-500 hover:text-[#c9a67a]">
            📊 Geschiedenis
          </Link>
        )}
      </div>

      {/* ═══ COACHING TAB ═══ */}
      {tab === "coaching" && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">AI-begeleiding op basis van SDT & CGT</p>
            <div className="flex gap-2">
              {coachMsgs.length > 3 && !sessionSaved && (
                <button onClick={saveSession} className="rounded-lg border border-[#A67C52]/30 px-3 py-1 text-[10px] text-[#c9a67a] hover:bg-[#A67C52]/10">Opslaan</button>
              )}
              <button onClick={newCoachSession} className="rounded-lg border border-[#2a3e33] px-3 py-1 text-[10px] text-gray-400 hover:text-white">Nieuw</button>
            </div>
          </div>
          {sessionSaved && <div className="mb-2 rounded-lg bg-[#A67C52]/10 px-3 py-1.5 text-[10px] text-[#c9a67a]">✓ Sessie opgeslagen</div>}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
            <div className="flex flex-col gap-3">
              {coachMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{ background: m.role === "user" ? "#A67C52" : "#1a2e23", color: m.role === "user" ? "#fff" : "#e5e7eb",
                      borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>
                    {m.content || "..."}
                  </div>
                </div>
              ))}
              {coachLoading && <div className="flex"><div className="rounded-2xl bg-[#1a2e23] px-4 py-2.5 text-sm text-gray-500 animate-pulse">Denkt na...</div></div>}
              <div ref={coachEndRef} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <input value={coachInput} onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendCoachMsg(); } }}
              placeholder="Typ je bericht..." className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
            <button onClick={sendCoachMsg} disabled={!coachInput.trim() || coachLoading}
              className="rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-30"
              style={{ background: coachInput.trim() && !coachLoading ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}>→</button>
          </div>
        </>
      )}

      {/* ═══ PRACTICE TAB ═══ */}
      {tab === "oefenen" && practiceStep === "setup" && (
        <div className="mx-auto w-full max-w-lg overflow-y-auto">
          <div className="mb-4 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-2.5">
            <p className="text-[10px] text-[#22c55e]">🔒 Veilige oefenomgeving — alles blijft privé</p>
          </div>
          <div className="mb-4 flex gap-2">
            {([{ key: "extern" as ConvType, label: "🗣️ Extern" }, { key: "intern" as ConvType, label: "🧠 Intern" }]).map(t => (
              <button key={t.key} onClick={() => { setConvType(t.key); setScenario(""); setCustomScenario(""); }}
                className="flex-1 rounded-xl border p-2.5 text-sm"
                style={{ borderColor: convType === t.key ? "#A67C52" : "#2a3e33", color: convType === t.key ? "#c9a67a" : "#aaa" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="mb-3 flex flex-col gap-1">
            {(convType === "intern" ? INTERN_PRESETS : EXTERN_PRESETS).map(p => (
              <button key={p} onClick={() => { setScenario(p); setCustomScenario(""); }}
                className="rounded-xl border p-2 text-left text-xs"
                style={{ borderColor: scenario === p ? "#A67C52" : "#2a3e33", color: scenario === p ? "#c9a67a" : "#aaa", background: "#152620" }}>
                {p}
              </button>
            ))}
          </div>
          <input value={customScenario} onChange={(e) => { setCustomScenario(e.target.value); setScenario(""); }}
            placeholder="Of eigen scenario..." className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
          <input value={goal} onChange={(e) => setGoal(e.target.value)}
            placeholder="Wat wil je bereiken?" className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />
          <div className="mb-4 flex flex-wrap gap-1.5">
            {TRAIT_PRESETS.map(t => (
              <button key={t} onClick={() => setTraits(traits.includes(t) ? traits.filter(x => x !== t) : [...traits, t])}
                className="rounded-full border px-2 py-0.5 text-[10px]"
                style={{ borderColor: traits.includes(t) ? "#A67C52" : "#2a3e33", color: traits.includes(t) ? "#c9a67a" : "#888" }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={startPractice} disabled={!activeScenario}
            className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>Start →</button>
        </div>
      )}

      {tab === "oefenen" && practiceStep === "chat" && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-white">{activeScenario}</span>
            <button onClick={() => setPracticeStep("debrief")} className="rounded-lg border border-red-800/50 px-3 py-1 text-[10px] text-red-400">Afsluiten</button>
          </div>
          <div className="flex-1 overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
            <div className="flex flex-col gap-3">
              {practiceMsgs.map((m, i) => (
                <div key={i}>
                  <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                      style={{ background: m.role === "user" ? "#A67C52" : "#1a2e23", color: m.role === "user" ? "#fff" : "#e5e7eb",
                        borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>
                      {m.content || "..."}
                    </div>
                  </div>
                  {m.feedback && <p className="mt-1 ml-2 text-[10px] italic text-[#7a9e7e]">💡 {m.feedback}</p>}
                </div>
              ))}
              {practiceLoading && <div className="flex"><div className="rounded-2xl bg-[#1a2e23] px-4 py-2.5 text-sm text-gray-500 animate-pulse">Denkt na...</div></div>}
              <div ref={practiceEndRef} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <input value={practiceInput} onChange={(e) => setPracticeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPracticeMsg(); } }}
              placeholder="Jouw antwoord..." className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
            <button onClick={sendPracticeMsg} disabled={!practiceInput.trim() || practiceLoading}
              className="rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-30"
              style={{ background: practiceInput.trim() && !practiceLoading ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}>→</button>
          </div>
        </>
      )}

      {tab === "oefenen" && practiceStep === "debrief" && (() => {
        const allFeedback = practiceMsgs.filter(m => m.feedback).map(m => m.feedback!);
        return (
          <div className="mx-auto w-full max-w-lg overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold text-white">📋 Terugkoppeling</h2>
            {allFeedback.length > 0 && (
              <div className="mb-4 rounded-2xl border border-[#7a9e7e]/30 bg-[#7a9e7e]/5 p-4">
                <p className="mb-2 text-sm font-semibold text-[#7a9e7e]">💡 Feedback</p>
                {allFeedback.map((f, i) => <p key={i} className="mb-1 text-xs text-gray-300">• {f}</p>)}
              </div>
            )}
            <button onClick={resetPractice} className="w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>Nieuw gesprek oefenen</button>
          </div>
        );
      })()}
    </div>
  );
}
