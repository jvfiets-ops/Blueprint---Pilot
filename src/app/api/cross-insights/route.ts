export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentIntention } = await req.json();

  // Gather all user context
  const [profiles, memory, recentReflections, mentors, rolmodellen, antsLogs, blauwdrukBronnen] = await Promise.all([
    prisma.performanceProfile.findMany({ where: { userId: user.id } }),
    prisma.userMemory.findUnique({ where: { userId: user.id } }),
    prisma.reflection.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.mentor.findMany({ where: { userId: user.id } }),
    prisma.rolmodel.findMany({ where: { userId: user.id } }),
    prisma.antsLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.blauwdrukBron.findMany({ where: { userId: user.id } }),
  ]);

  // Build context string
  const contextParts: string[] = [];

  if (currentIntention) contextParts.push(`HUIDIGE INTENTIE: "${currentIntention}"`);

  const besteVersie = profiles.find(p => p.bestVersionName);
  if (besteVersie) contextParts.push(`BESTE VERSIE: ${besteVersie.bestVersionName} — ${besteVersie.bestVersionDescription || ""}`);

  if (mentors.length > 0) contextParts.push(`MENTOREN: ${mentors.map(m => `${m.name} (leert: ${m.whatTheyTeachMe || ""})`).join("; ")}`);

  if (rolmodellen.length > 0) contextParts.push(`ROLMODELLEN: ${rolmodellen.map(r => `${r.naam} (kwaliteit: ${r.kwaliteit})`).join("; ")}`);

  if (recentReflections.length > 0) {
    const refTexts = recentReflections.map(r => r.eventReflectionText || r.aiSummary || "").filter(Boolean).slice(0, 3);
    if (refTexts.length > 0) contextParts.push(`RECENTE REFLECTIES: ${refTexts.join(" | ")}`);
  }

  if (antsLogs.length > 0) contextParts.push(`RECENTE ANTs: ${antsLogs.map(a => `"${a.antTekst}" → "${a.squash}"`).slice(0, 3).join("; ")}`);

  const vertrouwenBronnen = blauwdrukBronnen.filter(b => b.thema === "VERTROUWEN");
  if (vertrouwenBronnen.length > 0) contextParts.push(`VERTROUWENSBRONNEN: ${vertrouwenBronnen.map(b => b.titel).join(", ")}`);

  if (memory?.summary) contextParts.push(`COACH SAMENVATTING: ${memory.summary}`);

  if (contextParts.length < 2) {
    return NextResponse.json({ insight: null, reason: "Niet genoeg data voor koppelingen" });
  }

  // Try to generate insight via API key (if available)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Generate a simple rule-based insight
    let insight = "";
    if (besteVersie && currentIntention) {
      insight = `Je intentie van vandaag sluit aan bij je beste versie "${besteVersie.bestVersionName}". Hoe kun je die versie vandaag laten zien?`;
    } else if (mentors.length > 0 && currentIntention) {
      const mentor = mentors[0];
      insight = `Je mentor ${mentor.name} leert je: "${mentor.whatTheyTeachMe || ""}". Hoe verhoudt dat zich tot je intentie van vandaag?`;
    }
    return NextResponse.json({ insight: insight || null });
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: `Je bent een sportpsychologisch coach. Analyseer de volgende data van een gebruiker en genereer ONE specifieke, persoonlijke koppeling tussen hun intentie en hun eerder ingevulde data. Maximaal 2 zinnen. Wees concreet — verwijs naar specifieke dingen die de gebruiker heeft ingevuld. Nederlands. Geen algemeenheden.`,
      messages: [{ role: "user", content: contextParts.join("\n\n") }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ insight: text });
  } catch {
    return NextResponse.json({ insight: null });
  }
}
