import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.intention.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { activity, intention, date } = await req.json();
  return NextResponse.json(await prisma.intention.create({
    data: { userId: user.id, activity, intention, date: date || new Date().toISOString().slice(0, 10) },
  }));
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, followUpScore, followUpNote } = await req.json();
  return NextResponse.json(await prisma.intention.update({ where: { id }, data: { followUpScore, followUpNote } }));
}
