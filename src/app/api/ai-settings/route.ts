export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.userAISetting.findUnique({ where: { userId: user.id } });
  if (!settings) return NextResponse.json(null);
  return NextResponse.json({
    provider: settings.provider,
    model_override: settings.modelOverride,
    updated_at: settings.updatedAt,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { provider, api_key, model_override } = await req.json();
  if (!provider || !api_key) {
    return NextResponse.json({ error: "Provider en API-sleutel zijn verplicht" }, { status: 400 });
  }

  const encrypted = encrypt(api_key);

  await prisma.userAISetting.upsert({
    where: { userId: user.id },
    create: { userId: user.id, provider, encryptedApiKey: encrypted, modelOverride: model_override || null },
    update: { provider, encryptedApiKey: encrypted, modelOverride: model_override || null },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.userAISetting.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const { provider, api_key } = await req.json();

  try {
    if (provider === "anthropic") {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: api_key });
      await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5,
        messages: [{ role: "user", content: "Hi" }],
      });
    } else if (provider === "openai") {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: api_key });
      await client.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 5,
        messages: [{ role: "user", content: "Hi" }],
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Verbinding mislukt" }, { status: 400 });
  }
}
