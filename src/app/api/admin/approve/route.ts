import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, approved } = await req.json();
  if (!userId || typeof approved !== "boolean") {
    return NextResponse.json({ error: "userId and approved required" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { approved },
  });

  return NextResponse.json({ ok: true });
}
