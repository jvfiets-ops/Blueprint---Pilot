"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelkomPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if user has seen the welcome screen before
    const seen = localStorage.getItem("blauwdruk-welkom-seen");
    if (seen) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleContinue = () => {
    localStorage.setItem("blauwdruk-welkom-seen", "true");
    router.push("/dashboard");
  };

  if (!show) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
            <span className="text-2xl">🏛️</span>
          </div>
          <h1 className="mb-2 text-2xl font-black text-white">
            Jouw Blauwdruk voor<br />
            <span className="text-[#c9a67a]">High Performance</span>
          </h1>
        </div>

        {/* Uitleg */}
        <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <p className="mb-4 text-sm leading-relaxed text-gray-300">
            Voor topprestaties heb je het juiste fundament nodig. Niet alleen fysiek of tactisch — maar ook mentaal, sociaal en in je leefstijl.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-gray-300">
            Deze tool helpt je om stap voor stap inzicht te krijgen in de stressoren die je energie kosten, zodat je voldoende mentale bandbreedte overhoudt om te presteren op het hoogste niveau.
          </p>
          <p className="text-sm leading-relaxed text-gray-300">
            Je kunt reflecteren, patronen herkennen, in gesprek gaan met een AI-coach en werken aan je persoonlijke groei — op jouw tempo, in jouw woorden.
          </p>
        </div>

        {/* Jesse contact banner */}
        <div className="mb-6 rounded-2xl border border-[#A67C52]/30 bg-[#A67C52]/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#A67C52]/20">
              <span className="text-lg">🤝</span>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-[#c9a67a]">Persoonlijke begeleiding</p>
              <p className="text-xs leading-relaxed text-gray-400">
                Het is ten alle tijden goed om contact op te nemen met Jesse om te sparren over jouw ontwikkeling. Deze tool ondersteunt, maar persoonlijk contact blijft waardevol.
              </p>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="mb-6 grid grid-cols-2 gap-2">
          {[
            { icon: "🧠", label: "Mentale coaching", desc: "AI-gesprekken" },
            { icon: "🪞", label: "Reflectie", desc: "Dagelijkse check-in" },
            { icon: "🧬", label: "Persoonlijkheid", desc: "Big 5 profiel" },
            { icon: "🏠", label: "Omgeving", desc: "Energiebalans" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border border-[#2a3e33] bg-[#152620] p-3 text-center">
              <span className="text-lg">{f.icon}</span>
              <p className="mt-1 text-xs font-semibold text-white">{f.label}</p>
              <p className="text-[10px] text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
        >
          Aan de slag →
        </button>
      </div>
    </div>
  );
}
