"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { getT, type Lang } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";
import Link from "next/link";

interface Domain {
  id: string;
  name: string;
  nameKey?: string;
  positive: string;
  negative: string;
  improve: string;
}

const DEFAULT_DOMAIN_KEYS = [
  "domFysiek", "domMentaal", "domMedia", "domFinancien", "domRelaties", "domSlaap",
  "domIdentiteit", "domTijd", "domFamilie", "domGeloof", "domLeven", "domVertrouwd",
  "domOntspanning", "domPositieveAfleiding",
] as const;

// Map nameKey to URL slug for the [domain] detail page
const DOMAIN_SLUG: Record<string, string> = {
  domFysiek: "fysiek",
  domMentaal: "mentaal",
  domMedia: "media",
  domFinancien: "financien",
  domRelaties: "relaties",
  domSlaap: "slaap",
  domIdentiteit: "identiteit",
  domTijd: "tijd",
  domFamilie: "familie",
  domGeloof: "geloof",
  domLeven: "leven",
  domVertrouwd: "vertrouwd",
  domOntspanning: "ontspanning",
  domPositieveAfleiding: "positieve-afleiding",
};

// Special colors for the newly added domains
const DOMAIN_COLOR: Record<string, string> = {
  domOntspanning: "#4DB6AC",       // teal
  domPositieveAfleiding: "#9575CD", // purple
};

// Map Dutch domain names to i18n keys (for domains saved without nameKey)
const NL_NAME_TO_KEY: Record<string, string> = {};
(() => {
  const nlT = getT("nl");
  for (const key of DEFAULT_DOMAIN_KEYS) {
    NL_NAME_TO_KEY[nlT[key]] = key;
  }
})();

function getTranslatedName(nameKey: string | undefined, name: string, lang: Lang): string {
  const key = nameKey || NL_NAME_TO_KEY[name];
  if (!key) return name;
  const tr = getT(lang);
  return tr[key as keyof typeof tr] || name;
}

