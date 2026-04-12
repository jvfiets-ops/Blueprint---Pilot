import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Banner from "@/components/layout/Banner";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/onboarding");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0f1a14]">
      <Banner userName={user.name} userEmail={user.email || ""} userRole={user.role} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="relative z-10 flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
