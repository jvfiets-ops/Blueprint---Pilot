import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const routine = await prisma.resetRoutine.findUnique({ where: { userId: user.id } });
  return NextResponse.json(routine);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { faultReaction, letGo, signal, control } = await req.json();
  const routine = await prisma.resetRoutine.upsert({
    where: { userId: user.id },
    create: { userId: user.id, faultReaction, letGo, signal, control },
    update: { faultReaction, letGo, signal, control },
  });
  return NextResponse.json(routine);
}
