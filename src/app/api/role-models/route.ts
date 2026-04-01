import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatModel(m: Record<string, unknown>) {
  return {
    ...m,
    what_makes_them_inspiring: JSON.parse((m.whatMakesThemInspiring as string) || "[]"),
    qualities_to_adopt: JSON.parse((m.qualitiesToAdopt as string) || "[]"),
    why_inspiring: m.whyInspiring,
    personal_meaning: m.personalMeaning,
    connected_to_best_version: m.connectedToBestVersion,
    user_id: m.userId,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const models = await prisma.roleModel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(models.map((m) => formatModel(m as unknown as Record<string, unknown>)));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const model = await prisma.roleModel.create({
    data: {
      userId: user.id,
      name: body.name,
      domain: body.domain || null,
      emoji: body.emoji || "⭐",
      whyInspiring: body.why_inspiring || "",
      whatMakesThemInspiring: JSON.stringify(body.what_makes_them_inspiring || []),
      personalMeaning: body.personal_meaning || "",
      qualitiesToAdopt: JSON.stringify(body.qualities_to_adopt || []),
      connectedToBestVersion: body.connected_to_best_version || false,
    },
  });
  return NextResponse.json(formatModel(model as unknown as Record<string, unknown>));
}
