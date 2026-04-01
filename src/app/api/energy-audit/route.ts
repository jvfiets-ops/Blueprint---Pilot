import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.energyAudit.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activity, quadrant } = await req.json();
  return NextResponse.json(await prisma.energyAudit.create({ data: { userId: user.id, activity, quadrant } }));
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.energyAudit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
