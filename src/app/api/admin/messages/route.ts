import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId, content } = await req.json();
  if (!userId || !content?.trim()) return NextResponse.json({ error: "Missende velden" }, { status: 400 });
  const message = await prisma.message.create({
    data: { userId, content: content.trim(), fromAdmin: true },
  });
  return NextResponse.json(message, { status: 201 });
}
