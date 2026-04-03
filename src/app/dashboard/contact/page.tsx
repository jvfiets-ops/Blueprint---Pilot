"use client";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

export default function ContactPage() {
  const [lang] = useLang();
  const t = getT(lang);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-black text-white">📞 {t.contactTitle}</h1>

      <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#A67C52]/20 text-4xl">
            J
          </div>
        </div>

        <p className="mb-6 text-center text-sm leading-relaxed text-gray-300">
          {t.contactMessage}
        </p>

        <button className="w-full rounded-xl bg-[#A67C52] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#b88d63]">
          {t.contactCTA} →
        </button>

        <div className="mt-6 space-y-2 text-center text-xs text-gray-500">
          <p>{lang === "nl" ? "Contactgegevens worden binnenkort toegevoegd." : "Contact details will be added soon."}</p>
        </div>
      </div>
    </div>
  );
}
