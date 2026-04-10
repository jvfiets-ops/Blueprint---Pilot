export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/ai/provider";
import { buildReflectionSystemPrompt } from "@/lib/system-prompts";
import { decrypt } from "@/lib/encryption";

const DEMO_LIMIT = 20;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { messages } = await req.json();

  // Load user memory
  const memory = await prisma.userMemory.findUnique({ where: { userId: user.id } });

  // Load AI settings
  const aiSettings = await prisma.userAISetting.findUnique({ where: { userId: user.id } });

  let decryptedKey: string | undefined;
  let hasOwnKey = false;

  if (aiSettings?.encryptedApiKey) {
    try {
      decryptedKey = decrypt(aiSettings.encryptedApiKey);
      hasOwnKey = true;
    } catch {
      // Decryption failed — fall back to demo
    }
  }

  // Check usage limits if using demo key (and not scripted fallback)
  if (!hasOwnKey && process.env.ANTHROPIC_API_KEY) {
    const today = new Date().toISOString().slice(0, 10);
    const usage = await prisma.usageLimit.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });
    const count = usage?.messageCount ?? 0;
    if (count >= DEMO_LIMIT) {
      return NextResponse.json({ error: "Demo limiet bereikt", limit: DEMO_LIMIT }, { status: 429 });
    }
    await prisma.usageLimit.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      create: { userId: user.id, date: today, messageCount: 1 },
      update: { messageCount: { increment: 1 } },
    });
  }

  // Load additional context for enriched coaching
  const [profiles, recentSessions, mentors, rolmodellen, antsLogs, blauwdrukBronnen] = await Promise.all([
    prisma.performanceProfile.findMany({ where: { userId: user.id } }).catch(() => []),
    prisma.chatSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, select: { summary: true } }).catch(() => []),
    prisma.mentor.findMany({ where: { userId: user.id } }).catch(() => []),
    prisma.rolmodel.findMany({ where: { userId: user.id } }).catch(() => []),
    prisma.antsLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    prisma.blauwdrukBron.findMany({ where: { userId: user.id }, take: 10 }).catch(() => []),
  ]);

  // Build enriched context
  const extraContext: string[] = [];
  const besteVersie = profiles.find(p => p.bestVersionName);
  if (besteVersie) extraContext.push(`BESTE VERSIE: "${besteVersie.bestVersionName}" — ${besteVersie.bestVersionDescription || ""}`);
  if (mentors.length > 0) extraContext.push(`MENTOREN: ${mentors.map(m => `${m.name} (${m.whatTheyTeachMe || ""})`).join(", ")}`);
  if (rolmodellen.length > 0) extraContext.push(`ROLMODELLEN: ${rolmodellen.map(r => `${r.naam} (kwaliteit: ${r.kwaliteit})`).join(", ")}`);
  if (antsLogs.length > 0) extraContext.push(`RECENTE ANTs: ${antsLogs.slice(0, 3).map(a => `"${a.antTekst}"`).join(", ")}`);
  const vertrouwen = blauwdrukBronnen.filter(b => b.thema === "VERTROUWEN");
  if (vertrouwen.length > 0) extraContext.push(`VERTROUWENSBRONNEN: ${vertrouwen.map(b => b.titel).join(", ")}`);
  const sessionSummaries = recentSessions.filter(s => s.summary).map(s => s.summary);
  if (sessionSummaries.length > 0) extraContext.push(`EERDERE GESPREKKEN: ${sessionSummaries.join(" | ")}`);

  const systemPrompt = buildReflectionSystemPrompt(user.name, memory ? {
    summary: memory.summary,
    mood_patterns: memory.moodPatterns ? JSON.parse(memory.moodPatterns) : null,
    recurring_stressors: memory.recurringStressors ? JSON.parse(memory.recurringStressors) : null,
    behavioral_signals: memory.behavioralSignals ? JSON.parse(memory.behavioralSignals) : null,
  } : null) + (extraContext.length > 0 ? `\n\nAanvullende context over deze gebruiker:\n${extraContext.join("\n")}` : "");

  try {
    const provider = getProvider(
      aiSettings ? { provider: aiSettings.provider as "anthropic" | "openai", encryptedApiKey: aiSettings.encryptedApiKey, modelOverride: aiSettings.modelOverride } : null,
      decryptedKey
    );
    const stream = provider.chat(messages, systemPrompt);

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json({ error: "AI niet beschikbaar" }, { status: 500 });
  }
}
