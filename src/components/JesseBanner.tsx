"use client";
import { useState } from "react";

export default function JesseBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 md:bottom-6"
        style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
        title="Contact met Jesse"
      >
        <span className="text-sm font-bold text-white">J</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
                <span className="text-lg font-bold text-white">J</span>
              </div>
              <h3 className="text-base font-bold text-white">Contact met Jesse</h3>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Deze app helpt je bij het vormgeven van je topprestaties, maar persoonlijk contact blijft essentieel. Neem gerust contact op om te sparren over je ontwikkeling.
            </p>
            <div className="mb-4 space-y-2">
              <div className="rounded-xl bg-[#152620] p-3 text-center text-xs text-gray-500">Contactopties volgen binnenkort</div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}>
              Begrepen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
