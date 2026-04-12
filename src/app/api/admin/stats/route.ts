import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      lastActiveAt: true,
      totalSessionDuration: true,
      _count: {
        select: {
          reflections: true,
          chatSessions: true,
          dailyGoals: true,
        },
      },
    },
    orderBy: { lastActiveAt: "desc" },
  });

  const today = new Date().toISOString().slice(0, 10);
  const activeToday = users.filter(u => u.lastActiveAt?.toISOString().startsWith(today)).length;
  const totalSessions = users.reduce((acc, u) => acc + u._count.chatSessions, 0);

  const enriched = users.map((u) => ({
    id: u.id,
    name: u.name,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    lastActiveAt: u.lastActiveAt?.toISOString() || null,
    totalSessionDuration: u.totalSessionDuration,
    totalReflections: u._count.reflections,
    totalChatSessions: u._count.chatSessions,
    totalGoals: u._count.dailyGoals,
  }));

  return NextResponse.json({
    totalUsers: users.length,
    activeToday,
    totalSessions,
    users: enriched,
  });
}
