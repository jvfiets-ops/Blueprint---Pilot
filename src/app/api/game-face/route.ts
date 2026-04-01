import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const faces = await prisma.gameFace.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(faces.map(f => ({ ...f, codewords: JSON.parse(f.codewords) })));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const face = await prisma.gameFace.create({
    data: { userId: user.id, name: body.name || "Wedstrijd", codewords: JSON.stringify(body.codewords || []), color: body.color || "#A67C52" },
  });
  return NextResponse.json({ ...face, codewords: JSON.parse(face.codewords) });
}
