import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const models = await prisma.rolmodel.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(models);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const model = await prisma.rolmodel.create({
    data: {
      userId: user.id, naam: body.naam, omschrijving: body.omschrijving || null,
      kwaliteit: body.kwaliteit, leerpunt: body.leerpunt, toepassing: body.toepassing || null,
      domein: body.domein || "ANDERS", relatie: body.relatie || "ANDERS",
    },
  });
  return NextResponse.json(model, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.rolmodel.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
