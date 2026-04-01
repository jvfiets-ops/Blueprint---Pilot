import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.personalityProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) return NextResponse.json(null);

  return NextResponse.json({
    openness: profile.openness,
    conscientiousness: profile.conscientiousness,
    extraversion: profile.extraversion,
    agreeableness: profile.agreeableness,
    neuroticism: profile.neuroticism,
    answers: JSON.parse(profile.answers),
    created_at: profile.createdAt.toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { openness, conscientiousness, extraversion, agreeableness, neuroticism, answers } = await req.json();

  const profile = await prisma.personalityProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism,
      answers: JSON.stringify(answers || []),
    },
    update: {
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism,
      answers: JSON.stringify(answers || []),
    },
  });

  return NextResponse.json({
    openness: profile.openness,
    conscientiousness: profile.conscientiousness,
    extraversion: profile.extraversion,
    agreeableness: profile.agreeableness,
    neuroticism: profile.neuroticism,
  });
}
