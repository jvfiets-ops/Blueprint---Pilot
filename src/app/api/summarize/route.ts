export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSummarizePrompt } from "@/lib/system-prompts";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { transcript } = await req.json();
  if (!transcript?.length) return NextResponse.json({ ok: true });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true }); // Skip if no key

  try {
    const { AnthropicProvider } = require("@/lib/ai/anthropic");
    const provider = new AnthropicProvider(apiKey);
    const prompt = buildSummarizePrompt(transcript);
    let fullResponse = "";

    for await (const chunk of provider.chat(
      [{ role: "user", content: prompt }],
      "Je bent een nauwkeurige data-extractor. Antwoord altijd in geldig JSON."
    )) {
      fullResponse += chunk;
    }

    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ ok: true });
    const extracted = JSON.parse(jsonMatch[0]);

    await prisma.userMemory.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        summary: extracted.summary,
        moodPatterns: JSON.stringify(extracted.mood_patterns),
        recurringStressors: JSON.stringify(extracted.recurring_stressors),
        behavioralSignals: JSON.stringify(extracted.behavioral_signals),
      },
      update: {
        summary: extracted.summary,
        moodPatterns: JSON.stringify(extracted.mood_patterns),
        recurringStressors: JSON.stringify(extracted.recurring_stressors),
        behavioralSignals: JSON.stringify(extracted.behavioral_signals),
      },
    });

    return NextResponse.json({ ok: true, summary: extracted.summary });
  } catch (err) {
    console.error("Summarize error:", err);
    return NextResponse.json({ ok: true });
  }
}
