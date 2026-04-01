import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(
      sessions.map((s) => ({
        ...s,
        messages: JSON.parse(s.messages),
        stressorsDetected: s.stressorsDetected ? JSON.parse(s.stressorsDetected) : [],
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, messages, summary, stressorsDetected } = await req.json();
    const session = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: title || "Sessie",
        messages: JSON.stringify(messages || []),
        summary: summary || null,
        stressorsDetected: stressorsDetected ? JSON.stringify(stressorsDetected) : null,
      },
    });
    return NextResponse.json(session);
  } catch (err) {
    console.error("Chat session error:", err);
    return NextResponse.json({ error: "Kon sessie niet opslaan" }, { status: 500 });
  }
}
