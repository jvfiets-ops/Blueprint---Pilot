"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";

interface Msg { id: string; content: string; fromAdmin: boolean; createdAt: string; }

export default function ContactPage() {
  const [lang] = useLang();
  const t = getT(lang);
  const nl = lang === "nl";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages").then(r => r.json()).then(d => { if (Array.isArray(d)) setMessages(d); }).catch(() => {});
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    const msg = await res.json();
    if (msg.id) setMessages([...messages, msg]);
    setInput("");
    setSending(false);
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <h1 className="mb-2 text-2xl font-black text-white">📞 {t.contactTitle}</h1>

      {/* Intro */}
      <div className="mb-4 rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/5 p-4">
        <p className="text-xs leading-relaxed text-gray-400">{t.contactMessage}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#2a3e33] bg-[#152620] p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-gray-600">{nl ? "Nog geen berichten. Stuur je eerste bericht aan Jesse." : "No messages yet. Send your first message to Jesse."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.fromAdmin ? "justify-start" : "justify-end"}`}>
                <div className="max-w-[80%]">
                  {m.fromAdmin && <p className="mb-0.5 text-[9px] font-bold text-[#c9a67a]">Jesse</p>}
                  <div className="whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: m.fromAdmin ? "#1a2e23" : "#A67C52",
                      color: m.fromAdmin ? "#e5e7eb" : "#fff",
                      borderRadius: m.fromAdmin ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                    }}>
                    {m.content}
                  </div>
                  <p className="mt-0.5 text-[8px] text-gray-600">{m.createdAt?.slice(0, 16).replace("T", " ")}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={nl ? "Typ je bericht aan Jesse..." : "Type your message to Jesse..."}
          className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
        <VoiceInput onTranscript={text => setInput(prev => prev ? prev + " " + text : text)} lang={lang} />
        <button onClick={send} disabled={!input.trim() || sending}
          className="rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-30"
          style={{ background: input.trim() && !sending ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}>→</button>
      </div>
    </div>
  );
}
