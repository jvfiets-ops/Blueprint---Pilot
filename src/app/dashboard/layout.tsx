import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Banner from "@/components/layout/Banner";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import JesseBanner from "@/components/JesseBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Check approval status
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { approved: true, gdprConsent: true, category: true },
    });
    if (dbUser && !dbUser.approved) {
      redirect("/wachten");
    }
    if (dbUser && !dbUser.gdprConsent) {
      redirect("/consent");
    }
    if (dbUser && !dbUser.category) {
      redirect("/onboarding");
    }
  } catch {
    // columns may not exist yet — skip check
  }

  // Track login activity
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await prisma.userActivity.findFirst({
      where: { userId: user.id, type: "login", createdAt: { gte: new Date(today) } },
    });
    if (!existing) {
      await prisma.userActivity.create({
        data: { userId: user.id, type: "login" },
      });
    }
  } catch {
    // UserActivity table may not exist yet
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0f1a14]">
      <Banner userName={user.name} userEmail={user.email} userRole={user.role} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
      <JesseBanner />
    </div>
  );
}
