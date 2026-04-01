import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reflections = await prisma.reflection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(
    reflections.map((r) => ({
      ...r,
      mood_icon: r.moodIcon,
      mood_score: r.moodScore,
      event_label: r.eventLabel,
      event_reflection_text: r.eventReflectionText,
      ai_summary: r.aiSummary,
      conversation_transcript: r.conversationTranscript ? JSON.parse(r.conversationTranscript) : [],
      created_at: r.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const reflection = await prisma.reflection.create({
    data: {
      userId: user.id,
      moodIcon: body.mood_icon || "😐",
      moodScore: body.mood_score ?? 5,
      conversationTranscript: JSON.stringify(body.conversation_transcript || []),
      eventLabel: body.event_label || "Training",
      eventReflectionText: body.event_reflection_text || "",
      aiSummary: body.ai_summary || null,
      appVersion: body.app_version || "1.0",
    },
  });
  return NextResponse.json({
    ...reflection,
    mood_icon: reflection.moodIcon,
    mood_score: reflection.moodScore,
    event_label: reflection.eventLabel,
    event_reflection_text: reflection.eventReflectionText,
    ai_summary: reflection.aiSummary,
    conversation_transcript: body.conversation_transcript || [],
    created_at: reflection.createdAt.toISOString(),
  });
}
