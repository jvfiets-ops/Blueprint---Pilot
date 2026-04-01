"use client";
import { useState, useRef, useEffect } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function MentaalPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-open with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hoi! Waar kan ik je vandaag mee helpen? Vertel me wat je bezighoudt — ik luister.",
        },
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs }),
      });

      if (res.status === 429) {
        setMessages([...newMsgs, { role: "assistant", content: "Je hebt de demo-limiet bereikt voor vandaag. Koppel je eigen API-sleutel voor onbeperkt gebruik via Instellingen → AI Provider." }]);
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
        setMessages([...newMsgs, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Er is een fout opgetreden. Probeer het opnieuw." }]);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (messages.length < 3 || sessionSaved) return;
    setSessionSaved(true);

    // Save session
    const title = messages.find((m) => m.role === "user")?.content.slice(0, 60) || "Sessie";
    await fetch("/api/chat-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, messages }),
    }).catch(() => {});

    // Trigger AI summarization
    await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: messages }),
    }).catch(() => {});
  };

  const newSession = () => {
    setMessages([
      {
        role: "assistant",
        content: "Nieuw gesprek gestart. Waar wil je het over hebben?",
      },
    ]);
    setSessionSaved(false);
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">🧠 Mentale Coach</h1>
          <p className="text-xs text-gray-500">AI-begeleiding op basis van SDT & CGT</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/dashboard/stressoren/mentaal/geschiedenis"
            className="rounded-lg border border-[#2a3e33] px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            📊 Geschiedenis
          </a>
          {messages.length > 3 && !sessionSaved && (
            <button
              onClick={endSession}
              className="rounded-lg border border-[#A67C52]/30 px-3 py-1.5 text-xs font-medium text-[#c9a67a] hover:bg-[#A67C52]/10"
            >
              Sessie opslaan
            </button>
          )}
          <button
            onClick={newSession}
            className="rounded-lg border border-[#2a3e33] px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Nieuw gesprek
          </button>
        </div>
      </div>

      {sessionSaved && (
        <div className="mb-3 rounded-lg bg-[#A67C52]/10 px-3 py-2 text-xs text-[#c9a67a]">
          ✓ Sessie opgeslagen. Je kunt de samenvatting later terugvinden bij Geschiedenis.
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Typ je bericht..."
          className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="rounded-xl px-5 py-3 text-sm font-bold text-white transition-all disabled:opacity-30"
          style={{
            background: input.trim() && !loading ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
