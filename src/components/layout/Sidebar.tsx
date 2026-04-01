"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard/reflectie", icon: "🪞", label: "Reflectie" },
  { href: "/dashboard/coach", icon: "🧠", label: "Mentaal" },
  { href: "/dashboard/toolkit/match-script", icon: "📋", label: "Match Script" },
  { href: "/dashboard/toolkit/game-face", icon: "🎯", label: "Game Face" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-52 flex-col border-r border-[#2a3e33] bg-[#152620]">
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="mb-3 px-2.5 text-[9px] font-semibold uppercase tracking-widest text-gray-600">
          Pilot
        </p>

        {NAV_ITEMS.map((item) => {
          const active = item.href === "/dashboard/reflectie"
            ? pathname === "/dashboard/reflectie" || pathname === "/dashboard"
            : pathname.startsWith(item.href);
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
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Jesse CTA */}
      <div className="border-t border-[#2a3e33] p-3">
        <div className="rounded-xl bg-[#A67C52]/10 p-3 text-center">
          <p className="text-[11px] leading-relaxed text-[#c9a67a]">
            Dieper ingaan op je ontwikkeling?
          </p>
          <p className="mt-1 text-xs font-semibold text-[#A67C52]">
            Plan een sessie met Jesse →
          </p>
        </div>
      </div>
    </aside>
  );
}
