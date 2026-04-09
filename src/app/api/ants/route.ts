import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await prisma.antsLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { antTekst, antType, bewijsVoor, bewijsTegen, squash } = await req.json();
  const log = await prisma.antsLog.create({
    data: { userId: user.id, antTekst, antType: antType || "ONBEKEND", bewijsVoor, bewijsTegen, squash },
  });
  return NextResponse.json(log, { status: 201 });
}
