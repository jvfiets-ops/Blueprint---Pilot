"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

interface Face { id: string; name: string; codewords: string[]; color: string; }

const COLORS = ["#A67C52", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#f59e0b"];

export default function GameFacePage() {
  const router = useRouter();
  const [lang] = useLang();
  const tt = getT(lang);
  const [faces, setFaces] = useState<Face[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeFace, setActiveFace] = useState<Face | null>(null);
  const [name, setName] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [color, setColor] = useState("#A67C52");

  useEffect(() => { fetch("/api/game-face").then(r => r.json()).then(d => { if (Array.isArray(d)) setFaces(d); }).catch(() => {}); }, []);

  const addWord = () => { if (wordInput.trim() && words.length < 3) { setWords([...words, wordInput.trim()]); setWordInput(""); } };

  const save = async () => {
    const res = await fetch("/api/game-face", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, codewords: words, color }) });
    const face = await res.json();
    setFaces([face, ...faces]);
    setShowForm(false); setName(""); setWords([]); setColor("#A67C52");
  };

  // Full screen activation
  if (activeFace) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8" style={{ background: "#0a0f0c" }}>
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-widest" style={{ color: activeFace.color + "88" }}>Game Face</p>
          <h1 className="text-3xl font-black text-white">{activeFace.name}</h1>
        </div>
        <div className="flex flex-col items-center gap-6">
          {activeFace.codewords.map((w, i) => (
            <span key={i} className="text-4xl font-extrabold md:text-6xl" style={{ color: activeFace.color, textShadow: `0 0 40px ${activeFace.color}44` }}>
              {w}
            </span>
          ))}
        </div>
        <button onClick={() => setActiveFace(null)} className="mt-12 rounded-xl border border-[#2a3e33] px-8 py-3 text-sm text-gray-500 hover:text-white">
          Klaar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={() => router.push("/dashboard/toolkit")} className="mb-4 text-sm text-gray-500 hover:text-white">{tt.backToolkit}</button>
      <h1 className="mb-1 text-xl font-bold text-white">🔥 {tt.gfTitle}</h1>
      <p className="mb-6 text-sm text-gray-400">{tt.gfSub}</p>

      {/* Create form */}
      {showForm ? (
        <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <h3 className="mb-3 text-sm font-bold text-white">{tt.gfNew}</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={tt.gfNamePh}
            className="mb-3 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-[#A67C52]" />

          <label className="mb-1 block text-xs font-semibold text-gray-400">{tt.gfCodewords}</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {words.map((w, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold" style={{ background: color + "22", color }}>
                {w} <button onClick={() => setWords(words.filter((_, j) => j !== i))} className="text-xs opacity-50">✕</button>
              </span>
            ))}
          </div>
          {words.length < 3 && (
            <div className="mb-3 flex gap-2">
              <input value={wordInput} onChange={e => setWordInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addWord(); } }}
                placeholder="Codewoord..." className="flex-1 rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none" />
              <button onClick={addWord} className="rounded-xl bg-[#A67C52] px-3 text-sm font-bold text-white">+</button>
            </div>
          )}

          <label className="mb-1 block text-xs font-semibold text-gray-400">Kleur</label>
          <div className="mb-4 flex gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full border-2 transition-transform" style={{ background: c, borderColor: color === c ? "#fff" : "transparent", transform: color === c ? "scale(1.2)" : "scale(1)" }} />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={save} disabled={!name.trim() || words.length === 0} className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white disabled:opacity-40">Opslaan</button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-sm text-gray-400">Annuleer</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="mb-5 w-full rounded-xl border border-dashed border-[#2a3e33] py-3 text-sm text-gray-500 hover:border-[#A67C52] hover:text-[#c9a67a]">
          + Nieuw Game Face
        </button>
      )}

      {/* Existing faces */}
      {faces.map(f => (
        <div key={f.id} className="mb-3 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold text-white">{f.name}</h3>
            <div className="h-3 w-3 rounded-full" style={{ background: f.color }} />
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {f.codewords.map((w, i) => (
              <span key={i} className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: f.color + "22", color: f.color }}>{w}</span>
            ))}
          </div>
          <button onClick={() => setActiveFace(f)} className="w-full rounded-xl py-2 text-sm font-semibold transition-colors" style={{ background: f.color + "15", color: f.color }}>
            🔥 Activeren
          </button>
        </div>
      ))}

      {faces.length === 0 && !showForm && (
        <p className="text-center text-sm text-gray-600">Nog geen game faces. Maak je eerste aan.</p>
      )}
    </div>
  );
}
