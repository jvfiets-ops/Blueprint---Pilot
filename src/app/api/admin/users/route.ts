import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = req.nextUrl.searchParams.get("userId");

  // Detailed view for specific user
  if (userId) {
    const [targetUser, reflections, chatSessions, dailyGoals, personality, activities] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.reflection.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.chatSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.dailyGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.personalityProfile.findUnique({ where: { userId } }),
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }).catch(() => []),
    ]);

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      user: targetUser,
      reflections: reflections.map((r) => ({
        id: r.id,
        created_at: r.createdAt.toISOString(),
        mood_icon: r.moodIcon,
        mood_score: r.moodScore,
        event_label: r.eventLabel,
        event_reflection_text: r.eventReflectionText,
        ai_summary: r.aiSummary,
        conversation_transcript: r.conversationTranscript ? JSON.parse(r.conversationTranscript) : [],
      })),
      chatSessions: chatSessions.map((s) => ({
        id: s.id,
        created_at: s.createdAt.toISOString(),
        title: s.title,
        summary: s.summary,
        messages: JSON.parse(s.messages),
        stressors_detected: s.stressorsDetected ? JSON.parse(s.stressorsDetected) : [],
      })),
      dailyGoals: dailyGoals.map((g) => ({
        id: g.id, date: g.date, text: g.text, category: g.category,
      })),
      personality: personality ? {
        openness: personality.openness,
        conscientiousness: personality.conscientiousness,
        extraversion: personality.extraversion,
        agreeableness: personality.agreeableness,
        neuroticism: personality.neuroticism,
      } : null,
      activities: activities.map((a) => ({
        id: a.id, type: a.type, duration: a.duration,
        metadata: a.metadata ? JSON.parse(a.metadata) : null,
        created_at: a.createdAt.toISOString(),
      })),
    });
  }

  // Overview: all users with activity stats
  const users = await prisma.user.findMany({
    where: { role: { not: "admin" } },
    select: {
      id: true, name: true, email: true, createdAt: true, approved: true,
      _count: { select: { reflections: true, chatSessions: true, dailyGoals: true } },
    },
    orderBy: { name: "asc" },
  });

  const enriched = await Promise.all(
    users.map(async (u) => {
      // Login count & last login
      let loginCount = 0;
      let lastLogin: string | null = null;
      try {
        loginCount = await prisma.userActivity.count({
          where: { userId: u.id, type: "login" },
        });
        const last = await prisma.userActivity.findFirst({
          where: { userId: u.id, type: "login" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });
        lastLogin = last?.createdAt?.toISOString() ?? null;
      } catch {
        // table may not exist yet
      }

      // Last activity of any type
      let lastActivity: string | null = null;
      try {
        const lastAct = await prisma.userActivity.findFirst({
          where: { userId: u.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, type: true },
        });
        lastActivity = lastAct?.createdAt?.toISOString() ?? null;
      } catch {}

      // Recent goal
      const lastGoal = await prisma.dailyGoal.findFirst({
        where: { userId: u.id },
        orderBy: { createdAt: "desc" },
        select: { text: true },
      });

      return {
        ...u,
        loginCount,
        lastLogin,
        lastActivity,
        lastGoal: lastGoal?.text ?? null,
      };
    })
  );

  return NextResponse.json(enriched);
}
