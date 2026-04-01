import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dilemmas = await prisma.ergodicDilemma.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(dilemmas.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  })));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const aligned = body.choice24h === body.choice10y;

  const dilemma = await prisma.ergodicDilemma.create({
    data: {
      userId: user.id,
      dilemma: body.dilemma,
      optionA: body.optionA,
      optionB: body.optionB,
      choice24h: body.choice24h,
      reason24h: body.reason24h || "",
      choice10y: body.choice10y,
      reason10y: body.reason10y || "",
      aligned,
      reflection: body.reflection || "",
      chosenOption: body.chosenOption || null,
      category: body.category || "algemeen",
    },
  });

  return NextResponse.json({ ...dilemma, createdAt: dilemma.createdAt.toISOString() });
}
