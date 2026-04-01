import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time endpoint to set admin role for hardcoded admin emails
// Called automatically on build or first request
const ADMIN_EMAILS = ["jvfiets@gmail.com"];

export async function GET() {
  let updated = 0;
  for (const email of ADMIN_EMAILS) {
    const result = await prisma.user.updateMany({
      where: { email, role: { not: "admin" } },
      data: { role: "admin" },
    });
    updated += result.count;
  }
  return NextResponse.json({ ok: true, updated });
}