export default function BlauwdrukPage() {
  const [lang] = useLang();
  const t = getT(lang);
  const router = useRouter();

  const [rawDomains, setRawDomains] = useState<Domain[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef(false);

  // Translate domain names based on current language
  const domains = rawDomains.map(d => ({
    ...d,
    name: getTranslatedName(d.nameKey, d.name, lang),
  }));
  const selected = domains.find(d => d.id === selectedId) || null;

  // Load once on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const stored = localStorage.getItem("pilot-blueprint");
    if (stored) {
      // Migrate: add nameKey to domains that don't have it
      const parsed: Domain[] = JSON.parse(stored);
      const migrated = parsed.map(d => ({
        ...d,
        nameKey: d.nameKey || NL_NAME_TO_KEY[d.name] || undefined,
      }));

      // Migrate: add new domains (ontspanning + positieve-afleiding) if missing
      const presentKeys = new Set(migrated.map(d => d.nameKey).filter(Boolean));
      const tr = getT("nl");
      const toAdd: Domain[] = [];
      for (const key of ["domOntspanning", "domPositieveAfleiding"] as const) {
        if (!presentKeys.has(key)) {
          toAdd.push({
            id: `d_${key}_${Date.now()}`,
            name: tr[key] || key,
            nameKey: key,
            positive: "",
            negative: "",
            improve: "",
          });
        }
      }
      const final = [...migrated, ...toAdd];
      setRawDomains(final);
      localStorage.setItem("pilot-blueprint", JSON.stringify(final));
    } else {
      const tr = getT("nl");
      const defaults: Domain[] = DEFAULT_DOMAIN_KEYS.map((key, i) => ({
        id: `d${i}`,
        name: tr[key] || key,
        nameKey: key,
        positive: "",
        negative: "",
        improve: "",
      }));
      setRawDomains(defaults);
      localStorage.setItem("pilot-blueprint", JSON.stringify(defaults));
    }
  }, []);

  // Save helper
  const save = useCallback((updated: Domain[]) => {
    setRawDomains(updated);
    localStorage.setItem("pilot-blueprint", JSON.stringify(updated));
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
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

    // Lines
    ctx.strokeStyle = "#2a3e33";
    ctx.lineWidth = 1;
    domains.forEach((_, i) => {
      const angle = (2 * Math.PI * i) / domains.length - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.stroke();
    });

    // Center
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = "#A67C52";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", cx, cy);

    // Nodes
    domains.forEach((d, i) => {
      const angle = (2 * Math.PI * i) / domains.length - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const hasFill = d.positive || d.negative || d.improve;
      const specialColor = d.nameKey ? DOMAIN_COLOR[d.nameKey] : undefined;

      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      if (specialColor) {
        ctx.fillStyle = hasFill ? specialColor : specialColor + "33";
      } else {
        ctx.fillStyle = hasFill ? "#7a9e7e" : "#2a3e33";
      }
      ctx.fill();
      ctx.strokeStyle = selectedId === d.id ? "#c9a67a" : (specialColor || "#3a4e43");
      ctx.lineWidth = selectedId === d.id ? 2 : 1;
      ctx.stroke();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains.length, selectedId, lang]);

  // Redraw when needed
  useEffect(() => { drawCanvas(); }, [drawCanvas]);

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
        const d = domains[i];
        // If domain has a known slug (i18n key), navigate to the detail page.
        const slug = d.nameKey ? DOMAIN_SLUG[d.nameKey] : undefined;
        if (slug) {
          router.push(`/dashboard/blauwdruk/${slug}`);
          return;
        }
        // Custom domain (user-added) — edit inline
        setSelectedId(d.id);
        return;
      }
    }
    setSelectedId(null);
  };

  const updateSelected = (field: "positive" | "negative" | "improve", value: string) => {
    if (!selectedId) return;
    const updated = rawDomains.map(d => d.id === selectedId ? { ...d, [field]: value } : d);
    save(updated);
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const d: Domain = { id: `d${Date.now()}`, name: newDomain.trim(), positive: "", negative: "", improve: "" };
    save([...rawDomains, d]);
    setNewDomain("");
  };

  const removeDomain = (id: string) => {
    save(rawDomains.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-black text-white">🗺️ {t.blauwdrukTitle}</h1>

      {/* Vertrouwen is verplaatst naar "Beste versie" in de toolkit */}
      <div className="mb-4">
        <Link href="/dashboard/toolkit/beste-versie" className="flex items-center justify-between gap-2 rounded-xl border border-[#D4A76A]/20 bg-[#D4A76A]/5 p-3 text-xs font-medium text-[#D4A76A] hover:bg-[#D4A76A]/10">
          <span>🛡️ {lang === "nl" ? "Zelfvertrouwen staat nu onder 'Beste versie' in de toolkit" : "Confidence is now under 'Best version' in the toolkit"}</span>
          <span>→</span>
        </Link>
      </div>
      <p className="mb-2 text-sm text-gray-400">{t.blauwdrukIntro}</p>
      <p className="mb-4 text-xs text-gray-500">
        {lang === "nl"
          ? "Klik op een domein om het te verdiepen: wie begeleidt je, hoe besteed je er aandacht aan, wat gaat goed, wat wil je anders?"
          : "Click on a domain to deepen it: who guides you, how do you pay attention, what goes well, what do you want to change?"}
      </p>

      <div className="mb-4 rounded-2xl border border-[#2a3e33] bg-[#0f1a14] p-2">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="h-[400px] w-full cursor-pointer" />
      </div>

      <div className="mb-4 flex gap-2">
        <input value={newDomain} onChange={e => setNewDomain(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addDomain()} placeholder={t.blauwdrukAdd}
          className="flex-1 rounded-xl border border-[#2a3e33] bg-[#1a2e23] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
        <button onClick={addDomain} disabled={!newDomain.trim()} className="rounded-xl bg-[#A67C52] px-4 py-2 text-sm font-bold text-white disabled:opacity-30">+</button>
      </div>

      {selected && (
        <div className="mb-4 rounded-2xl border border-[#c9a67a]/30 bg-[#1a2e23] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">{selected.name}</h3>
            <button onClick={() => removeDomain(selected.id)} className="text-xs text-red-400 hover:text-red-300">✕</button>
          </div>
          {([
            { field: "positive" as const, label: t.blauwdrukPositive, value: selected.positive },
            { field: "negative" as const, label: t.blauwdrukNegative, value: selected.negative },
            { field: "improve" as const, label: t.blauwdrukImprove, value: selected.improve },
          ]).map(f => (
            <div key={f.field} className="mb-3">
              <label className="mb-1 block text-xs text-gray-400">{f.label}</label>
              <div className="flex gap-2">
                <textarea value={f.value} onChange={e => updateSelected(f.field, e.target.value)} rows={2}
                  className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]" />
                <VoiceInput onTranscript={text => updateSelected(f.field, f.value ? f.value + " " + text : text)} lang={lang} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/5 p-4 text-center">
        <p className="mb-2 text-xs leading-relaxed text-gray-400">{t.blauwdrukCTA}</p>
        <Link href="/dashboard/contact" className="text-sm font-semibold text-[#c9a67a] hover:underline">
          {t.contactCTA} →
        </Link>
      </div>
    </div>
  );
}
