"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConsentPage() {
  const router = useRouter();
  const [checks, setChecks] = useState({ data: false, privacy: false, processing: false });
  const [loading, setLoading] = useState(false);
  const allChecked = checks.data && checks.privacy && checks.processing;

  const handleAccept = async () => {
    setLoading(true);
    await fetch("/api/consent", { method: "POST" });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="gradient-text mb-1 text-2xl font-black">Blueprint</h1>
          <p className="text-sm text-gray-500">Blauwdruk voor High Performance</p>
        </div>

        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <h2 className="mb-2 text-lg font-bold text-white">Privacyverklaring & Toestemming</h2>
          <p className="mb-5 text-xs leading-relaxed text-gray-400">
            Voordat je de app kunt gebruiken, vragen we je toestemming voor het verwerken van je gegevens
            conform de Algemene Verordening Gegevensbescherming (AVG/GDPR).
          </p>

          <div className="mb-6 space-y-4">
            <div className="rounded-xl border border-[#2a3e33] bg-[#152620] p-4">
              <h3 className="mb-1 text-sm font-semibold text-[#c9a67a]">Welke gegevens verwerken wij?</h3>
              <p className="text-xs leading-relaxed text-gray-400">
                Naam, e-mailadres, reflectie-antwoorden, gesprekstranscripten met de AI-coach, dagelijkse doelen
                en voortgangsgegevens. Deze data wordt uitsluitend gebruikt om jou persoonlijk te begeleiden.
              </p>
            </div>

            <div className="rounded-xl border border-[#2a3e33] bg-[#152620] p-4">
              <h3 className="mb-1 text-sm font-semibold text-[#c9a67a]">Hoe bewaren wij je gegevens?</h3>
              <p className="text-xs leading-relaxed text-gray-400">
                Je gegevens worden versleuteld opgeslagen in een beveiligde database. Alleen jij en de
                beheerder (Jesse) hebben toegang. Jesse ziet geen gespreksinhoud, alleen gebruikspatronen.
                We delen je gegevens nooit met derden.
              </p>
            </div>

            <div className="rounded-xl border border-[#2a3e33] bg-[#152620] p-4">
              <h3 className="mb-1 text-sm font-semibold text-[#c9a67a]">Je rechten</h3>
              <p className="text-xs leading-relaxed text-gray-400">
                Je kunt op elk moment je gegevens inzien, wijzigen of laten verwijderen. Neem hiervoor
                contact op met de beheerder. Je kunt je toestemming op elk moment intrekken.
              </p>
            </div>
          </div>

          <div className="mb-5 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.data}
                onChange={(e) => setChecks({ ...checks, data: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded accent-[#A67C52]"
              />
              <span className="text-xs text-gray-300">
                Ik ga akkoord met het verzamelen en verwerken van mijn gegevens zoals hierboven beschreven.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.privacy}
                onChange={(e) => setChecks({ ...checks, privacy: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded accent-[#A67C52]"
              />
              <span className="text-xs text-gray-300">
                Ik heb de privacyverklaring gelezen en begrijp hoe mijn gegevens worden gebruikt.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.processing}
                onChange={(e) => setChecks({ ...checks, processing: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded accent-[#A67C52]"
              />
              <span className="text-xs text-gray-300">
                Ik begrijp dat mijn reflecties en gesprekken worden verwerkt door AI om mij persoonlijk te begeleiden.
              </span>
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!allChecked || loading}
            className="w-full rounded-lg py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-30"
            style={{ background: allChecked ? "linear-gradient(135deg, #1C3D2E, #A67C52)" : "#2a3e33" }}
          >
            {loading ? "Bezig..." : "Akkoord & Doorgaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
