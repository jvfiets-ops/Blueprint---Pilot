"use client";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-2xl font-black text-white">🤝 Contact met Jesse</h1>

      {/* Verantwoording */}
      <div className="mb-6 rounded-2xl border border-[#A67C52]/30 bg-[#A67C52]/5 p-6">
        <p className="mb-3 text-sm leading-relaxed text-gray-300">
          Deze app is een krachtig hulpmiddel bij het vormgeven van jouw topprestaties.
          De tools, reflecties en gesprekken helpen je om inzicht te krijgen in jezelf en
          bewuster te werken aan je ontwikkeling.
        </p>
        <p className="mb-3 text-sm leading-relaxed text-gray-300">
          Maar technologie vervangt nooit echt menselijk contact. De diepste groei
          ontstaat in gesprek — oog in oog, met iemand die je kent en begrijpt.
        </p>
        <p className="text-sm font-semibold leading-relaxed text-[#c9a67a]">
          Daarom is het altijd goed om direct contact met mij te zoeken. Of het nu gaat
          om een vraag, een reflectie die je wilt delen, of een stap die je samen wilt
          zetten — ik ben er voor je.
        </p>
      </div>

      {/* Contact opties — placeholders voor later */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#A67C52]/20">
              <span className="text-xl">📞</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Bellen</p>
              <p className="text-xs text-gray-500">Binnenkort beschikbaar</p>
            </div>
            <div className="rounded-lg bg-[#2a3e33] px-3 py-1.5 text-[10px] text-gray-500">
              Komt binnenkort
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#22c55e]/20">
              <span className="text-xl">💬</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">WhatsApp</p>
              <p className="text-xs text-gray-500">Binnenkort beschikbaar</p>
            </div>
            <div className="rounded-lg bg-[#2a3e33] px-3 py-1.5 text-[10px] text-gray-500">
              Komt binnenkort
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#7a9e7e]/20">
              <span className="text-xl">📅</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Afspraak inplannen</p>
              <p className="text-xs text-gray-500">Binnenkort beschikbaar via Calendly</p>
            </div>
            <div className="rounded-lg bg-[#2a3e33] px-3 py-1.5 text-[10px] text-gray-500">
              Komt binnenkort
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#A67C52]/20">
              <span className="text-xl">✉️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">E-mail</p>
              <p className="text-xs text-gray-500">Binnenkort beschikbaar</p>
            </div>
            <div className="rounded-lg bg-[#2a3e33] px-3 py-1.5 text-[10px] text-gray-500">
              Komt binnenkort
            </div>
          </div>
        </div>
      </div>

      {/* Afsluitende noot */}
      <div className="mt-6 rounded-2xl border border-[#2a3e33] bg-[#152620] p-5 text-center">
        <p className="text-xs leading-relaxed text-gray-500">
          De contactmogelijkheden worden binnenkort geactiveerd.
          Zodra dat het geval is ontvang je hier directe toegang.
        </p>
      </div>
    </div>
  );
}
