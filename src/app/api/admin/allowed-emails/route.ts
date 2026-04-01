import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Alleen admins mogen de whitelist beheren
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}

// GET — alle toegestane emails ophalen
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const emails = await prisma.allowedEmail.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(emails);
}

// POST — email(s) toevoegen aan whitelist
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, emails } = await req.json();

  // Ondersteun zowel enkele email als array
  const toAdd: string[] = emails
    ? (emails as string[]).map((e: string) => e.toLowerCase().trim()).filter(Boolean)
    : email
    ? [email.toLowerCase().trim()]
    : [];

  if (toAdd.length === 0) {
    return NextResponse.json({ error: "Geen emailadres opgegeven." }, { status: 400 });
  }

  const results = [];
  for (const addr of toAdd) {
    try {
      const entry = await prisma.allowedEmail.create({
        data: { email: addr },
      });
      results.push({ email: addr, status: "added", id: entry.id });
    } catch {
      // Duplicate — al op de whitelist
      results.push({ email: addr, status: "already_exists" });
    }
  }

  return NextResponse.json({ results });
}

// DELETE — email verwijderen van whitelist
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Geen emailadres opgegeven." }, { status: 400 });
  }

  await prisma.allowedEmail.deleteMany({
    where: { email: email.toLowerCase().trim() },
  });

  return NextResponse.json({ ok: true });
}
