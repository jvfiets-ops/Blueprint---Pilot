import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const goals = await prisma.dailyGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { text, category } = await req.json();
    const today = new Date().toISOString().slice(0, 10);

    const goal = await prisma.dailyGoal.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      create: { userId: user.id, date: today, text, category: category || "algemeen" },
      update: { text, category: category || "algemeen" },
    });
    return NextResponse.json(goal);
  } catch (err) {
    console.error("Daily goal error:", err);
    return NextResponse.json({ error: "Kon doel niet opslaan" }, { status: 500 });
  }
}
