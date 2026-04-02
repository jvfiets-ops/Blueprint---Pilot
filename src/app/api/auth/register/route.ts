import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["jvfiets@gmail.com"];

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Alle velden zijn verplicht." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Wachtwoord moet minimaal 6 tekens zijn." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json({ error: "Dit e-mailadres is al in gebruik." }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      role: isAdmin ? "admin" : "user",
      approved: true, // pilot: everyone is auto-approved
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    approved: user.approved,
  }, { status: 201 });
}
