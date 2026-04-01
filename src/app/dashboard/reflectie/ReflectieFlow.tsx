"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { getT, getScoreLabel, getOpeningMessage } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";
import ReadAloud from "@/components/ReadAloud";

type Step = 1 | 2 | 3 | 4;

interface Message { role: "user" | "assistant"; content: string; }

const MOOD_ICONS = ["😔", "😕", "😐", "🙂", "😊", "😄"];

const EVENT_INTROS: Record<string, Record<string, string>> = {
  nl: {
    Training: "Reflectie na een training helpt je om bewust te leren van elke sessie. Niet alleen wat je deed, maar hoe je erin stond — mentaal en fysiek.",
    Gesprek: "Een belangrijk gesprek verdient een moment van nadenken. Wat wilde je bereiken, en hoe kwam je over? Reflectie maakt je communicatie sterker.",
    Wedstrijd: "Na een wedstrijd draait het niet alleen om het resultaat. Hoe heb je gepresteerd ten opzichte van je eigen standaard? Wat neem je mee naar de volgende?",
    Vergadering: "Vergaderingen kosten energie. Was jouw bijdrage waardevol? Reflectie helpt je om effectiever te worden in groepssituaties.",
  },
  en: {
    Training: "Reflecting after training helps you learn consciously from each session — not just what you did, but how you showed up mentally and physically.",
    Gesprek: "An important conversation deserves a moment of reflection. What did you want to achieve, and how did you come across?",
    Wedstrijd: "After a match, it's not just about the result. How did you perform against your own standard? What will you take to the next one?",
    Vergadering: "Meetings take energy. Was your contribution valuable? Reflection helps you become more effective in group settings.",
  },
};

