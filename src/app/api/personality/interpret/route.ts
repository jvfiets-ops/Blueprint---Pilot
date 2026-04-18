export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPersona, type Category, type Lang } from "@/lib/persona";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await prisma.personalityInterpretation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { situation } = await req.json();
  if (!situation?.trim()) {
    return NextResponse.json({ error: "Beschrijf eerst een situatie." }, { status: 400 });
  }

  // 1) Load personality profile
  let profile;
  try {
    profile = await prisma.personalityProfile.findUnique({ where: { userId: user.id } });
  } catch {
    profile = null;
  }
  if (!profile) {
    return NextResponse.json({ error: "Vul eerst de persoonlijkheidstest in." }, { status: 400 });
  }

  // 2) Load user category + language
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { category: true, language: true },
  });
  const personaCategory = (fullUser?.category || "") as Category;
  const personaLang: Lang = (fullUser?.language === "en" ? "en" : "nl");
  const persona = getPersona(personaCategory, personaLang);
  const categoryLabel = persona.categoryLabel || "High Performer";

  // 3) Build prompt
  const scores = {
    openness: Math.round(profile.openness),
    conscientiousness: Math.round(profile.conscientiousness),
    extraversion: Math.round(profile.extraversion),
    agreeableness: Math.round(profile.agreeableness),
    neuroticism: Math.round(profile.neuroticism),
  };

  const systemPrompt = personaLang === "nl"
    ? `Je bent een persoonlijkheidspsycholoog die de Big Five uitlegt in concrete situaties. Wees specifiek en persoonlijk, nooit generiek. Max 200 woorden.

Gebruik: Big Five scores (0-100) en de specifieke situatie. Geef:
**Waarschijnlijk gedrag** — wat doet deze persoon in deze situatie, gegeven hun scores? 2-3 zinnen.
**Waarschijnlijk gevoel** — wat voelen ze typisch? 2-3 zinnen.
**Drie concrete tips** — actiepunten specifiek voor deze scores en situatie. Gebruik werkwoorden.

Nooit zeggen "mensen met hoge [trait]..." — altijd "jij" of "je". Pas taal aan bij de categorie (${categoryLabel}).`
    : `You are a personality psychologist explaining Big Five in concrete situations. Be specific and personal, never generic. Max 200 words.

Input: Big Five scores (0-100) and a specific situation. Provide:
**Likely behavior** — what will this person do in this situation given their scores? 2-3 sentences.
**Likely feelings** — what do they typically feel? 2-3 sentences.
**Three concrete tips** — action items specific to these scores and situation. Start each with a verb.

Never say "people with high [trait]..." — always "you". Tailor language for the category (${categoryLabel}).`;

  const userPrompt = `Big Five scores:
- Openheid / Openness: ${scores.openness}
- Zorgvuldigheid / Conscientiousness: ${scores.conscientiousness}
- Extraversie / Extraversion: ${scores.extraversion}
- Vriendelijkheid / Agreeableness: ${scores.agreeableness}
- Neuroticisme / Neuroticism: ${scores.neuroticism}

Categorie: ${categoryLabel}
Situatie: ${situation.trim()}`;

  // 4) Call Anthropic (shared pilot key)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful fallback: return a template answer so UI still works
    const fallback = personaLang === "nl"
      ? `**Waarschijnlijk gedrag**\nJe Big Five scores (O:${scores.openness}, C:${scores.conscientiousness}, E:${scores.extraversion}, A:${scores.agreeableness}, N:${scores.neuroticism}) suggereren een specifiek patroon in "${situation.trim()}". Om echte interpretatie te krijgen, is er een actieve AI-sleutel nodig.\n\n**Waarschijnlijk gevoel**\nVraag Jesse om dit voor je te interpreteren of voeg een API-sleutel toe in de instellingen.\n\n**Drie tips**\n- Reflecteer hier morgen opnieuw op.\n- Bespreek met Jesse.\n- Vergelijk met hoe het eerder ging.`
      : `**Likely behavior**\nYour Big Five scores (O:${scores.openness}, C:${scores.conscientiousness}, E:${scores.extraversion}, A:${scores.agreeableness}, N:${scores.neuroticism}) suggest a specific pattern in "${situation.trim()}". For real interpretation, an active AI key is needed.\n\n**Likely feelings**\nAsk Jesse to interpret this for you or add an API key in settings.\n\n**Three tips**\n- Reflect on this again tomorrow.\n- Discuss with Jesse.\n- Compare with how this went before.`;
    const saved = await prisma.personalityInterpretation.create({
      data: { userId: user.id, situation: situation.trim(), fullText: fallback },
    });
    return NextResponse.json(saved);
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const saved = await prisma.personalityInterpretation.create({
      data: { userId: user.id, situation: situation.trim(), fullText: text },
    });
    return NextResponse.json(saved);
  } catch (err) {
    console.error("Personality interpret error:", err);
    return NextResponse.json({ error: "AI niet beschikbaar: " + String(err) }, { status: 500 });
  }
}
