import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const thema = req.nextUrl.searchParams.get("thema");
  const bronnen = await prisma.blauwdrukBron.findMany({
    where: { userId: user.id, ...(thema ? { thema } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bronnen);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { thema, titel, beschrijving, categorie } = await req.json();
  const bron = await prisma.blauwdrukBron.create({
    data: { userId: user.id, thema, titel, beschrijving: beschrijving || null, categorie },
  });
  return NextResponse.json(bron, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.blauwdrukBron.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
