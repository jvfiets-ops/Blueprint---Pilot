"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🪞", labelKey: "navReflectie" as const, exact: true },
  { href: "/dashboard/coach", icon: "🧠", labelKey: "navCoach" as const },
  { href: "/dashboard/toolkit", icon: "🛠️", labelKey: "navToolkit" as const },
  { href: "/dashboard/blauwdruk", icon: "🗺️", labelKey: "navBlauwdruk" as const },
  { href: "/dashboard/contact", icon: "📞", labelKey: "navContact" as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [lang] = useLang();
  const t = getT(lang);

  return (
    <aside className="flex h-full w-52 flex-col border-r border-[#2a3e33] bg-[#152620]">
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="mb-3 px-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-600">
          Het Fundament
        </p>

        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href || pathname === "/dashboard/reflectie"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[#A67C52]/20 text-[#c9a67a]"
                  : "text-gray-400 hover:bg-[#1a2e23] hover:text-gray-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="font-medium">{t[item.labelKey] ?? item.labelKey}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
