"use client";
import { useLang } from "@/hooks/useLang";
import ThemaPagina from "@/components/blauwdruk/ThemaPagina";

export default function VertrouwenPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  return (
    <ThemaPagina
      thema="VERTROUWEN"
      icon="🛡️"
      title={nl ? "Vertrouwen" : "Confidence"}
      intro={nl
        ? "Vertrouwen is geen persoonlijkheidskenmerk — het is iets wat je opbouwt uit bewijs. Hier leg je vast waar jouw vertrouwen vandaan komt: momenten waarop je liet zien dat je het kan, mensen die dat in jou zien, overtuigingen die je dragen."
        : "Confidence is not a personality trait — it's something you build from evidence. Here you record where your confidence comes from: moments you proved yourself, people who believe in you, convictions that carry you."}
      color="#D4A76A"
      categories={nl
        ? [{ id: "HERINNERING", label: "Herinnering" }, { id: "PERSOON", label: "Persoon" }, { id: "OVERTUIGING", label: "Overtuiging" }, { id: "ACTIVITEIT", label: "Prestatiebewijs" }, { id: "ANDERS", label: "Anders" }]
        : [{ id: "HERINNERING", label: "Memory" }, { id: "PERSOON", label: "Person" }, { id: "OVERTUIGING", label: "Belief" }, { id: "ACTIVITEIT", label: "Achievement" }, { id: "ANDERS", label: "Other" }]}
      prompts={nl
        ? ["Een prestatie waarop je trots bent", "Iemand die altijd in jou gelooft", "Een moment waarop je twijfelde en het toch lukte", "Een kernovertuiging over jezelf"]
        : ["An achievement you're proud of", "Someone who always believes in you", "A moment you doubted but succeeded", "A core belief about yourself"]}
      lang={lang}
    />
  );
}
