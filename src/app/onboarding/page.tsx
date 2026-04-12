"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Er ging iets mis.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Verbinding mislukt. Probeer opnieuw.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-3xl font-black italic" style={{ color: "#c9a67a" }}>
            Blueprint
          </h1>
          <p className="text-sm text-[#7a9e7e]">Blauwdruk voor High Performance</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
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
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="w-full rounded-lg py-3 text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
          >
            {loading ? "Even geduld..." : "Aan de slag →"}
          </button>
        </form>
      </div>
    </div>
  );
}
