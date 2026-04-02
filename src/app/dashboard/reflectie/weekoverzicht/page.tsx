export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JesseBanner from "@/components/JesseBanner";

export default async function WeekOverzichtPage() {
  const user = await requireUser();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [reflections, chatSessions, goals, memory] = await Promise.all([
    prisma.reflection.findMany({
      where: { userId: user.id, createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.chatSession.findMany({
      where: { userId: user.id, createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dailyGoal.findMany({
      where: { userId: user.id, createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userMemory.findUnique({ where: { userId: user.id } }),
  ]);

  const avgMood = reflections.length > 0
    ? (reflections.reduce((a, r) => a + (r.moodScore ?? 5), 0) / reflections.length).toFixed(1)
    : null;

  const goalCategories: Record<string, number> = {};
  goals.forEach((g) => {
    goalCategories[g.category] = (goalCategories[g.category] || 0) + 1;
  });

  const stressors: string[] = memory?.recurringStressors
    ? JSON.parse(memory.recurringStressors)
    : [];

  const hasActivity = reflections.length > 0 || chatSessions.length > 0 || goals.length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-extrabold text-white">📅 Weekoverzicht</h1>
      <p className="mb-6 text-sm text-gray-400">
        Terugblik op je afgelopen 7 dagen — patronen, voortgang en doelen.
      </p>

      {!hasActivity ? (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-16 text-center text-sm text-gray-600">
          Nog geen activiteit deze week. Start met een doel of reflectie!
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
              <p className="text-2xl font-extrabold text-white">{goals.length}</p>
              <p className="text-[10px] uppercase text-gray-500">Doelen</p>
            </div>
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
              <p className="text-2xl font-extrabold text-white">{reflections.length}</p>
              <p className="text-[10px] uppercase text-gray-500">Reflecties</p>
            </div>
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
              <p className="text-2xl font-extrabold text-white">{chatSessions.length}</p>
              <p className="text-[10px] uppercase text-gray-500">Gesprekken</p>
            </div>
            <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-3 text-center">
              <p className="text-2xl font-extrabold text-[#c9a67a]">{avgMood || "–"}</p>
              <p className="text-[10px] uppercase text-gray-500">Gem. stemming</p>
            </div>
          </div>

          {/* Goal themes */}
          {Object.keys(goalCategories).length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Doelen per categorie
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(goalCategories).map(([cat, count]) => (
                  <span key={cat} className="rounded-full bg-[#A67C52]/15 px-3 py-1 text-xs text-[#c9a67a]">
                    {cat} ×{count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent reflections summaries */}
          {reflections.filter((r) => r.aiSummary).length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Samenvattingen deze week
              </p>
              <div className="space-y-3">
                {reflections
                  .filter((r) => r.aiSummary)
                  .map((r) => (
                    <div key={r.id} className="border-l-2 border-[#A67C52]/30 pl-3">
                      <p className="text-xs text-gray-500">
                        {r.moodIcon} {new Date(r.createdAt).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="text-sm leading-relaxed text-gray-300">{r.aiSummary}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Stressors */}
          {stressors.length > 0 && (
            <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Lopende stressoren
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stressors.map((s, i) => (
                  <span key={i} className="rounded-full bg-[#A67C52]/10 px-3 py-1 text-xs text-[#c9a67a]">
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
