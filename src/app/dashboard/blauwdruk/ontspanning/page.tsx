"use client";
import { useLang } from "@/hooks/useLang";
import ThemaPagina from "@/components/blauwdruk/ThemaPagina";

export default function OntspanningPage() {
  const [lang] = useLang();
  const nl = lang === "nl";
  return (
    <ThemaPagina
      thema="ONTSPANNING"
      icon="🌿"
      title={nl ? "Ontspanning" : "Relaxation"}
      intro={nl
        ? "Herstel is een prestatie op zich. Echte ontspanning — waarbij je hoofd en lichaam daadwerkelijk tot rust komen — is schaars en waardevol. Hier leg je vast wat voor jou écht werkt, zodat je het bewust kunt inzetten."
        : "Recovery is an achievement in itself. Real relaxation — where your mind and body actually come to rest — is scarce and valuable. Here you record what truly works for you, so you can use it consciously."}
      color="#4DB6AC"
      categories={nl
        ? [{ id: "ACTIVITEIT", label: "Activiteit" }, { id: "OMGEVING", label: "Plek" }, { id: "OBJECT", label: "Ritueel" }, { id: "PERSOON", label: "Persoon" }, { id: "ANDERS", label: "Anders" }]
        : [{ id: "ACTIVITEIT", label: "Activity" }, { id: "OMGEVING", label: "Place" }, { id: "OBJECT", label: "Ritual" }, { id: "PERSOON", label: "Person" }, { id: "ANDERS", label: "Other" }]}
      prompts={nl
        ? ["Een activiteit waarbij je hoofd op nul gaat", "Een plek waar je altijd tot rust komt", "Een ritueel dat je helpt loslaten", "Iemand bij wie je je ontspannen voelt"]
        : ["An activity that clears your mind", "A place where you always find peace", "A ritual that helps you let go", "Someone you feel relaxed with"]}
      lang={lang}
    />
  );
}