export default function ReflectieFlow() {
  const [lang] = useLang();
  const t = getT(lang);
  const [step, setStep] = useState<Step>(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Step 1 — Event reflection (now FIRST)
  const [eventLabel, setEventLabel] = useState("Training");
  const [customEvent, setCustomEvent] = useState("");
  const [reflGoed, setReflGoed] = useState("");
  const [reflBeter, setReflBeter] = useState("");
  const [reflMeenemen, setReflMeenemen] = useState("");

  // Step 2 — Mood check
  const [moodIcon, setMoodIcon] = useState("😐");
  const [moodScore, setMoodScore] = useState(5);

  // Step 3 — AI conversation
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 4 — Summary
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const assistantCount = messages.filter(m => m.role === "assistant").length;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const eventTags = [
    { key: "Training", label: t.evTraining },
    { key: "Gesprek", label: t.evGesprek },
    { key: "Wedstrijd", label: t.evWedstrijd },
    { key: "Vergadering", label: t.evVergadering },
  ];

  const activeEvent = customEvent.trim() || eventLabel;
  const eventIntro = EVENT_INTROS[lang]?.[eventLabel] || EVENT_INTROS.nl[eventLabel] || "";

  const startChat = () => {
    const opening = getOpeningMessage(moodScore, lang);
    setMessages([{ role: "assistant", content: opening }]);
    setStep(3);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.status === 429) {
        setMessages([...newMessages, { role: "assistant", content: t.chatLimit }]);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: reply }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async () => {
    setSaving(true);
    const eventText = [
      reflGoed && `${t.qGoed}: ${reflGoed}`,
      reflBeter && `${t.qBeter}: ${reflBeter}`,
      reflMeenemen && `${t.qMeenemen}: ${reflMeenemen}`,
    ].filter(Boolean).join("\n\n");

    await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood_icon: moodIcon,
        mood_score: moodScore,
        conversation_transcript: messages,
        event_label: activeEvent,
        event_reflection_text: eventText,
        app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0",
      }),
    });

    fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: messages }),
    }).catch(() => {});

    setSaving(false);
    setSaved(true);
    setStep(4);
  };

  const reset = () => {
    setStep(1); setMessages([]); setInput(""); setSaved(false);
    setMoodIcon("😐"); setMoodScore(5);
    setEventLabel("Training"); setCustomEvent(""); setReflGoed(""); setReflBeter(""); setReflMeenemen("");
  };

  const goTo = (s: Step) => {
    if (s === 3 && messages.length === 0) {
      startChat();
    } else {
      setStep(s);
    }
  };

  const STEP_LABELS = [
    t.stepStemming,
    lang === "nl" ? "Reflectie" : "Reflection",
    t.stepGesprek,
    t.stepOpslaan,
  ];

  const hasReflection = reflGoed.trim() || reflBeter.trim() || reflMeenemen.trim();

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress bar — clickable for navigation */}
      <div className="mb-6 flex items-center gap-2">
        {([1,2,3,4] as Step[]).map(s => (
          <button
            key={s}
            onClick={() => { if (s <= step || (s === step + 1)) goTo(s); }}
            disabled={s > step + 1}
            className="flex flex-1 flex-col items-center gap-1 group"
          >
            <div className={`h-1.5 w-full rounded-full transition-colors ${
              step >= s ? "bg-[#A67C52]" : s === step + 1 ? "bg-[#2a3e33] group-hover:bg-[#A67C52]/30" : "bg-[#2a3e33]"
            }`} />
            <span className={`text-[9px] ${step >= s ? "text-[#c9a67a]" : "text-gray-700"}`}>
              {STEP_LABELS[s-1]}
            </span>
          </button>
        ))}
      </div>

      {/* STEP 1 — Mood check (FIRST) */}
      {step === 1 && (
        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <h2 className="mb-5 text-lg font-bold text-white">{t.howDoYouFeel}</h2>
          <div className="mb-5 flex justify-between">
            {MOOD_ICONS.map((icon, i) => (
              <button key={i} onClick={() => { setMoodIcon(icon); setMoodScore(i * 2); }}
                className={`rounded-xl p-2 text-3xl transition-all ${moodIcon === icon ? "scale-125 bg-[#A67C52]/20" : "opacity-50 hover:opacity-80"}`}>
                {icon}
              </button>
            ))}
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">{t.score}</span>
            <span className="text-xl font-extrabold text-white">{moodScore}</span>
          </div>
          <input type="range" min="0" max="10" value={moodScore}
            onChange={e => { setMoodScore(Number(e.target.value)); setMoodIcon(MOOD_ICONS[Math.round(Number(e.target.value) / 2)]); }}
            className="mb-2 w-full" style={{ accentColor: "#A67C52" }} />
          <p className="mb-5 text-center text-xs text-gray-500">{getScoreLabel(moodScore, lang)}</p>

          <button onClick={() => goTo(2)} className="w-full rounded-xl bg-[#A67C52] py-3 text-sm font-bold text-white">
            {lang === "nl" ? "Volgende: Reflectie →" : "Next: Reflection →"}
          </button>
        </div>
      )}

      {/* STEP 2 — Event Reflection */}
      {step === 2 && (
        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <h2 className="mb-2 text-lg font-bold text-white">
            {lang === "nl" ? "Waar wil je op reflecteren?" : "What do you want to reflect on?"}
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-gray-400">
            {lang === "nl"
              ? "Reflectie is een van de krachtigste tools voor groei. Door bewust stil te staan bij wat je hebt meegemaakt, maak je van elke ervaring een leermogelijkheid."
              : "Reflection is one of the most powerful tools for growth. By consciously pausing to consider your experiences, you turn every moment into a learning opportunity."}
          </p>

          {/* Event selection */}
          <label className="mb-2 block text-xs font-semibold text-gray-400">
            {lang === "nl" ? "Type gebeurtenis" : "Event type"}
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            {eventTags.map(tag => (
              <button key={tag.key} onClick={() => setEventLabel(tag.key)}
                className="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
                style={{ background: eventLabel === tag.key ? "#A67C52" : "#2a3e33", color: eventLabel === tag.key ? "#fff" : "#9ca3af" }}>
                {tag.label}
              </button>
            ))}
            <input value={customEvent} onChange={e => setCustomEvent(e.target.value)}
              placeholder={t.evAnders}
              className="rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-1.5 text-sm text-white outline-none placeholder:text-gray-600" />
          </div>

          {/* Contextual intro text */}
          {eventIntro && (
            <div className="mb-5 rounded-xl border border-[#A67C52]/20 bg-[#A67C52]/5 p-3">
              <p className="text-xs leading-relaxed text-[#c9a67a]">{eventIntro}</p>
            </div>
          )}

          {/* Reflection questions with voice input */}
          {[
            { label: t.qGoed, value: reflGoed, set: setReflGoed, emoji: "✅" },
            { label: t.qBeter, value: reflBeter, set: setReflBeter, emoji: "🔄" },
            { label: t.qMeenemen, value: reflMeenemen, set: setReflMeenemen, emoji: "🎯" },
          ].map(({ label, value, set, emoji }) => (
            <div key={label} className="mb-4">
              <label className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <span>{emoji}</span> {label}
              </label>
              <div className="relative">
                <textarea value={value} onChange={e => set(e.target.value)} rows={2}
                  className="w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 pr-10 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]"
                  placeholder={t.typePlaceholder} />
                <div className="absolute right-2 top-2">
                  <VoiceInput lang={lang} size="sm" onTranscript={(text) => set(value ? value + " " + text : text)} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button onClick={() => setStep(1)}
              className="rounded-xl border border-[#2a3e33] px-4 py-3 text-sm text-gray-400 hover:text-white">
              ← {lang === "nl" ? "Terug" : "Back"}
            </button>
            <button onClick={() => goTo(3)} disabled={!hasReflection}
              className="flex-1 rounded-xl bg-[#A67C52] py-3 text-sm font-bold text-white disabled:opacity-40">
              {lang === "nl" ? "Start gesprek →" : "Start conversation →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — AI Coaching conversation */}
      {step === 3 && (
        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#2a3e33] px-2 py-0.5 text-sm">{moodIcon}</span>
              <span className="text-xs text-gray-500">{activeEvent}</span>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-gray-500 hover:text-white">
              ← {lang === "nl" ? "Reflectie" : "Reflection"}
            </button>
          </div>

          <div className="mb-3 flex h-72 flex-col gap-2 overflow-y-auto rounded-xl border border-[#2a3e33] bg-[#0f1a14] p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  <div className="whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed"
                    style={{ background: m.role === "user" ? "#A67C52" : "#1a2e23", color: "#e5e7eb",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px" }}>
                    {m.content || <span className="opacity-50">...</span>}
                  </div>
                  {m.role === "assistant" && m.content && (
                    <div className="mt-0.5 flex justify-start">
                      <ReadAloud text={m.content} lang={lang} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="mb-3 flex gap-2">
            <VoiceInput lang={lang} onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)} />
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={t.chatPlaceholder}
              className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="rounded-xl bg-[#A67C52] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">
              →
            </button>
          </div>

          {assistantCount >= 3 && (
            <button onClick={saveSession} disabled={saving}
              className="w-full rounded-xl bg-[#A67C52] py-3 text-sm font-bold text-white disabled:opacity-50">
              {saving ? t.saving : (lang === "nl" ? "Opslaan & Afronden" : "Save & Finish")}
            </button>
          )}
        </div>
      )}

      {/* STEP 4 — Summary */}
      {step === 4 && (
        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6 text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="mb-2 text-lg font-bold text-white">{t.sessionSaved}</h2>
          <p className="mb-5 text-sm text-gray-500">{t.sessionDone}</p>
          <div className="mb-5 rounded-xl border border-[#2a3e33] bg-[#0f1a14] p-4 text-left">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{moodIcon}</span>
              <div>
                <div className="text-sm font-semibold text-white">{t.score}: {moodScore}/10</div>
                <div className="text-xs text-gray-500">{getScoreLabel(moodScore, lang)}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-400">{t.event}:</span> {activeEvent}
            </div>
            {reflGoed && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-semibold text-[#22c55e]">✅</span> {reflGoed.slice(0, 100)}
              </div>
            )}
            {reflMeenemen && (
              <div className="mt-1 text-xs text-gray-500">
                <span className="font-semibold text-[#c9a67a]">🎯</span> {reflMeenemen.slice(0, 100)}
              </div>
            )}
          </div>
          <button onClick={reset} className="w-full rounded-xl border border-[#2a3e33] py-2.5 text-sm text-gray-400 hover:text-white">
            {t.newReflection}
          </button>
        </div>
      )}
    </div>
  );
}
