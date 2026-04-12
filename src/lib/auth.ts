// Auth module — naam-gebaseerd systeem (geen wachtwoord)
// TODO: replace with full auth — email/password + verification (NextAuth.js compatible)

import { cookies } from "next/headers";
import { prisma } from "./prisma";

const TOKEN_NAME = "hpb-user-token";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const user = await prisma.user.findUnique({ where: { id: token } });
    if (!user) return null;

    // Update lastActiveAt (non-blocking)
    prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    return {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      category: user.category,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
