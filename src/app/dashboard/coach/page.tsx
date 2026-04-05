"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";
import { getScriptedReply, getScriptedGreeting, createInitialState } from "@/lib/scripted-coach";
import VoiceInput from "@/components/VoiceInput";
import Link from "next/link";

interface Msg { role: "user" | "assistant"; content: string; }
type Mode = "setup" | "ai" | "scripted";

export default function CoachPage() {
  const [lang] = useLang();
  const t = getT(lang);

  const [mode, setMode] = useState<Mode>("setup");
  const [apiKey, setApiKey] = useState("");

  // Chat state (shared between AI and scripted)
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Scripted coach state
  const coachStateRef = useRef(createInitialState());

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsKey, setSettingsKey] = useState("");

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
      setMsgs([{ role: "assistant", content: getScriptedGreeting(lang) }]);
    }
  }, [t.coachWelcome, lang]);

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
    coachStateRef.current = createInitialState();
    setMsgs([{ role: "assistant", content: getScriptedGreeting(lang) }]);
  };

  const openSettings = () => {
    setSettingsKey(apiKey);
    setShowSettings(true);
  };

  const saveApiKey = () => {
    if (settingsKey.trim()) {
      localStorage.setItem("pilot-coach-mode", "ai");
      localStorage.setItem("pilot-coach-apikey", settingsKey.trim());
      setApiKey(settingsKey.trim());
      setMode("ai");
      if (msgs.length === 0) {
        setMsgs([{ role: "assistant", content: t.coachWelcome }]);
      }
    } else {
      localStorage.setItem("pilot-coach-mode", "scripted");
      localStorage.removeItem("pilot-coach-apikey");
      setApiKey("");
      setMode("scripted");
      if (msgs.length === 0) {
        coachStateRef.current = createInitialState();
        setMsgs([{ role: "assistant", content: getScriptedGreeting(lang) }]);
      }
    }
    setShowSettings(false);
  };

  const removeApiKey = () => {
    localStorage.setItem("pilot-coach-mode", "scripted");
    localStorage.removeItem("pilot-coach-apikey");
    setApiKey("");
    setMode("scripted");
    setShowSettings(false);
  };

  // Send message (works for both AI and scripted)
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");

    if (mode === "scripted") {
      // Scripted: generate response locally
      setLoading(true);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800)); // Simulate thinking
      const { response, newState } = getScriptedReply(userMsg.content, coachStateRef.current, lang);
      coachStateRef.current = newState;
      setMsgs([...newMsgs, { role: "assistant", content: response }]);
      setLoading(false);
    } else {
      // AI: stream from API
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), apiKey }),
        });
        if (!res.ok) {
          setMsgs([...newMsgs, { role: "assistant", content: lang === "nl" ? "AI is momenteel niet beschikbaar. Controleer je API-sleutel in de instellingen." : "AI is currently unavailable. Check your API key in settings." }]);
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
    }
  };

  const newChat = () => {
    coachStateRef.current = createInitialState();
    setMsgs([{
      role: "assistant",
      content: mode === "scripted" ? getScriptedGreeting(lang) : t.coachWelcome,
    }]);
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

  // ═══ CHAT INTERFACE (both AI and Scripted) ═══
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5" onClick={e => e.stopPropagation()}>
            <h3 className="mb-3 text-base font-bold text-white">
              {lang === "nl" ? "Coach instellingen" : "Coach settings"}
            </h3>
            <label className="mb-1 block text-xs text-gray-400">
              {lang === "nl" ? "Anthropic API-sleutel (optioneel)" : "Anthropic API key (optional)"}
            </label>
            <input
              value={settingsKey}
              onChange={e => setSettingsKey(e.target.value)}
              type="password"
              placeholder={t.coachApiPlaceholder}
              className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
            />
            <p className="mb-4 text-[10px] text-gray-600">
              {lang === "nl"
                ? "Met een API-sleutel krijg je AI-gestuurde coaching. Zonder sleutel gebruik je de ingebouwde coach."
                : "With an API key you get AI-powered coaching. Without a key you use the built-in coach."}
            </p>
            <div className="flex gap-2">
              <button onClick={saveApiKey} className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white">
                {lang === "nl" ? "Opslaan" : "Save"}
              </button>
              {apiKey && (
                <button onClick={removeApiKey} className="rounded-xl border border-red-800/50 px-3 py-2.5 text-xs text-red-400">
                  {lang === "nl" ? "Verwijder" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-lg font-black text-white">🧠 {t.coachTitle}</h1>
        <div className="flex gap-2">
          <button onClick={newChat} className="rounded-lg border border-[#2a3e33] px-3 py-1 text-[10px] text-gray-400 hover:text-white">{t.coachNewChat}</button>
          <button onClick={openSettings} className="rounded-lg border border-[#2a3e33] px-3 py-1 text-[10px] text-gray-500 hover:text-white">⚙️</button>
        </div>
      </div>

      {mode === "scripted" && (
        <p className="mb-2 text-[10px] text-gray-600">
          {lang === "nl" ? "Coachende gesprekspartner — zonder AI" : "Coaching partner — without AI"}
        </p>
      )}

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
          {loading && (
            <div className="flex">
              <div className="animate-pulse rounded-2xl bg-[#1a2e23] px-4 py-2.5 text-sm text-gray-500">
                {lang === "nl" ? "Denkt na..." : "Thinking..."}
              </div>
            </div>
          )}
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
