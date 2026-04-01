import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.strategicGoal.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(goals.map((g) => ({
    ...g,
    obstacles: JSON.parse(g.obstacles),
    actions: JSON.parse(g.actions),
    reflections: JSON.parse(g.reflections),
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  })));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const goal = await prisma.strategicGoal.create({
    data: {
      userId: user.id,
      title: body.title,
      category: body.category || "persoonlijk",
      timeframe: body.timeframe || "3 maanden",
      description: body.description || "",
      whyImportant: body.whyImportant || "",
      successLooksLike: body.successLooksLike || "",
      obstacles: JSON.stringify(body.obstacles || []),
      actions: JSON.stringify(body.actions || []),
      confidence: body.confidence ?? 5,
    },
  });

  return NextResponse.json({ ...goal, obstacles: body.obstacles || [], actions: body.actions || [], reflections: [] });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const goal = await prisma.strategicGoal.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.progress !== undefined ? { progress: body.progress } : {}),
      ...(body.confidence !== undefined ? { confidence: body.confidence } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.actions !== undefined ? { actions: JSON.stringify(body.actions) } : {}),
      ...(body.obstacles !== undefined ? { obstacles: JSON.stringify(body.obstacles) } : {}),
      ...(body.reflections !== undefined ? { reflections: JSON.stringify(body.reflections) } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.whyImportant !== undefined ? { whyImportant: body.whyImportant } : {}),
      ...(body.successLooksLike !== undefined ? { successLooksLike: body.successLooksLike } : {}),
    },
  });

  return NextResponse.json({ ...goal, obstacles: JSON.parse(goal.obstacles), actions: JSON.parse(goal.actions), reflections: JSON.parse(goal.reflections) });
}
