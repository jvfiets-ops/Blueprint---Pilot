import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const domains = await prisma.blueprintDomain.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(domains);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, nameKey, positive, negative, improve, sortOrder } = await req.json();
  const domain = await prisma.blueprintDomain.create({
    data: { userId: user.id, name, nameKey, positive, negative, improve, sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(domain, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, positive, negative, improve } = await req.json();
  const domain = await prisma.blueprintDomain.update({
    where: { id },
    data: { positive, negative, improve },
  });
  return NextResponse.json(domain);
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.blueprintDomain.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
