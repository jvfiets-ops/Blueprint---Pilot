// Onboarding API — naam-gebaseerd, geen wachtwoord
// TODO: replace with full auth — email/password registration

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTablesExist } from "@/lib/init-tables";

const ADMIN_NAMES = ["jesse"]; // firstName match for admin role

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist();
  } catch {
    // Continue — tables might already exist
  }

  try {
    const { firstName, lastName } = await req.json();

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "Voornaam en achternaam zijn verplicht." }, { status: 400 });
    }

    const trimFirst = firstName.trim();
    const trimLast = lastName.trim();
    const fullName = `${trimFirst} ${trimLast}`;
    const isAdmin = ADMIN_NAMES.includes(trimFirst.toLowerCase());

    const user = await prisma.user.create({
      data: {
        firstName: trimFirst,
        lastName: trimLast,
        name: fullName,
        role: isAdmin ? "admin" : "user",
        approved: true,
      },
    });

    // Set cookie with userId as token
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
    }, { status: 201 });

    response.cookies.set("hpb-user-token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    return response;
  } catch (err) {
    console.error("Onboard error:", err);
    return NextResponse.json({ error: "Registratie mislukt: " + String(err) }, { status: 500 });
  }
}
