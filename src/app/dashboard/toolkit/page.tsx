"use client";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

export default function ToolkitPage() {
  const [lang] = useLang();
  const t = getT(lang);
  const nl = lang === "nl";

  const tools = [
    { href: "/dashboard/toolkit/match-script", icon: "📋", title: t.toolMatchScript, desc: t.toolMatchScriptDesc },
    { href: "/dashboard/toolkit/game-face", icon: "🎯", title: t.toolGameFace, desc: t.toolGameFaceDesc },
    { href: "/dashboard/toolkit/beste-versie", icon: "⭐", title: t.toolBesteVersie, desc: t.toolBesteVersieDesc },
    { href: "/dashboard/toolkit/reset", icon: "🔄", title: t.toolReset, desc: t.toolResetDesc },
    { href: "/dashboard/toolkit/doelstelling", icon: "🎯", title: nl ? "Doelstelling" : "Goal Setting", desc: nl ? "Goal mapping: langetermijn → tussendoelen → weekacties" : "Goal mapping: long-term → intermediate → weekly actions" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-black text-white">🛠️ {t.toolkitTitle}</h1>

      {/* ANTs Squasher hero */}
      <Link href="/dashboard/toolkit/ants"
        className="mb-4 block rounded-2xl border border-[#E85D4A]/20 bg-[#E85D4A]/5 p-5 transition-all hover:border-[#E85D4A]/40">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">🐜</span>
          <h2 className="text-lg font-black text-white">ANTs Squasher</h2>
        </div>
        <p className="mb-2 text-xs text-gray-400">{nl ? "Automatic Negative Thoughts herkennen & omdenken" : "Recognize & reframe Automatic Negative Thoughts"}</p>
        <p className="text-[10px] italic text-gray-500">{nl ? "\"ANTs komen altijd. Je kunt ze niet stoppen. Maar je kunt leren ze te squashen.\" — Dan Abrahams" : "\"ANTs always come. You can't stop them. But you can learn to squash them.\" — Dan Abrahams"}</p>
      </Link>

      {/* Mentorschap entry */}
      <Link href="/dashboard/toolkit/mentorschap"
        className="mb-6 block rounded-2xl border border-[#5C6BC0]/20 bg-[#5C6BC0]/5 p-5 transition-all hover:border-[#5C6BC0]/40">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">👥</span>
          <h2 className="text-lg font-black text-white">{nl ? "Mentorschap" : "Mentorship"}</h2>
        </div>
        <p className="text-xs text-gray-400">{nl ? "Leer bewust van mensen die jou inspireren" : "Learn consciously from people who inspire you"}</p>
      </Link>

      {/* Tool grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map(tool => (
          <Link key={tool.href} href={tool.href}
            className="group rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5 transition-all hover:border-[#A67C52]/40 hover:bg-[#1e3428]">
            <div className="mb-2 text-2xl">{tool.icon}</div>
            <h3 className="mb-1 text-base font-bold text-white">{tool.title}</h3>
            <p className="text-xs leading-relaxed text-gray-400">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
