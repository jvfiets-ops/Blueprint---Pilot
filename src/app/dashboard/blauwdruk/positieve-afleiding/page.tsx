"use client";
import { useLang } from "@/hooks/useLang";
import ThemaPagina from "@/components/blauwdruk/ThemaPagina";

export default function PositieveAfleidingPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  return (
    <ThemaPagina
      thema="POSITIEVE_AFLEIDING"
      icon="✨"
      title={nl ? "Positieve afleiding" : "Positive distraction"}
      intro={nl
        ? "Niet alles hoeft te gaan over presteren. Positieve afleiding — dingen die je opheffen zonder dat ze prestatiegerichtheid hebben — is essentieel voor mentale veerkracht. Hier leg je vast wat jou energie geeft buiten de sport."
        : "Not everything has to be about performance. Positive distraction — things that lift you up without being performance-oriented — is essential for mental resilience. Here you record what gives you energy outside of sports."}
      color="#9575CD"
      categories={nl
        ? [{ id: "HOBBY", label: "Hobby" }, { id: "MEDIA", label: "Media" }, { id: "SOCIALE_CONNECTIE", label: "Sociale connectie" }, { id: "ACTIVITEIT", label: "Creativiteit" }, { id: "OMGEVING", label: "Natuur" }, { id: "ANDERS", label: "Anders" }]
        : [{ id: "HOBBY", label: "Hobby" }, { id: "MEDIA", label: "Media" }, { id: "SOCIALE_CONNECTIE", label: "Social connection" }, { id: "ACTIVITEIT", label: "Creativity" }, { id: "OMGEVING", label: "Nature" }, { id: "ANDERS", label: "Other" }]}
      prompts={nl
        ? ["Iets wat je opvrolijkt zonder sport", "Een hobby die je meeneemt", "Muziek, films of boeken die je opladen", "Mensen met wie je gewoon jezelf kunt zijn"]
        : ["Something that cheers you up without sports", "A hobby that absorbs you", "Music, films or books that recharge you", "People you can just be yourself with"]}
      lang={lang}
    />
  );
}
