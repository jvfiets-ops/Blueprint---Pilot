"use client";
import { signOut } from "next-auth/react";

export default function WachtenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
          <span className="text-2xl">⏳</span>
        </div>

        <h1 className="mb-2 text-xl font-black text-white">Account aangevraagd</h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          Je account is aangemaakt en wacht op goedkeuring door de beheerder.
          Je ontvangt toegang zodra je bent goedgekeurd.
        </p>

        <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <p className="text-xs text-gray-500">
            Heb je vragen? Neem contact op met Jesse.
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-white"
        >
          ← Uitloggen
        </button>
      </div>
    </div>
  );
}
