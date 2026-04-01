"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      // NextAuth passes custom error messages from authorize() via res.error
      if (res.error.includes("Te veel pogingen")) {
        setError(res.error);
      } else {
        setError("Onjuist e-mailadres of wachtwoord.");
      }
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="gradient-text mb-1 text-2xl font-black">Blueprint</h1>
          <p className="text-sm text-gray-500">Blauwdruk voor High Performance</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6">
          <h2 className="mb-5 text-lg font-bold text-white">Inloggen</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
          )}

          <label className="mb-1 block text-xs font-semibold text-gray-400">E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="mb-4 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
            placeholder="jouw@email.nl"
          />

          <label className="mb-1 block text-xs font-semibold text-gray-400">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-5 w-full rounded-lg border border-[#2a3e33] bg-[#152620] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#A67C52]"
            placeholder="••••••"
          />

          <label className="mb-5 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#2a3e33] bg-[#152620] accent-[#A67C52]"
            />
            <span className="text-xs text-gray-400">Onthoud mij</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
          >
            {loading ? "Laden..." : "Inloggen"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Nog geen account?{" "}
            <Link href="/register" className="text-[#c9a67a] hover:underline">
              Registreer
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
