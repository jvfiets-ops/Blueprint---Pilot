import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const userId = (session.user as { id?: string }).id;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
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
