import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const persons = await prisma.environmentPerson.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    persons.map((p) => ({
      ...p,
      gives: JSON.parse(p.gives),
      costs: JSON.parse(p.costs),
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, role, emoji } = await req.json();
  const person = await prisma.environmentPerson.create({
    data: { userId: user.id, name, role: role || null, emoji: emoji || "👤", gives: "[]", costs: "[]" },
  });
  return NextResponse.json({ ...person, gives: [], costs: [] });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, gives, costs } = await req.json();
  const person = await prisma.environmentPerson.update({
    where: { id },
    data: {
      ...(gives !== undefined ? { gives: JSON.stringify(gives) } : {}),
      ...(costs !== undefined ? { costs: JSON.stringify(costs) } : {}),
    },
  });
  return NextResponse.json({ ...person, gives: JSON.parse(person.gives), costs: JSON.parse(person.costs) });
}
