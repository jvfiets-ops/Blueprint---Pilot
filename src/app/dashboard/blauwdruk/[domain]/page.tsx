"use client";
import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { getT, type Lang } from "@/lib/i18n";
import VoiceInput from "@/components/VoiceInput";

interface Props { params: Promise<{ domain: string }>; }

// Map URL slug to i18n key + color
const SLUG_TO_KEY: Record<string, { key: string; color: string; icon: string }> = {
  fysiek: { key: "domFysiek", color: "#E57373", icon: "💪" },
  mentaal: { key: "domMentaal", color: "#7986CB", icon: "🧠" },
  media: { key: "domMedia", color: "#FFB74D", icon: "📺" },
  financien: { key: "domFinancien", color: "#AED581", icon: "💰" },
  relaties: { key: "domRelaties", color: "#F06292", icon: "❤️" },
  slaap: { key: "domSlaap", color: "#7E57C2", icon: "😴" },
  identiteit: { key: "domIdentiteit", color: "#4FC3F7", icon: "🪞" },
  tijd: { key: "domTijd", color: "#FFD54F", icon: "⏰" },
  familie: { key: "domFamilie", color: "#FF8A65", icon: "👨‍👩‍👧" },
  geloof: { key: "domGeloof", color: "#BA68C8", icon: "🕊️" },
  leven: { key: "domLeven", color: "#81C784", icon: "🌳" },
  vertrouwd: { key: "domVertrouwd", color: "#4DD0E1", icon: "🤝" },
  ontspanning: { key: "domOntspanning", color: "#4DB6AC", icon: "🌿" },
  "positieve-afleiding": { key: "domPositieveAfleiding", color: "#9575CD", icon: "✨" },
};

interface Detail {
  begeleider?: string | null;
  aandacht?: string | null;
  watBrengt?: string | null;
  watGaatGoed?: string | null;
  watGaatMinder?: string | null;
  watAnders?: string | null;
  reflectie?: string | null;
}

export default function DomeinPage({ params }: Props) {
  const { domain } = use(params);
  const [lang] = useLang();
  const t = getT(lang);
  const nl = lang === "nl";
  const router = useRouter();

  const meta = SLUG_TO_KEY[domain];
  const [detail, setDetail] = useState<Detail>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/blueprint-domain-detail?domain=${domain}`)
      .then(r => r.json())
      .then(d => {
        if (d && typeof d === "object" && !d.error) setDetail(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [domain]);

  const title = meta ? (getT(lang as Lang)[meta.key as keyof ReturnType<typeof getT>] as string) : domain;

  const update = (field: keyof Detail, value: string) => {
    setDetail(prev => ({ ...prev, [field]: value }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save({ ...detail, [field]: value }), 800);
  };

  const save = async (data: Detail) => {
    try {
      await fetch("/api/blueprint-domain-detail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, ...data }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  };

  if (!meta) {
    return (
      <div className="mx-auto max-w-2xl text-center py-10">
        <p className="text-sm text-gray-400">{nl ? "Onbekend domein" : "Unknown domain"}</p>
        <button onClick={() => router.push("/dashboard/blauwdruk")} className="mt-4 rounded-xl bg-[#A67C52] px-4 py-2 text-sm text-white">
          ← {nl ? "Terug naar Blauwdruk" : "Back to Blueprint"}
        </button>
      </div>
    );
  }

  const fields: { key: keyof Detail; label: string }[] = [
    { key: "begeleider",    label: nl ? "Wie is mijn begeleider/coach op dit vlak?" : "Who guides/coaches me in this area?" },
    { key: "aandacht",      label: nl ? "Op welke manier besteed ik hier aandacht aan?" : "How do I pay attention to this?" },
    { key: "watBrengt",     label: nl ? "Wat brengt me dat?" : "What does that bring me?" },
    { key: "watGaatGoed",   label: nl ? "Wat gaat goed?" : "What goes well?" },
    { key: "watGaatMinder", label: nl ? "Wat gaat minder?" : "What goes less well?" },
    { key: "watAnders",     label: nl ? "Wat wil ik anders?" : "What do I want to change?" },
    { key: "reflectie",     label: nl ? "Hoe reflecteer ik hierop?" : "How do I reflect on this?" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Saved toast */}
      {saved && (
        <div className="fixed right-4 top-4 z-50 rounded-full bg-[#22c55e]/90 px-3 py-1 text-xs font-bold text-black">
          ✓ {nl ? "Opgeslagen" : "Saved"}
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/blauwdruk")}
        className="mb-4 text-sm text-gray-500 hover:text-white"
      >
        ← {nl ? "Terug naar Blauwdruk" : "Back to Blueprint"}
      </button>

      {/* Header */}
      <div
        className="mb-6 rounded-2xl border p-5"
        style={{ borderColor: meta.color + "66", background: meta.color + "11" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <h1 className="text-2xl font-black" style={{ color: meta.color }}>{title}</h1>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {nl
            ? "Verdiep dit domein. Jouw antwoorden worden automatisch opgeslagen."
            : "Deepen this domain. Your answers are saved automatically."}
        </p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500">...</div>
      ) : (
        <>
          {fields.map(f => (
            <div key={f.key} className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-gray-400">{f.label}</label>
              <div className="flex gap-2">
                <textarea
                  value={(detail[f.key] as string) || ""}
                  onChange={e => update(f.key, e.target.value)}
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
                />
                <VoiceInput
                  onTranscript={text => {
                    const current = (detail[f.key] as string) || "";
                    update(f.key, current ? current + " " + text : text);
                  }}
                  lang={lang}
                />
              </div>
            </div>
          ))}

          {/* Jesse CTA */}
          <div className="mt-6 rounded-2xl border border-[#A67C52]/20 bg-[#A67C52]/5 p-4 text-center">
            <p className="mb-2 text-xs leading-relaxed text-gray-400">
              {nl
                ? "Inzicht is de eerste stap. Bespreek je bevindingen met Jesse voor de volgende stap."
                : "Insight is the first step. Discuss your findings with Jesse for the next step."}
            </p>
            <Link href="/dashboard/contact" className="text-sm font-semibold text-[#c9a67a] hover:underline">
              {t.contactCTA || (nl ? "Plan een sessie met Jesse" : "Schedule a session with Jesse")} →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
