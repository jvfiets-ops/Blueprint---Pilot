import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: "user" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      gdprConsent: true,
      _count: {
        select: {
          reflections: true,
          chatSessions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSessions = await prisma.chatSession.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: weekAgo } },
    _count: true,
  });
  const recentSessionMap = Object.fromEntries(recentSessions.map((s) => [s.userId, s._count]));

  const enriched = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt.toISOString(),
    gdprConsent: u.gdprConsent,
    totalReflections: u._count.reflections,
    totalChatSessions: u._count.chatSessions,
    recentSessions: recentSessionMap[u.id] || 0,
  }));

  return NextResponse.json({
    totalUsers: users.length,
    activeThisWeek: users.filter((u) => recentSessionMap[u.id]).length,
    users: enriched,
  });
}
