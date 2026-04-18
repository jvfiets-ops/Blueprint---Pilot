// Onboarding API — naam-gebaseerd, geen wachtwoord
// TODO: replace with full auth — email/password registration

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTablesExist } from "@/lib/init-tables";

const ADMIN_NAMES = ["jesse"];
const VALID_CATEGORIES = ["atleet", "artiest", "ondernemer"];

function setCookie(response: NextResponse, userId: string) {
  response.cookies.set("hpb-user-token", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
}

export async function POST(req: NextRequest) {
  try { await ensureTablesExist(); } catch { /* tables may exist */ }

  try {
    const { firstName, lastName, category } = await req.json();
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Voornaam en achternaam zijn verplicht." }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Kies een categorie (Atleet, Artiest of Ondernemer)." }, { status: 400 });
    }

    const trimFirst = firstName.trim();
    const trimLast = lastName.trim();

    // Deduplicatie: check of deze naam al bestaat
    const existing = await prisma.user.findFirst({
      where: { firstName: trimFirst, lastName: trimLast },
    });

    if (existing) {
      // Bestaand account gevonden — log in en update eventueel category
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          lastActiveAt: new Date(),
          // Alleen category updaten als die nog leeg was of expliciet veranderd
          ...(existing.category !== category ? { category } : {}),
        },
      });
      const response = NextResponse.json({ id: existing.id, name: existing.name, category, returning: true });
      setCookie(response, existing.id);
      return response;
    }

    // Nieuw account aanmaken
    const fullName = `${trimFirst} ${trimLast}`;
    const isAdmin = ADMIN_NAMES.includes(trimFirst.toLowerCase());

    const user = await prisma.user.create({
      data: {
        firstName: trimFirst,
        lastName: trimLast,
        name: fullName,
        role: isAdmin ? "admin" : "user",
        approved: true,
        category,
      },
    });

    const response = NextResponse.json({ id: user.id, name: user.name, category }, { status: 201 });
    setCookie(response, user.id);
    return response;
  } catch (err) {
    console.error("Onboard error:", err);
    return NextResponse.json({ error: "Registratie mislukt: " + String(err) }, { status: 500 });
  }
}
