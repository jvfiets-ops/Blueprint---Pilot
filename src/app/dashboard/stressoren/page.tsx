import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JesseBanner from "@/components/JesseBanner";

const CATEGORIES = [
  { key: "mentaal", icon: "🧠", label: "Mentaal", color: "#A67C52" },
  { key: "fysiek", icon: "⚡", label: "Fysiek", color: "#c9a67a" },
  { key: "financieel", icon: "💶", label: "Financieel", color: "#7a9e7e" },
  { key: "relationeel", icon: "💬", label: "Relationeel", color: "#6b8f71" },
  { key: "prestatie", icon: "🎯", label: "Prestatie", color: "#8fae93" },
  { key: "gezondheid", icon: "❤️", label: "Gezondheid", color: "#a3c4a8" },
];

export default async function StressorenOverzicht() {
  const user = await requireUser();

  const memory = await prisma.userMemory.findUnique({ where: { userId: user.id } });
  const stressors: string[] = memory?.recurringStressors
    ? JSON.parse(memory.recurringStressors)
    : [];
  const signals: string[] = memory?.behavioralSignals
    ? JSON.parse(memory.behavioralSignals)
    : [];

  // Count stressors per category (simple keyword matching)
  const counts: Record<string, number> = {};
  CATEGORIES.forEach((c) => (counts[c.key] = 0));
  stressors.forEach((s) => {
    const lower = s.toLowerCase();
    if (lower.includes("geld") || lower.includes("financ")) counts["financieel"]++;
    else if (lower.includes("relat") || lower.includes("partner") || lower.includes("team")) counts["relationeel"]++;
    else if (lower.includes("presta") || lower.includes("druk") || lower.includes("resultaat")) counts["prestatie"]++;
    else if (lower.includes("slap") || lower.includes("voeding") || lower.includes("gezond")) counts["gezondheid"]++;
    else if (lower.includes("fysiek") || lower.includes("bless") || lower.includes("lichaam")) counts["fysiek"]++;
    else counts["mentaal"]++;
  });

  const maxCount = Math.max(...Object.values(counts), 1);
  const hasData = stressors.length > 0 || signals.length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-extrabold text-white">📊 Stressorenkaart</h1>
      <p className="mb-6 text-sm text-gray-400">
        Visueel overzicht van terugkerende stressorthema&apos;s, opgebouwd vanuit je gesprekken.
      </p>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-16 text-center">
          <p className="text-sm text-gray-600">
            Nog geen stressorendata. Voer een paar gesprekken met de mentale coach en je kaart bouwt zich automatisch op.
          </p>
        </div>
      ) : (
        <>
          {/* Category bars */}
          <div className="mb-6 space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-semibold text-white">{cat.label}</span>
                  <span className="ml-auto text-xs text-gray-500">{counts[cat.key]}×</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#152620]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(counts[cat.key] / maxCount) * 100}%`,
                      background: cat.color,
                      minWidth: counts[cat.key] > 0 ? "8px" : "0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Raw stressors list */}
          {stressors.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Gedetecteerde stressoren
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stressors.map((s, i) => (
                  <span key={i} className="rounded-full bg-[#A67C52]/15 px-3 py-1 text-xs text-[#c9a67a]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Behavioral signals */}
          {signals.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Gedragssignalen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {signals.map((s, i) => (
                  <span key={i} className="rounded-full bg-[#1C3D2E] px-3 py-1 text-xs text-[#8fae93]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <JesseBanner />
    </div>
  );
}
