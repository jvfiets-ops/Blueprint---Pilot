import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const script = await prisma.matchScript.findUnique({ where: { userId: user.id } });
  if (!script) return NextResponse.json(null);
  return NextResponse.json({ ...script, focusWords: JSON.parse(script.focusWords) });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = {
    context: body.context || "wedstrijd",
    visualization: body.visualization || "",
    focusWords: JSON.stringify(body.focusWords || []),
    breathing: body.breathing || "",
    bodyLanguage: body.bodyLanguage || "",
    actionPlan: body.actionPlan || "",
    mantra: body.mantra || "",
  };
  const script = await prisma.matchScript.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });
  return NextResponse.json({ ...script, focusWords: JSON.parse(script.focusWords) });
}
