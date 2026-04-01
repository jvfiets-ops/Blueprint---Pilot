import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatMentor(m: Record<string, unknown>) {
  return {
    ...m,
    key_lessons: JSON.parse((m.keyLessons as string) || "[]"),
    what_they_teach_me: m.whatTheyTeachMe,
    how_they_help_me: m.howTheyHelpMe,
    contact_frequency: m.contactFrequency,
    gratitude_note: m.gratitudeNote,
    user_id: m.userId,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const mentors = await prisma.mentor.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(mentors.map((m) => formatMentor(m as unknown as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const mentor = await prisma.mentor.create({
    data: {
      userId: user.id,
      name: body.name,
      role: body.role || null,
      emoji: body.emoji || "🧭",
      whatTheyTeachMe: body.what_they_teach_me || "",
      howTheyHelpMe: body.how_they_help_me || "",
      keyLessons: JSON.stringify(body.key_lessons || []),
      contactFrequency: body.contact_frequency || null,
      gratitudeNote: body.gratitude_note || "",
    },
  });
  return NextResponse.json(formatMentor(mentor as unknown as Record<string, unknown>));
}
