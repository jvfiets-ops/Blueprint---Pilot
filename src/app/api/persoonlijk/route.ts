import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [personality, profiles, roleModels, mentors, memory, recentGoals, recentReflections] = await Promise.all([
    prisma.personalityProfile.findUnique({ where: { userId: user.id } }),
    prisma.performanceProfile.findMany({ where: { userId: user.id } }),
    prisma.roleModel.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.mentor.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.userMemory.findUnique({ where: { userId: user.id } }),
    prisma.dailyGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.reflection.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return NextResponse.json({
    personality: personality ? {
      openness: personality.openness,
      conscientiousness: personality.conscientiousness,
      extraversion: personality.extraversion,
      agreeableness: personality.agreeableness,
      neuroticism: personality.neuroticism,
    } : null,
    profiles: profiles.map((p) => ({
      context: p.context,
      best_version_name: p.bestVersionName,
      best_version_description: p.bestVersionDescription,
      best_version_keywords: JSON.parse(p.bestVersionKeywords),
      best_version_codewords: JSON.parse(p.bestVersionCodewords),
      worst_version_name: p.worstVersionName,
      worst_version_description: p.worstVersionDescription,
    })),
    roleModels: roleModels.map((m) => ({
      name: m.name,
      domain: m.domain,
      emoji: m.emoji,
      why_inspiring: m.whyInspiring,
      qualities_to_adopt: JSON.parse(m.qualitiesToAdopt),
    })),
    mentors: mentors.map((m) => ({
      name: m.name,
      role: m.role,
      emoji: m.emoji,
      whatTheyTeachMe: m.whatTheyTeachMe,
      keyLessons: JSON.parse(m.keyLessons),
    })),
    memory: memory ? {
      summary: memory.summary,
      recurring_stressors: memory.recurringStressors ? JSON.parse(memory.recurringStressors) : [],
      behavioral_signals: memory.behavioralSignals ? JSON.parse(memory.behavioralSignals) : [],
      mood_patterns: memory.moodPatterns ? JSON.parse(memory.moodPatterns) : [],
    } : null,
    recentGoals: recentGoals.map((g) => ({ date: g.date, text: g.text, category: g.category })),
    recentReflections: recentReflections.map((r) => ({
      created_at: r.createdAt.toISOString(),
      mood_icon: r.moodIcon,
      mood_score: r.moodScore,
      event_label: r.eventLabel,
      ai_summary: r.aiSummary,
    })),
  });
}
