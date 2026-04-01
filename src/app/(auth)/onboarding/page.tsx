"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Category } from "@/lib/persona";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category>("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: selected }),
    });
    localStorage.setItem("blauwdruk-category", selected);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a14] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="gradient-text mb-2 text-2xl font-black">Welkom bij Blueprint</h1>
          <p className="text-sm text-gray-400">
            Om de app zo relevant mogelijk te maken, willen we weten in welk domein jij je topprestaties levert.
          </p>
        </div>

        <h2 className="mb-4 text-center text-sm font-bold text-white">Wat beschrijft jou het best?</h2>

        <div className="space-y-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelected(cat.key)}
              className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all"
              style={{
                borderColor: selected === cat.key ? "#A67C52" : "#2a3e33",
                background: selected === cat.key ? "#A67C52" + "15" : "#1a2e23",
              }}
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="font-bold text-white">{cat.label}</h3>
                <p className="text-xs text-gray-400">{cat.desc}</p>
              </div>
              {selected === cat.key && (
                <span className="ml-auto text-[#c9a67a]">✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={save}
          disabled={!selected || saving}
          className="mt-6 w-full rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
        >
          {saving ? "Even geduld..." : "Doorgaan →"}
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-3 w-full py-2 text-center text-xs text-gray-600 hover:text-gray-400"
        >
          Overslaan — ik kies later
        </button>
      </div>
    </div>
  );
}
