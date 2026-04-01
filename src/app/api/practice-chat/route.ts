export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/ai/provider";
import { decrypt } from "@/lib/encryption";

function buildPracticeSystemPrompt(
  type: "intern" | "extern",
  scenario: string,
  goal: string,
  traits: string,
  userName: string,
): string {
  if (type === "intern") {
    return `Je speelt de kritische innerlijke stem van ${userName}. Je simuleert een intern gesprek.

## Scenario
${scenario}

## Doel van de gebruiker
${userName} oefent om met deze innerlijke stem om te gaan. Het doel: ${goal}

## Jouw rol als innerlijke stem
- Je BENT de innerlijke criticus — spreek in de eerste persoon ("Je bent niet goed genoeg", "Wat als het misgaat?")
- Eigenschappen van deze stem: ${traits || "twijfelend, kritisch, catastroferend"}
- Wees realistisch maar uitdagend — niet overdreven gemeen
- Reageer op wat de gebruiker zegt door terug te duwen, te twijfelen, worst-case scenario's te benoemen
- Als de gebruiker goed repliceert (herformuleert, grenzen stelt, rationeel reageert), geef dan subtiel toe
- Spreek Nederlands

Na elk antwoord van de gebruiker, geef in een apart blok [FEEDBACK] een korte coaching-tip (1-2 zinnen) over hoe ze reageerden. Bijv:
[FEEDBACK] Goed dat je de gedachte herformuleerde. Probeer ook te benoemen welk bewijs er WEL is voor het tegenovergestelde.`;
  }

  return `Je speelt een gesprekspartner in een oefengesprek met ${userName}.

## Scenario
${scenario}

## Doel van de gebruiker
${userName} oefent dit gesprek. Hun doel: ${goal}

## Jouw rol als gesprekspartner
- Je speelt de rol van de andere persoon in dit gesprek
- Eigenschappen: ${traits || "neutraal, professioneel"}
- Reageer realistisch op wat de gebruiker zegt
- Als de eigenschappen aangeven dat je snel gefrustreerd raakt, laat dat dan ook zien als het gesprek daarop aanstuurt
- Wees geen pushover — maak het een echte oefening
- Spreek Nederlands
- Blijf in je rol, maar overdrijf niet

Na elk antwoord van de gebruiker, geef in een apart blok [FEEDBACK] een korte coaching-tip (1-2 zinnen). Bijv:
[FEEDBACK] Je opening was sterk — je benoemde direct het doel. Let er volgende keer op dat je ook ruimte geeft aan de ander om te reageren.`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, type, scenario, goal, traits } = await req.json();

  const aiSettings = await prisma.userAISetting.findUnique({ where: { userId: user.id } });
  let decryptedKey: string | undefined;
  if (aiSettings?.encryptedApiKey) {
    try { decryptedKey = decrypt(aiSettings.encryptedApiKey); } catch {}
  }

  const systemPrompt = buildPracticeSystemPrompt(type, scenario, goal, traits, user.name);

  try {
    const provider = getProvider(
      aiSettings ? { provider: aiSettings.provider as "anthropic" | "openai", encryptedApiKey: aiSettings.encryptedApiKey, modelOverride: aiSettings.modelOverride } : null,
      decryptedKey
    );
    const stream = provider.chat(messages, systemPrompt);

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Practice chat error:", err);
    return NextResponse.json({ error: "AI niet beschikbaar" }, { status: 500 });
  }
}
