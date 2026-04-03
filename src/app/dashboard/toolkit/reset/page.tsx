"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";

export default function ResetRoutinePage() {
  const [lang] = useLang();
  const t = getT(lang);

  const [faultReaction, setFaultReaction] = useState("");
  const [letGo, setLetGo] = useState("");
  const [signal, setSignal] = useState("");
  const [control, setControl] = useState("");
  const [saved, setSaved] = useState(false);
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pilot-reset-routine");
    if (stored) {
      const data = JSON.parse(stored);
      setFaultReaction(data.faultReaction || "");
      setLetGo(data.letGo || "");
      setSignal(data.signal || "");
      setControl(data.control || "");
      if (data.faultReaction || data.letGo || data.signal || data.control) setViewing(true);
    }
  }, []);

  const save = () => {
    localStorage.setItem("pilot-reset-routine", JSON.stringify({ faultReaction, letGo, signal, control }));
    setSaved(true);
    setViewing(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { key: "faultReaction", label: t.toolResetFault, value: faultReaction, set: setFaultReaction, icon: "😤" },
    { key: "letGo", label: t.toolResetLetGo, value: letGo, set: setLetGo, icon: "💨" },
    { key: "signal", label: t.toolResetSignal, value: signal, set: setSignal, icon: "🔔" },
    { key: "control", label: t.toolResetControl, value: control, set: setControl, icon: "✊" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {saved && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-[#22c55e]/90 px-4 py-1.5 text-xs font-bold text-black">{t.refSaved}</div>
      )}
      <h1 className="mb-2 text-2xl font-black text-white">🔄 {t.toolReset}</h1>
      <p className="mb-6 text-sm leading-relaxed text-gray-400">{t.toolResetExplain}</p>

      {viewing ? (
        <>
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.key} className="flex items-start gap-3 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A67C52]/20 text-lg">{f.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a67a]">{lang === "nl" ? `Stap ${i + 1}` : `Step ${i + 1}`}</p>
                  <p className="text-sm text-gray-200">{f.value || "-"}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setViewing(false)} className="mt-4 w-full rounded-xl border border-[#2a3e33] py-2.5 text-sm text-gray-400 hover:text-white">{t.refEdit}</button>
        </>
      ) : (
        <>
          {fields.map(f => (
            <div key={f.key} className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-gray-400">{f.icon} {f.label}</label>
              <div className="flex gap-2">
                <textarea value={f.value} onChange={e => f.set(e.target.value)} rows={2} placeholder="..."
                  className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
                <VoiceInput onTranscript={text => f.set(prev => prev ? prev + " " + text : text)} lang={lang} />
              </div>
            </div>
          ))}
          <button onClick={save} className="w-full rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white">{t.refSave}</button>
        </>
      )}
    </div>
  );
}
