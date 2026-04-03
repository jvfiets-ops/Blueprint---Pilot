"use client";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

const TOOLS = [
  { href: "/dashboard/toolkit/match-script", icon: "📋", titleKey: "toolMatchScript" as const, descKey: "toolMatchScriptDesc" as const, color: "#A67C52" },
  { href: "/dashboard/toolkit/game-face", icon: "🎯", titleKey: "toolGameFace" as const, descKey: "toolGameFaceDesc" as const, color: "#c9a67a" },
  { href: "/dashboard/toolkit/beste-versie", icon: "⭐", titleKey: "toolBesteVersie" as const, descKey: "toolBesteVersieDesc" as const, color: "#7a9e7e" },
  { href: "/dashboard/toolkit/reset", icon: "🔄", titleKey: "toolReset" as const, descKey: "toolResetDesc" as const, color: "#6b8f71" },
];

export default function ToolkitPage() {
  const [lang] = useLang();
  const t = getT(lang);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-black text-white">🛠️ {t.toolkitTitle}</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOLS.map(tool => (
          <Link key={tool.href} href={tool.href}
            className="group rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5 transition-all hover:border-[#A67C52]/40 hover:bg-[#1e3428]">
            <div className="mb-2 text-2xl">{tool.icon}</div>
            <h3 className="mb-1 text-base font-bold text-white">{t[tool.titleKey]}</h3>
            <p className="text-xs leading-relaxed text-gray-400">{t[tool.descKey]}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
