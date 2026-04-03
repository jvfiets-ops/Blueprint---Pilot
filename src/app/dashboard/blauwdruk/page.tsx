"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";
import Link from "next/link";

interface Domain {
  id: string;
  name: string;
  positive: string;
  negative: string;
  improve: string;
}

const DEFAULT_DOMAIN_KEYS = [
  "domFysiek", "domMentaal", "domMedia", "domFinancien", "domRelaties", "domSlaap",
  "domIdentiteit", "domTijd", "domFamilie", "domGeloof", "domLeven", "domVertrouwd",
] as const;

export default function BlauwdrukPage() {
  const [lang] = useLang();
  const t = getT(lang);

  const [domains, setDomains] = useState<Domain[]>([]);
  const [selected, setSelected] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load domains
  useEffect(() => {
    const stored = localStorage.getItem("pilot-blueprint");
    if (stored) {
      setDomains(JSON.parse(stored));
    } else {
      // Initialize with defaults
      const defaults: Domain[] = DEFAULT_DOMAIN_KEYS.map((key, i) => ({
        id: `d${i}`,
        name: t[key] || key,
        positive: "",
        negative: "",
        improve: "",
      }));
      setDomains(defaults);
      localStorage.setItem("pilot-blueprint", JSON.stringify(defaults));
    }
  }, [t]);

  // Save
  const save = useCallback((updated: Domain[]) => {
    setDomains(updated);
    localStorage.setItem("pilot-blueprint", JSON.stringify(updated));
  }, []);

  // Simple canvas graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || domains.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;

    // Draw connections
    ctx.strokeStyle = "#2a3e33";
    ctx.lineWidth = 1;
    domains.forEach((_, i) => {
      const angle = (2 * Math.PI * i) / domains.length - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Center node
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#A67C52";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", cx, cy);

    // Domain nodes
    domains.forEach((d, i) => {
      const angle = (2 * Math.PI * i) / domains.length - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const hasFill = d.positive || d.negative || d.improve;

      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = hasFill ? "#7a9e7e" : "#2a3e33";
      ctx.fill();
      ctx.strokeStyle = selected?.id === d.id ? "#c9a67a" : "#3a4e43";
      ctx.lineWidth = selected?.id === d.id ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#e5e5e5";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      const labelY = y + 30;
      const words = d.name.split(" ");
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(" "), x, labelY);
        ctx.fillText(words.slice(2).join(" "), x, labelY + 13);
      } else {
        ctx.fillText(d.name, x, labelY);
      }
    });
  }, [domains, selected]);

  // Handle click on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const radius = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.35;

    for (let i = 0; i < domains.length; i++) {
      const angle = (2 * Math.PI * i) / domains.length - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (Math.hypot(mx - x, my - y) < 25) {
        setSelected(domains[i]);
        return;
      }
    }
    setSelected(null);
  };

  const updateSelected = (field: "positive" | "negative" | "improve", value: string) => {
    if (!selected) return;
    const updated = domains.map(d => d.id === selected.id ? { ...d, [field]: value } : d);
    const updatedSelected = { ...selected, [field]: value };
    setSelected(updatedSelected);
    save(updated);
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const d: Domain = { id: `d${Date.now()}`, name: newDomain.trim(), positive: "", negative: "", improve: "" };
    save([...domains, d]);
    setNewDomain("");
  };

  const removeDomain = (id: string) => {
    save(domains.filter(d => d.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-black text-white">🗺️ {t.blauwdrukTitle}</h1>
      <p className="mb-4 text-sm text-gray-400">{t.blauwdrukIntro}</p>

      {/* Canvas graph */}
      <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#0f1a14] p-2">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="h-[350px] w-full cursor-pointer"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Add domain */}
      <div className="mb-4 flex gap-2">
        <input
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addDomain()}
          placeholder={t.blauwdrukAdd}
          className="flex-1 rounded-xl border border-[#2a3e33] bg-[#1a2e23] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
        />
        <button onClick={addDomain} disabled={!newDomain.trim()} className="rounded-xl bg-[#A67C52] px-4 py-2 text-sm font-bold text-white disabled:opacity-30">+</button>
      </div>

      {/* Domain detail panel */}
      {selected && (
        <div className="mb-4 rounded-2xl border border-[#c9a67a]/30 bg-[#1a2e23] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">{selected.name}</h3>
            <button onClick={() => removeDomain(selected.id)} className="text-xs text-red-400 hover:text-red-300">✕</button>
          </div>

          {[
            { field: "positive" as const, label: t.blauwdrukPositive, value: selected.positive },
            { field: "negative" as const, label: t.blauwdrukNegative, value: selected.negative },
            { field: "improve" as const, label: t.blauwdrukImprove, value: selected.improve },
          ].map(f => (
            <div key={f.field} className="mb-3">
              <label className="mb-1 block text-xs text-gray-400">{f.label}</label>
              <div className="flex gap-2">
                <textarea
                  value={f.value}
                  onChange={e => updateSelected(f.field, e.target.value)}
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
                />
                <VoiceInput onTranscript={text => updateSelected(f.field, f.value ? f.value + " " + text : text)} lang={lang} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Jesse CTA */}
      <div className="rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/5 p-4 text-center">
        <p className="mb-2 text-xs leading-relaxed text-gray-400">{t.blauwdrukCTA}</p>
        <Link href="/dashboard/contact" className="text-sm font-semibold text-[#c9a67a] hover:underline">
          {t.contactCTA} →
        </Link>
      </div>
    </div>
  );
}
