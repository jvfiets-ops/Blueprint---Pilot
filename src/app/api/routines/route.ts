import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const routines = await prisma.routine.findMany({
    where: { userId: user.id },
    include: { logs: { orderBy: { datum: "desc" }, take: 7 } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(routines);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const routine = await prisma.routine.create({
    data: {
      userId: user.id, naam: body.naam, beschrijving: body.beschrijving || null,
      categorie: body.categorie || "ANDERS", frequentie: body.frequentie || "DAGELIJKS",
      tijdstip: body.tijdstip || "FLEXIBEL", isHelpend: body.isHelpend ?? null,
      kleur: body.kleur || "#7F77DD", icoon: body.icoon || "zap",
    },
  });
  return NextResponse.json(routine, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.routine.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
