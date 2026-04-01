"use client";
import { useState, useRef, useEffect } from "react";

type ConvType = "intern" | "extern";
type Step = "setup" | "chat" | "debrief";
interface Msg { role: "user" | "assistant"; content: string; feedback?: string; }

const EXTERN_PRESETS = [
  "Salarisonderhandeling met je manager",
  "Feedback geven aan een collega",
  "Grenzen stellen bij je leidinggevende",
  "Slecht nieuws overbrengen",
  "Confrontatie met een teamgenoot",
  "Onderhandelen over werkdruk",
];

const INTERN_PRESETS = [
  "Omgaan met faalangst voor een grote presentatie",
  "Imposter syndrome: 'ik hoor hier niet'",
  "Perfectionisme: 'het is nooit goed genoeg'",
  "Vergelijken met anderen",
  "Twijfel over een grote beslissing",
];

const TRAIT_PRESETS = [
  "Raakt snel gefrustreerd",
  "Afwijzend en kort",
  "Emotioneel en defensief",
  "Rationeel en koel",
  "Dominant en intimiderend",
  "Passief-agressief",
  "Meevoelend maar onbuigzaam",
];

export default function GesprekkenOefenenPage() {
  const [step, setStep] = useState<Step>("setup");
  const [convType, setConvType] = useState<ConvType>("extern");
  const [scenario, setScenario] = useState("");
  const [customScenario, setCustomScenario] = useState("");
  const [goal, setGoal] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [customTrait, setCustomTrait] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const activeScenario = customScenario.trim() || scenario;
  const traitsStr = traits.join(", ");

  // Voice input
  const startVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "nl-NL";
    r.continuous = false;
    r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => { setInput((prev: string) => prev + (prev ? " " : "") + e.results[0][0].transcript); };
    r.onend = () => setListening(false);
    r.start();
    setListening(true);
    recognitionRef.current = r;
  };
  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false); };

  // Start conversation
  const startConv = () => {
    const intro = convType === "intern"
      ? `[Innerlijke stem — ${traitsStr || "kritisch, twijfelend"}]\n\nOké... laten we eerlijk zijn. ${activeScenario ? `Over "${activeScenario}" — ` : ""}ben je hier echt klaar voor?`
      : `[${activeScenario} — ${traitsStr || "neutraal"}]\n\nGoed. Wat wilde je bespreken?`;
    setMessages([{ role: "assistant", content: intro }]);
    setStep("chat");
  };

  // Send message
  const sendMsg = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/practice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
          type: convType,
          scenario: activeScenario,
          goal,
          traits: traitsStr,
        }),
      });

      if (!res.ok) {
        setMessages([...newMsgs, { role: "assistant", content: "AI is momenteel niet beschikbaar. Probeer het later." }]);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let reply = "";
      setMessages([...newMsgs, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        // Split feedback from main response
        const feedbackMatch = reply.match(/\[FEEDBACK\]\s*([\s\S]*?)$/);
        const mainContent = reply.replace(/\[FEEDBACK\][\s\S]*$/, "").trim();
        const feedback = feedbackMatch ? feedbackMatch[1].trim() : undefined;
        setMessages([...newMsgs, { role: "assistant", content: mainContent, feedback }]);
      }
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Er ging iets mis." }]);
    } finally {
      setLoading(false);
    }
  };

  // Debrief
  const endConv = () => {
    setStep("debrief");
  };

  const reset = () => {
    setStep("setup"); setMessages([]); setScenario(""); setCustomScenario("");
    setGoal(""); setTraits([]); setCustomTrait(""); setInput("");
  };

  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const allFeedback = messages.filter((m) => m.feedback).map((m) => m.feedback!);

  // ══════ SETUP ══════
  if (step === "setup") {
    const presets = convType === "intern" ? INTERN_PRESETS : EXTERN_PRESETS;
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-xl font-black text-white">💬 Gesprekken oefenen</h1>
        <p className="mb-5 text-xs text-gray-500">Oefen moeilijke gesprekken in een veilige omgeving</p>

        {/* Safe space banner */}
        <div className="mb-5 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-3">
          <p className="text-[11px] text-[#22c55e]">🔒 Dit is een veilige oefenomgeving. Alles wat je hier zegt blijft privé.</p>
        </div>

        {/* Type selector */}
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Type gesprek</label>
        <div className="mb-5 flex gap-2">
          {([
            { key: "extern" as ConvType, label: "🗣️ Extern gesprek", desc: "Met een ander persoon" },
            { key: "intern" as ConvType, label: "🧠 Intern gesprek", desc: "Met jezelf / innerlijke stem" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setConvType(t.key); setScenario(""); setCustomScenario(""); setTraits([]); }}
              className="flex-1 rounded-xl border p-3 text-left transition-colors"
              style={{ borderColor: convType === t.key ? "#A67C52" : "#2a3e33", background: convType === t.key ? "#A67C52/10" : "#152620" }}
            >
              <p className="text-sm font-medium" style={{ color: convType === t.key ? "#c9a67a" : "#aaa" }}>{t.label}</p>
              <p className="text-[10px] text-gray-600">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Scenario */}
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Scenario</label>
        <div className="mb-3 flex flex-col gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => { setScenario(p); setCustomScenario(""); }}
              className="rounded-xl border p-2.5 text-left text-sm transition-colors"
              style={{ borderColor: scenario === p ? "#A67C52" : "#2a3e33", color: scenario === p ? "#c9a67a" : "#aaa", background: "#152620" }}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          value={customScenario}
          onChange={(e) => { setCustomScenario(e.target.value); setScenario(""); }}
          placeholder="Of beschrijf je eigen scenario..."
          className="mb-5 w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
        />

        {/* Goal */}
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Wat wil je bereiken?</label>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder={convType === "intern" ? "Bijv: mijn innerlijke criticus leren weerleggen" : "Bijv: een salarisverhoging van 10% overeenkomen"}
          className="mb-5 w-full rounded-xl border border-[#2a3e33] bg-[#152620] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
        />

        {/* Traits */}
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {convType === "intern" ? "Eigenschappen innerlijke stem" : "Eigenschappen gesprekspartner"}
        </label>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {TRAIT_PRESETS.map((t) => (
            <button
              key={t}
              onClick={() => setTraits(traits.includes(t) ? traits.filter((x) => x !== t) : [...traits, t])}
              className="rounded-full border px-2.5 py-1 text-xs transition-colors"
              style={{
                borderColor: traits.includes(t) ? "#A67C52" : "#2a3e33",
                color: traits.includes(t) ? "#c9a67a" : "#888",
                background: traits.includes(t) ? "rgba(166,124,82,0.15)" : "transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mb-5 flex gap-2">
          <input
            value={customTrait}
            onChange={(e) => setCustomTrait(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customTrait.trim()) {
                setTraits([...traits, customTrait.trim()]);
                setCustomTrait("");
              }
            }}
            placeholder="Eigen eigenschap toevoegen..."
            className="flex-1 rounded-xl border border-[#2a3e33] bg-[#152620] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600"
          />
        </div>

        {/* Start */}
        <button
          onClick={startConv}
          disabled={!activeScenario}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
        >
          Start oefengesprek →
        </button>
      </div>
    );
  }

  // ══════ CHAT ══════
  if (step === "chat") {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white">{activeScenario}</span>
            <p className="text-[10px] text-gray-600">{convType === "intern" ? "Intern gesprek" : "Extern gesprek"} · {traitsStr || "standaard"}</p>
          </div>
          <button onClick={endConv} className="rounded-lg border border-red-800/50 px-3 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-900/10">
            Gesprek afsluiten
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: m.role === "user" ? "#A67C52" : "#1a2e23",
                      color: m.role === "user" ? "#fff" : "#e5e7eb",
                      borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    }}
                  >
                    {m.content || "..."}
                  </div>
                </div>
                {m.feedback && (
                  <div className="mt-1.5 ml-2 flex items-start gap-1.5">
                    <span className="text-[10px]">💡</span>
                    <p className="text-[11px] italic leading-relaxed text-[#7a9e7e]">{m.feedback}</p>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[#1a2e23] px-4 py-2.5 text-sm text-gray-500">
                  <span className="animate-pulse">Denkt na...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={listening ? stopVoice : startVoice}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg transition-colors"
            style={{ background: listening ? "#E85D4A" : "#2a3e33", color: listening ? "#fff" : "#888" }}
          >
            🎙
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Typ of spreek je antwoord..."
            className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
          />
          <button
            onClick={sendMsg}
            disabled={!input.trim() || loading}
            className="rounded-xl px-5 py-3 text-sm font-bold text-white transition-all disabled:opacity-30"
            style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}
          >
            →
          </button>
        </div>
      </div>
    );
  }

  // ══════ DEBRIEF ══════
  if (step === "debrief") {
    return (
      <div className="mx-auto max-w-lg">
        <h2 className="mb-1 text-xl font-black text-white">📋 Terugkoppeling</h2>
        <p className="mb-5 text-xs text-gray-500">{activeScenario}</p>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
            <div className="text-lg font-bold text-white">{userMsgCount}</div>
            <div className="text-[9px] text-gray-500">Berichten</div>
          </div>
          <div className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
            <div className="text-lg font-bold text-[#c9a67a]">{allFeedback.length}</div>
            <div className="text-[9px] text-gray-500">Feedback tips</div>
          </div>
          <div className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
            <div className="text-lg font-bold text-[#7a9e7e]">{convType === "intern" ? "🧠" : "🗣️"}</div>
            <div className="text-[9px] text-gray-500">{convType === "intern" ? "Intern" : "Extern"}</div>
          </div>
        </div>

        {/* Goal check */}
        <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <p className="mb-1 text-[10px] font-semibold uppercase text-gray-600">Jouw doel was</p>
          <p className="text-sm text-white">{goal || "Geen specifiek doel ingesteld"}</p>
        </div>

        {/* All feedback collected */}
        {allFeedback.length > 0 && (
          <div className="mb-5 rounded-2xl border border-[#7a9e7e]/30 bg-[#7a9e7e]/5 p-5">
            <p className="mb-3 text-sm font-semibold text-[#7a9e7e]">💡 Feedback uit dit gesprek</p>
            <div className="space-y-2">
              {allFeedback.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs text-[#7a9e7e]">•</span>
                  <p className="text-xs leading-relaxed text-gray-300">{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
          >
            Nieuw gesprek oefenen
          </button>
          <button
            onClick={() => { setStep("chat"); }}
            className="rounded-xl border border-[#2a3e33] px-4 py-3 text-xs text-gray-400 hover:text-white"
          >
            Verder praten
          </button>
        </div>
      </div>
    );
  }

  return null;
}
