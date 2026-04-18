"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "atleet", icon: "⚽", labelNl: "Atleet", labelEn: "Athlete", descNl: "Sporter, competitief", descEn: "Athlete, competitive" },
  { id: "artiest", icon: "🎭", labelNl: "Artiest", labelEn: "Artist", descNl: "Muziek, theater, podium", descEn: "Music, theater, stage" },
  { id: "ondernemer", icon: "🚀", labelNl: "Ondernemer", labelEn: "Entrepreneur", descNl: "Zakelijk, leiderschap", descEn: "Business, leadership" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"naam" | "categorie">("naam");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setError("");
    setStep("categorie");
  };

  const submit = async (selectedCategory: string) => {
    if (!firstName.trim() || !lastName.trim() || !selectedCategory) return;
    setError("");
    setLoading(true);
    setCategory(selectedCategory);

    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          category: selectedCategory,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Er ging iets mis.");
        setLoading(false);
        return;
      }

      // Save to localStorage so usePersona + useLang pick it up immediately
      try {
        localStorage.setItem("blauwdruk-category", selectedCategory);
      } catch {}

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Verbinding mislukt. Probeer opnieuw.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-3xl font-black italic" style={{ color: "#c9a67a" }}>
            Blueprint
          </h1>
          <p className="text-sm text-[#7a9e7e]">Blauwdruk voor High Performance</p>
        </div>

        {/* Step 1: Name */}
        {step === "naam" && (
          <form onSubmit={goToCategory} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
            <h2 className="mb-2 text-lg font-bold text-white">Welkom</h2>
            <p className="mb-5 text-xs text-gray-500">
              Vul je naam in om te beginnen. Geen wachtwoord nodig — je wordt automatisch herkend bij je volgende bezoek.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <label className="mb-1 block text-xs font-semibold text-gray-400">Voornaam</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoFocus
              className="mb-4 w-full rounded-lg border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
              placeholder="Je voornaam"
            />

            <label className="mb-1 block text-xs font-semibold text-gray-400">Achternaam</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mb-5 w-full rounded-lg border border-[#2a3e33] bg-[#0f1a14] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
              placeholder="Je achternaam"
            />

            <button
              type="submit"
              disabled={!firstName.trim() || !lastName.trim()}
              className="w-full rounded-lg py-3 text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
            >
              Volgende →
            </button>
          </form>
        )}

        {/* Step 2: Category */}
        {step === "categorie" && (
          <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
            <h2 className="mb-2 text-lg font-bold text-white">Welke categorie past bij jou?</h2>
            <p className="mb-5 text-xs text-gray-500">
              Je categorie helpt ons de app op jou af te stemmen. Dit kun je later altijd aanpassen.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => submit(cat.id)}
                  disabled={loading}
                  className="group flex w-full items-center gap-4 rounded-xl border border-[#2a3e33] bg-[#0f1a14] p-4 text-left transition-all hover:border-[#A67C52] hover:bg-[#1e3428] disabled:opacity-50"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{cat.labelNl}</div>
                    <div className="text-[11px] text-gray-500">{cat.descNl}</div>
                  </div>
                  <span className="text-xl text-gray-600 group-hover:text-[#c9a67a]">→</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { setStep("naam"); setError(""); }}
              disabled={loading}
              className="mt-5 block w-full text-center text-xs text-gray-500 hover:text-gray-300"
            >
              ← Terug
            </button>

            {loading && (
              <div className="mt-4 text-center text-xs text-[#c9a67a]">Even geduld...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
