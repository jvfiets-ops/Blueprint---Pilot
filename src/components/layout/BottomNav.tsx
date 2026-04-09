"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

const TABS = [
  { href: "/dashboard", icon: "🪞", labelKey: "navReflectie" as const, exact: true },
  { href: "/dashboard/coach", icon: "🧠", labelKey: "navCoachShort" as const },
  { href: "/dashboard/toolkit", icon: "🛠️", labelKey: "navToolkit" as const },
  { href: "/dashboard/routines", icon: "🔄", labelKey: "navRoutinesShort" as const },
  { href: "/dashboard/blauwdruk", icon: "🗺️", labelKey: "navBlauwdrukShort" as const },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [lang] = useLang();
  const t = getT(lang);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a3e33] bg-[#152620] md:hidden safe-area-bottom">
      <div className="flex">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href || pathname === "/dashboard/reflectie"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-center transition-colors ${active ? "text-[#c9a67a]" : "text-gray-500"}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[8px] font-medium">{t[tab.labelKey] ?? tab.labelKey}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
