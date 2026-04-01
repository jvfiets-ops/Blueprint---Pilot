"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registratie mislukt.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setLoading(false);

    // Admin is auto-approved → sign in directly
    if (data.approved) {
      const signInRes = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });
      if (!signInRes?.error) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    // Regular user → waiting for approval
    router.push("/wachten");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="gradient-text mb-1 text-2xl font-black">Blueprint</h1>
          <p className="text-sm text-gray-500">Blauwdruk voor High Performance</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <h2 className="mb-5 text-lg font-bold text-white">Account aanmaken</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
          )}

          <label className="mb-1 block text-xs font-semibold text-gray-400">Naam</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="mb-4 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
            placeholder="Je volledige naam"
          />

          <label className="mb-1 block text-xs font-semibold text-gray-400">E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
            placeholder="jouw@email.nl"
          />

          <label className="mb-1 block text-xs font-semibold text-gray-400">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mb-5 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
            placeholder="Minimaal 6 tekens"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
          >
            {loading ? "Laden..." : "Registreren"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Al een account?{" "}
            <Link href="/login" className="text-[#c9a67a] hover:underline">
              Inloggen
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
