import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GeschiedenisClient from "./GeschiedenisClient";

export default async function GeschiedenisPage() {
  const user = await requireUser();

  const [reflections, chatSessions] = await Promise.all([
    prisma.reflection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const formattedReflections = reflections.map((r) => ({
    id: r.id,
    type: "reflection" as const,
    created_at: r.createdAt.toISOString(),
    mood_icon: r.moodIcon || "😐",
    mood_score: r.moodScore ?? 5,
    event_label: r.eventLabel,
    event_reflection_text: r.eventReflectionText || "",
    ai_summary: r.aiSummary || "",
    conversation_transcript: r.conversationTranscript ? JSON.parse(r.conversationTranscript) : [],
    title: "",
  }));

  const formattedSessions = chatSessions.map((s) => ({
    id: s.id,
    type: "chat" as const,
    created_at: s.createdAt.toISOString(),
    mood_icon: "🧠",
    mood_score: 0,
    event_label: "",
    event_reflection_text: "",
    ai_summary: s.summary || "",
    conversation_transcript: JSON.parse(s.messages),
    title: s.title || "Gesprek",
  }));

  // Merge and sort by date
  const all = [...formattedReflections, ...formattedSessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return <GeschiedenisClient items={all} />;
}
