"use client";
import { useState, useEffect } from "react";

type Provider = "anthropic" | "openai";

export default function AIProviderPage() {
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [masked, setMasked] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/ai-settings").then(r => r.json()).then(d => {
      if (d?.provider) {
        setProvider(d.provider);
        setHasKey(true);
        setMasked(true);
        setApiKey("••••••••••••••••••••••••••••••••");
      }
    });
  }, []);

  const testConnection = async () => {
    if (masked) return;
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, api_key: apiKey }),
    });
    setTestResult(res.ok ? "ok" : "fail");
    setTesting(false);
  };

  const save = async () => {
    if (masked || !apiKey.trim()) return;
    setSaving(true);
    await fetch("/api/ai-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, api_key: apiKey }),
    });
    setSaved(true);
    setHasKey(true);
    setMasked(true);
    setApiKey("••••••••••••••••••••••••••••••••");
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = async () => {
    await fetch("/api/ai-settings", { method: "DELETE" });
    setHasKey(false);
    setMasked(false);
    setApiKey("");
    setTestResult(null);
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-extrabold text-white">⚙️ AI Provider</h1>
      <p className="mb-6 text-sm text-gray-500">Koppel je eigen API-sleutel voor onbeperkt gebruik. Zonder eigen sleutel geldt een dagelijks demo-limiet van 20 berichten.</p>

      {/* Provider selector */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[
          { id: "anthropic" as Provider, name: "Anthropic", model: "claude-sonnet-4-20250514", docs: "https://console.anthropic.com/keys" },
          { id: "openai" as Provider, name: "OpenAI", model: "gpt-4o", docs: "https://platform.openai.com/api-keys" },
        ].map(p => (
          <button key={p.id} onClick={() => { setProvider(p.id); setMasked(false); setApiKey(""); }}
            className="rounded-2xl border p-4 text-left transition-colors"
            style={{ borderColor: provider === p.id ? "#A67C52" : "#2a3e33", background: provider === p.id ? "#A67C5211" : "#1a2e23" }}>
            <div className="font-bold text-white">{p.name}</div>
            <div className="text-xs text-gray-500">{p.model}</div>
            <a href={p.docs} target="_blank" rel="noopener noreferrer" className="mt-1.5 block text-[10px] text-[#A67C52] hover:underline" onClick={e => e.stopPropagation()}>
              Sleutel ophalen →
            </a>
          </button>
        ))}
      </div>

      {/* API key input */}
      <label className="mb-1 block text-xs uppercase font-semibold tracking-wide text-gray-500">API-sleutel</label>
      <div className="mb-3 flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setMasked(false); setTestResult(null); }}
          placeholder={`Jouw ${provider === "anthropic" ? "Anthropic" : "OpenAI"} API-sleutel`}
          readOnly={masked}
          className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#A67C52] placeholder:text-gray-700"
        />
        {hasKey && masked && (
          <button onClick={() => { setMasked(false); setApiKey(""); }} className="rounded-xl border border-[#2a3e33] px-3 text-xs text-gray-500 hover:text-white">
            Wijzigen
          </button>
        )}
      </div>

      {/* Test + save */}
      <div className="flex gap-2">
        <button onClick={testConnection} disabled={testing || masked || !apiKey.trim()}
          className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-sm text-gray-300 disabled:opacity-40 hover:border-[#A67C52]">
          {testing ? "Testen..." : "Verbinding testen"}
        </button>
        {testResult === "ok" && <span className="flex items-center text-sm text-green-400">✅ Verbonden</span>}
        {testResult === "fail" && <span className="flex items-center text-sm text-red-400">❌ Mislukt</span>}
      </div>

      <button onClick={save} disabled={saving || masked || !apiKey.trim()}
        className="mt-3 w-full rounded-xl bg-[#A67C52] py-3 text-sm font-bold text-white disabled:opacity-50">
        {saved ? "✅ Opgeslagen!" : saving ? "Opslaan..." : "Sleutel opslaan"}
      </button>

      {hasKey && (
        <button onClick={remove} className="mt-2 w-full rounded-xl border border-red-900/40 py-2.5 text-sm text-red-400 hover:border-red-700">
          Sleutel verwijderen
        </button>
      )}

      <div className="mt-5 rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-4">
        <p className="mb-1 text-xs font-semibold text-gray-400">🔒 Privacy</p>
        <p className="text-xs leading-relaxed text-gray-600">
          Je API-sleutel wordt versleuteld opgeslagen (AES-256). De sleutel verlaat nooit de server in leesbare vorm — alle AI-calls worden server-side uitgevoerd.
        </p>
      </div>
    </div>
  );
}
