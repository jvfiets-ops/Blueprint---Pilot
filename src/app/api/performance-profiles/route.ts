import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseProfile(p: Record<string, unknown>) {
  return {
    ...p,
    best_version_keywords: JSON.parse((p.bestVersionKeywords as string) || "[]"),
    best_version_codewords: JSON.parse((p.bestVersionCodewords as string) || "[]"),
    worst_version_keywords: JSON.parse((p.worstVersionKeywords as string) || "[]"),
    worst_version_codewords: JSON.parse((p.worstVersionCodewords as string) || "[]"),
    // Map Prisma camelCase to client snake_case
    best_version_name: p.bestVersionName,
    best_version_description: p.bestVersionDescription,
    best_version_external_perspective: p.bestVersionExternalPerspective,
    worst_version_name: p.worstVersionName,
    worst_version_description: p.worstVersionDescription,
    worst_version_external_perspective: p.worstVersionExternalPerspective,
    user_id: p.userId,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profiles = await prisma.performanceProfile.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(profiles.map((p) => parseProfile(p as unknown as Record<string, unknown>)));
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const context = body.context;

  const profile = await prisma.performanceProfile.upsert({
    where: { userId_context: { userId: user.id, context } },
    create: {
      userId: user.id,
      context,
      bestVersionName: body.best_version_name || "",
      bestVersionDescription: body.best_version_description || "",
      bestVersionKeywords: JSON.stringify(body.best_version_keywords || []),
      bestVersionCodewords: JSON.stringify(body.best_version_codewords || []),
      bestVersionExternalPerspective: body.best_version_external_perspective || "",
      worstVersionName: body.worst_version_name || "",
      worstVersionDescription: body.worst_version_description || "",
      worstVersionKeywords: JSON.stringify(body.worst_version_keywords || []),
      worstVersionCodewords: JSON.stringify(body.worst_version_codewords || []),
      worstVersionExternalPerspective: body.worst_version_external_perspective || "",
    },
    update: {
      bestVersionName: body.best_version_name || "",
      bestVersionDescription: body.best_version_description || "",
      bestVersionKeywords: JSON.stringify(body.best_version_keywords || []),
      bestVersionCodewords: JSON.stringify(body.best_version_codewords || []),
      bestVersionExternalPerspective: body.best_version_external_perspective || "",
      worstVersionName: body.worst_version_name || "",
      worstVersionDescription: body.worst_version_description || "",
      worstVersionKeywords: JSON.stringify(body.worst_version_keywords || []),
      worstVersionCodewords: JSON.stringify(body.worst_version_codewords || []),
      worstVersionExternalPerspective: body.worst_version_external_perspective || "",
    },
  });

  return NextResponse.json(parseProfile(profile as unknown as Record<string, unknown>));
}
