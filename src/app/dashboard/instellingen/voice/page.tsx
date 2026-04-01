"use client";
import { useEffect, useState } from "react";

export default function VoicePage() {
  const [wisprDetected, setWisprDetected] = useState<boolean | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    // Detect Wispr Flow (checks common injection patterns)
    const hasWispr = !!(
      (window as unknown as { __wisprFlow?: unknown }).__wisprFlow ||
      document.querySelector("[data-wispr-flow]") ||
      document.querySelector("[data-wispr]") ||
      (window as unknown as { WisprFlow?: unknown }).WisprFlow
    );
    setWisprDetected(hasWispr);
    setSpeechSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  }, []);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-extrabold text-white">🎙 Voice instellingen</h1>
      <p className="mb-6 text-sm text-gray-500">Voor de beste spraakervaring gebruiken we Wispr Flow.</p>

      {/* Wispr Flow status */}
      <div className="mb-5 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Wispr Flow</p>
            <p className="text-xs text-gray-500">Hoge kwaliteit spraaktranscriptie, werkt in alle tekstvelden</p>
          </div>
          {wisprDetected === null ? (
            <span className="text-xs text-gray-600">Controleren...</span>
          ) : wisprDetected ? (
            <span className="rounded-full bg-green-900/30 px-2.5 py-1 text-xs font-semibold text-green-400">✅ Actief</span>
          ) : (
            <span className="rounded-full bg-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-400">❌ Niet gedetecteerd</span>
          )}
        </div>

        {!wisprDetected && (
          <div className="mt-3 border-t border-[#2a3e33] pt-3">
            <p className="mb-3 text-sm text-gray-400">Wispr Flow is niet gedetecteerd. Installeer de extensie voor de beste ervaring:</p>
            <ol className="mb-4 space-y-1.5 text-sm text-gray-500">
              <li>1. Maak een gratis account aan op <a href="https://wisprflow.ai" target="_blank" rel="noopener noreferrer" className="text-[#A67C52] hover:underline">wisprflow.ai</a></li>
              <li>2. Installeer de browser-extensie of desktop-app</li>
              <li>3. Herlaad deze pagina om de status te controleren</li>
            </ol>
            <a href="https://wisprflow.ai" target="_blank" rel="noopener noreferrer"
              className="block w-full rounded-xl bg-[#A67C52] py-2.5 text-center text-sm font-bold text-white">
              Maak Wispr Flow account aan →
            </a>
          </div>
        )}
      </div>

      {/* Web Speech API fallback */}
      <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Web Speech API (fallback)</p>
            <p className="text-xs text-gray-500">Ingebouwde browser-spraakherkenning, taal: nl-NL</p>
          </div>
          {speechSupported ? (
            <span className="rounded-full bg-blue-900/30 px-2.5 py-1 text-xs font-semibold text-blue-400">✅ Beschikbaar</span>
          ) : (
            <span className="rounded-full bg-gray-900/30 px-2.5 py-1 text-xs font-semibold text-gray-500">Niet ondersteund</span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {wisprDetected
            ? "Wispr Flow is actief — Web Speech API wordt niet gebruikt."
            : "Wordt automatisch gebruikt als Wispr Flow niet actief is."}
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-gray-700">
        Wispr Flow werkt in alle tekstvelden van de app — ook in het AI-gesprek.
      </p>
    </div>
  );
}
