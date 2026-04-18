"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { usePersona } from "@/hooks/usePersona";
import { LANGS, getT } from "@/lib/i18n";
import { CATEGORIES, type Category } from "@/lib/persona";

interface BannerProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

// Only show the 3 main categories in the banner picker (atleet/artiest/ondernemer)
const MAIN_CATEGORIES = CATEGORIES.filter(c => c.key === "atleet" || c.key === "artiest" || c.key === "ondernemer");

export default function Banner({ userName, userEmail, userRole }: BannerProps) {
  const router = useRouter();
  const [lang, setLang] = useLang();
  const { category, setCategory } = usePersona();
  const [showPicker, setShowPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const t = getT(lang);
  const currentFlag = LANGS.find((l) => l.code === lang)?.flag ?? "🌐";
  const currentCategory = CATEGORIES.find((c) => c.key === category);
  const isAdmin = userRole === "admin";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#2a3e33] bg-[#152620] px-4">
      {/* Left: Logo */}
      <span className="gradient-text text-lg font-black tracking-tight">Blueprint</span>

      {/* Center: Title */}
      <div className="hidden text-center md:block">
        <p className="text-[10px] uppercase tracking-widest text-gray-600">{t.subtitle}</p>
        <h1 className="gradient-text text-sm font-extrabold leading-tight">{t.title}</h1>
      </div>

      {/* Right: Category + Lang + User menu */}
      <div className="flex items-center gap-2.5">
        {/* Category picker */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryPicker((o) => !o)}
            className="flex items-center gap-1 rounded-lg border border-[#2a3e33] px-2 py-1 text-xs text-gray-400 transition-colors hover:border-[#A67C52] hover:text-gray-200"
            title={currentCategory?.label || "Categorie"}
          >
            <span>{currentCategory?.icon || "🧭"}</span>
            <span className="hidden sm:inline">{currentCategory?.label || (lang === "nl" ? "Kies" : "Choose")}</span>
          </button>

          {showCategoryPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCategoryPicker(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-[#2a3e33] bg-[#1a2e23] py-1 shadow-xl">
                {MAIN_CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      setCategory(c.key as Category);
                      setShowCategoryPicker(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                      category === c.key
                        ? "bg-[#A67C52]/20 text-[#c9a67a]"
                        : "text-gray-400 hover:bg-[#152620] hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setShowPicker((o) => !o)}
            className="flex items-center gap-1 rounded-lg border border-[#2a3e33] px-2 py-1 text-xs text-gray-400 transition-colors hover:border-[#A67C52] hover:text-gray-200"
          >
            <span>{currentFlag}</span>
            <span className="hidden sm:inline">{lang.toUpperCase()}</span>
          </button>

          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-[#2a3e33] bg-[#1a2e23] py-1 shadow-xl">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowPicker(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                      lang === l.code
                        ? "bg-[#A67C52]/20 text-[#c9a67a]"
                        : "text-gray-400 hover:bg-[#152620] hover:text-white"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <span className="hidden text-xs text-gray-400 sm:block">{userName}</span>

        {/* Clickable avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-all hover:ring-2 hover:ring-[#A67C52]/50"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
            title={userEmail}
          >
            {initials || "?"}
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#2a3e33] bg-[#1a2e23] shadow-xl">
                {/* User info */}
                <div className="border-b border-[#2a3e33] px-4 py-3">
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="text-[10px] text-gray-500">{userEmail}</p>
                  {isAdmin && (
                    <span className="mt-1 inline-block rounded-full bg-[#A67C52]/20 px-2 py-0.5 text-[9px] font-bold text-[#c9a67a]">
                      Admin
                    </span>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setShowUserMenu(false); router.push("/dashboard"); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#152620]"
                  >
                    <span>🏠</span> Mijn Dashboard
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { setShowUserMenu(false); router.push("/dashboard/admin"); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#c9a67a] transition-colors hover:bg-[#A67C52]/10"
                    >
                      <span>👁️</span> Manager Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => { setShowUserMenu(false); router.push("/dashboard/instellingen/ai-provider"); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#152620]"
                  >
                    <span>⚙️</span> Instellingen
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-[#2a3e33] py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // signOut is handled by the sidebar, but also add here
                      window.location.href = "/api/auth/signout";
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-900/10"
                  >
                    <span>↩️</span> Uitloggen
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
