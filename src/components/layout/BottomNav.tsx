"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/reflectie", icon: "🪞", label: "Reflectie" },
  { href: "/dashboard/coach", icon: "🧠", label: "Mentaal" },
  { href: "/dashboard/toolkit/match-script", icon: "📋", label: "Script" },
  { href: "/dashboard/toolkit/game-face", icon: "🎯", label: "Game Face" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a3e33] bg-[#152620] md:hidden">
      <div className="flex">
        {TABS.map((tab) => {
          const active = tab.href === "/dashboard/reflectie"
            ? pathname === "/dashboard/reflectie" || pathname === "/dashboard"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-center transition-colors ${
                active ? "text-[#c9a67a]" : "text-gray-500"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[9px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
