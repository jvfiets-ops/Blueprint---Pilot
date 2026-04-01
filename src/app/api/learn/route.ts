export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/learn
 * Receives structured insights from any module and merges them into user_memory.
 * This enables the AI to learn about the user across all touchpoints.
 *
 * Body: {
 *   source: "personality" | "best-version" | "role-models" | "mentors" | "goals" | "ergodic" | "environment" | "reflection" | "chat",
 *   insights: {
 *     themes?: string[],           // Recurring themes detected
 *     strengths?: string[],        // Strengths identified
 *     challenges?: string[],       // Challenges/patterns
 *     values?: string[],           // Core values expressed
 *     goals?: string[],            // Goals mentioned
 *     personality_traits?: string[], // Personality observations
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { source, insights } = await req.json();
  if (!source || !insights) return NextResponse.json({ error: "Missing source or insights" }, { status: 400 });

  try {
    // Load existing memory
    const existing = await prisma.userMemory.findUnique({ where: { userId: user.id } });

    // Parse existing behavioral signals (or start fresh)
    let signals: Record<string, unknown> = {};
    if (existing?.behavioralSignals) {
      try { signals = JSON.parse(existing.behavioralSignals); } catch { signals = {}; }
    }

    // Merge new insights into behavioral signals under the source key
    signals[source] = {
      ...(signals[source] as Record<string, unknown> || {}),
      ...insights,
      updatedAt: new Date().toISOString(),
    };

    // Build enriched summary from all signals
    const allThemes = Object.values(signals)
      .flatMap((s: unknown) => (s as Record<string, unknown>)?.themes as string[] || [])
      .filter(Boolean);
    const allStrengths = Object.values(signals)
      .flatMap((s: unknown) => (s as Record<string, unknown>)?.strengths as string[] || [])
      .filter(Boolean);
    const allChallenges = Object.values(signals)
      .flatMap((s: unknown) => (s as Record<string, unknown>)?.challenges as string[] || [])
      .filter(Boolean);

    // Deduplicate
    const uniqueThemes = [...new Set(allThemes)].slice(0, 15);
    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 10);
    const uniqueChallenges = [...new Set(allChallenges)].slice(0, 10);

    // Update or create memory
    await prisma.userMemory.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        summary: existing?.summary || null,
        moodPatterns: JSON.stringify(uniqueThemes),
        recurringStressors: JSON.stringify(uniqueChallenges),
        behavioralSignals: JSON.stringify(signals),
      },
      update: {
        moodPatterns: JSON.stringify(uniqueThemes),
        recurringStressors: JSON.stringify(uniqueChallenges),
        behavioralSignals: JSON.stringify(signals),
      },
    });

    return NextResponse.json({
      ok: true,
      themes: uniqueThemes.length,
      strengths: uniqueStrengths.length,
      challenges: uniqueChallenges.length,
    });
  } catch (err) {
    console.error("Learn error:", err);
    return NextResponse.json({ ok: false });
  }
}
