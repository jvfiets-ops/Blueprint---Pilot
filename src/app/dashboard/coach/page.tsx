"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";
import Link from "next/link";

interface Msg { role: "user" | "assistant"; content: string; }
type Mode = "setup" | "ai" | "scripted";

const SCRIPTED_DURATION_OPTS_NL = ["Kort (dagen)", "Weken", "Maanden", "Langer"];
const SCRIPTED_DURATION_OPTS_EN = ["Short (days)", "Weeks", "Months", "Longer"];

export default function CoachPage() {
  const [lang] = useLang();
  const t = getT(lang);

  const [mode, setMode] = useState<Mode>("setup");
  const [apiKey, setApiKey] = useState("");

  // AI chat state
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Scripted state
  const [scriptStep, setScriptStep] = useState(0);
  const [scriptAnswers, setScriptAnswers] = useState<string[]>([]);
  const [scriptInput, setScriptInput] = useState("");

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Check if mode was already chosen
  useEffect(() => {
    const saved = localStorage.getItem("pilot-coach-mode");
    const savedKey = localStorage.getItem("pilot-coach-apikey");
    if (saved === "ai" && savedKey) {
      setMode("ai");
      setApiKey(savedKey);
      setMsgs([{ role: "assistant", content: t.coachWelcome }]);
    } else if (saved === "scripted") {
      setMode("scripted");
    }
  }, [t.coachWelcome]);

  const chooseAI = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("pilot-coach-mode", "ai");
    localStorage.setItem("pilot-coach-apikey", apiKey.trim());
    setMode("ai");
    setMsgs([{ role: "assistant", content: t.coachWelcome }]);
  };

  const chooseScripted = () => {
    localStorage.setItem("pilot-coach-mode", "scripted");
    setMode("scripted");
    setScriptStep(0);
    setScriptAnswers([]);
  };

  // AI send
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), apiKey }),
      });
      if (!res.ok) {
        setMsgs([...newMsgs, { role: "assistant", content: lang === "nl" ? "AI is momenteel niet beschikbaar." : "AI is currently unavailable." }]);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let reply = "";
      setMsgs([...newMsgs, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMsgs([...newMsgs, { role: "assistant", content: reply }]);
      }
    } finally { setLoading(false); }
  };

  const newChat = () => {
    setMsgs([{ role: "assistant", content: t.coachWelcome }]);
  };

  // Scripted flow
  const scriptQuestions = [
    t.coachScriptedQ1,
    t.coachScriptedQ2,
    t.coachScriptedQ3,
  ];
  const durationOpts = lang === "nl" ? SCRIPTED_DURATION_OPTS_NL : SCRIPTED_DURATION_OPTS_EN;

  const nextScriptStep = (answer?: string) => {
    const a = answer || scriptInput.trim();
    if (!a) return;
    setScriptAnswers([...scriptAnswers, a]);
    setScriptInput("");
    setScriptStep(scriptStep + 1);
  };

  // ═══ SETUP SCREEN ═══
  if (mode === "setup") {
    return (
      <div className="mx-auto max-w-md py-8">
        <h1 className="mb-2 text-2xl font-black text-white">🧠 {t.coachTitle}</h1>
        <p className="mb-8 text-sm text-gray-400">{t.coachSetupTitle}</p>

        <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <h3 className="mb-1 text-sm font-bold text-[#c9a67a]">{t.coachOptA}</h3>
          <p className="mb-3 text-xs text-gray-500">{t.coachOptADesc}</p>
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={t.coachApiPlaceholder} type="password"
            className="mb-2 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
          <button onClick={chooseAI} disabled={!apiKey.trim()} className="w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-30">{t.coachApiSave}</button>
        </div>

        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <h3 className="mb-1 text-sm font-bold text-[#c9a67a]">{t.coachOptB}</h3>
          <p className="mb-3 text-xs text-gray-500">{t.coachOptBDesc}</p>
          <button onClick={chooseScripted} className="w-full rounded-xl border border-[#A67C52] py-2.5 text-sm font-bold text-[#c9a67a]">→ {t.coachOptB}</button>
        </div>
      </div>
    );
  }

  // ═══ SCRIPTED MODE ═══
  if (mode === "scripted") {
    return (
      <div className="mx-auto max-w-lg py-4">
        <h1 className="mb-6 text-xl font-black text-white">🧠 {t.coachTitle}</h1>

        {/* Already answered questions */}
        {scriptAnswers.map((a, i) => (
          <div key={i} className="mb-3">
            <p className="mb-1 text-xs font-semibold text-[#c9a67a]">{scriptQuestions[i]}</p>
            <p className="rounded-xl bg-[#1a2e23] px-3 py-2 text-sm text-gray-200">{a}</p>
          </div>
        ))}

        {/* Current question */}
        {scriptStep < scriptQuestions.length && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-bold text-white">{scriptQuestions[scriptStep]}</p>
            {scriptStep === 1 ? (
              <div className="flex flex-wrap gap-2">
                {durationOpts.map(opt => (
                  <button key={opt} onClick={() => nextScriptStep(opt)}
                    className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] px-4 py-2 text-sm text-gray-300 hover:border-[#A67C52] hover:text-[#c9a67a]">
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <textarea value={scriptInput} onChange={e => setScriptInput(e.target.value)} rows={2} placeholder="..."
                  className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
                <VoiceInput onTranscript={text => setScriptInput(prev => prev ? prev + " " + text : text)} lang={lang} />
              </div>
            )}
            {scriptStep !== 1 && (
              <button onClick={() => nextScriptStep()} disabled={!scriptInput.trim()} className="mt-2 w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-30">→</button>
            )}
          </div>
        )}

        {/* Summary */}
        {scriptStep >= scriptQuestions.length && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-bold text-[#c9a67a]">{t.coachScriptedSummary}</h3>
            <div className="rounded-2xl border border-[#7a9e7e]/30 bg-[#7a9e7e]/5 p-4 text-sm text-gray-300">
              <p className="mb-2">
                {lang === "nl"
                  ? `Je geeft aan dat je worstelt met: "${scriptAnswers[0]}". Dit speelt al ${scriptAnswers[1]?.toLowerCase()}. Je hebt geprobeerd: "${scriptAnswers[2]}".`
                  : `You indicate you're struggling with: "${scriptAnswers[0]}". This has been going on for ${scriptAnswers[1]?.toLowerCase()}. You've tried: "${scriptAnswers[2]}".`}
              </p>
              <p className="mt-3 text-xs text-[#c9a67a]">{t.coachScriptedEnd}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setScriptStep(0); setScriptAnswers([]); }} className="flex-1 rounded-xl border border-[#2a3e33] py-2.5 text-sm text-gray-400">{t.coachNewChat}</button>
              <Link href="/dashboard/contact" className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-center text-sm font-bold text-white">{t.contactCTA}</Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ AI CHAT MODE ═══
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-lg font-black text-white">🧠 {t.coachTitle}</h1>
        <button onClick={newChat} className="rounded-lg border border-[#2a3e33] px-3 py-1 text-[10px] text-gray-400 hover:text-white">{t.coachNewChat}</button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
        <div className="flex flex-col gap-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: m.role === "user" ? "#A67C52" : "#1a2e23",
                  color: m.role === "user" ? "#fff" : "#e5e7eb",
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                }}>
                {m.content || "..."}
              </div>
            </div>
          ))}
          {loading && <div className="flex"><div className="animate-pulse rounded-2xl bg-[#1a2e23] px-4 py-2.5 text-sm text-gray-500">{lang === "nl" ? "Denkt na..." : "Thinking..."}</div></div>}
          <div ref={endRef} />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={lang === "nl" ? "Typ je bericht..." : "Type your message..."}
          className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
        <VoiceInput onTranscript={text => setInput(prev => prev ? prev + " " + text : text)} lang={lang} />
        <button onClick={send} disabled={!input.trim() || loading}
          className="rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-30"
          style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}>→</button>
      </div>
    </div>
  );
}
