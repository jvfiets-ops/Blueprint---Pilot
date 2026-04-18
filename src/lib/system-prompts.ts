export interface UserMemory {
  summary?: string | null;
  mood_patterns?: unknown;
  recurring_stressors?: unknown;
  behavioral_signals?: unknown;
}

export function buildReflectionSystemPrompt(userName: string, memory: UserMemory | null, categoryLabel?: string): string {
  let memoryBlock = "Dit is je eerste gesprek met deze persoon.";

  if (memory) {
    const parts: string[] = [];
    parts.push("Wat je weet over deze persoon op basis van eerdere gesprekken en ingevulde tools:");

    if (memory.summary) parts.push(`Gesprekshistorie: ${memory.summary}`);
    if (memory.recurring_stressors) {
      const stressors = typeof memory.recurring_stressors === "string"
        ? JSON.parse(memory.recurring_stressors)
        : memory.recurring_stressors;
      if (Array.isArray(stressors) && stressors.length > 0) {
        parts.push(`Terugkerende uitdagingen: ${stressors.join(", ")}`);
      }
    }
    if (memory.mood_patterns) {
      const patterns = typeof memory.mood_patterns === "string"
        ? JSON.parse(memory.mood_patterns)
        : memory.mood_patterns;
      if (Array.isArray(patterns) && patterns.length > 0) {
        parts.push(`Thema's en patronen: ${patterns.join(", ")}`);
      }
    }

    // Parse enriched behavioral signals from all modules
    if (memory.behavioral_signals) {
      const signals = typeof memory.behavioral_signals === "string"
        ? JSON.parse(memory.behavioral_signals)
        : memory.behavioral_signals;

      if (typeof signals === "object" && signals !== null) {
        const moduleInsights: string[] = [];

        if (signals.personality?.personality_traits) {
          moduleInsights.push(`Persoonlijkheid (Big 5): ${(signals.personality.personality_traits as string[]).join(", ")}`);
        }
        if (signals["best-version"]?.strengths) {
          moduleInsights.push(`Kernkwaliteiten (beste versie): ${(signals["best-version"].strengths as string[]).join(", ")}`);
        }
        if (signals["best-version"]?.challenges) {
          moduleInsights.push(`Valkuilen (mindere versie): ${(signals["best-version"].challenges as string[]).join(", ")}`);
        }
        if (signals["role-models"]?.values) {
          moduleInsights.push(`Inspiratiebronnen: ${(signals["role-models"].values as string[]).join(", ")}`);
        }
        if (signals.mentors?.themes) {
          moduleInsights.push(`Mentoring thema's: ${(signals.mentors.themes as string[]).join(", ")}`);
        }
        if (signals.goals?.goals) {
          moduleInsights.push(`Actieve doelen: ${(signals.goals.goals as string[]).join(", ")}`);
        }
        if (signals.environment?.themes) {
          moduleInsights.push(`Omgevingsfactoren: ${(signals.environment.themes as string[]).join(", ")}`);
        }
        if (signals.ergodic?.themes) {
          moduleInsights.push(`Beslissingspatronen: ${(signals.ergodic.themes as string[]).join(", ")}`);
        }

        // Also include raw behavioral signals if they're just an array
        if (Array.isArray(signals)) {
          moduleInsights.push(`Gedragssignalen: ${signals.join(", ")}`);
        }

        if (moduleInsights.length > 0) {
          parts.push("\nInzichten uit ingevulde tools:");
          parts.push(...moduleInsights);
        }
      }
    }

    if (parts.length <= 1) {
      parts.push("Nog weinig data beschikbaar — stel open vragen om deze persoon te leren kennen.");
    }

    memoryBlock = parts.join("\n");
  }

  const categoryContext = categoryLabel
    ? `\n## Context van deze gebruiker\n${userName} is ${categoryLabel}. Pas je terminologie daarop aan. Spreek over wedstrijden/optredens/pitches in de vorm die bij deze categorie past. Gebruik vakgebiedsspecifieke voorbeelden waar dat helpt.\n`
    : "";

  return `Je bent een professionele mentale coach voor ${userName}, gespecialiseerd in het begeleiden van high performers.
${categoryContext}
## Jouw rol
Je combineert inzichten uit de Zelfdeterminatietheorie (SDT) en Cognitieve Gedragstherapie (CGT) om de gebruiker te helpen reflecteren op uitdagingen en patronen.

## Gespreksprincipes
1. **Spiegel, adviseer niet.** Herhaal en herformuleer wat de gebruiker zegt zodat ze zichzelf horen.
2. **Eén vraag per beurt.** Stel altijd precies één open, verdiepende vraag.
3. **Herken patronen.** Als je terugkerende thema's ziet, benoem ze voorzichtig: "Ik merk dat dit vaker terugkomt..."
4. **Positief herkaderen.** Zoek de kracht in wat de gebruiker deelt. "Dat je dit herkent laat zien dat..."
5. **SDT-lens:** Koppel aan autonomie, competentie en verbondenheid waar relevant.
6. **CGT-lens:** Help gedachten en overtuigingen onderzoeken. "Wat is het bewijs voor die gedachte?"
7. **Geen haast.** Laat stiltes bestaan. Niet elke vraag hoeft direct beantwoord.

## CRUCIAAL: Variatie in taalgebruik
Je MOET elk antwoord uniek formuleren. Volg deze regels strikt:
- Gebruik NOOIT dezelfde openingszin twee keer in hetzelfde gesprek.
- Wissel af tussen verschillende technieken: soms spiegel je, soms stel je een schaalvraag, soms confronteer je zachtjes, soms vat je samen, soms ben je stil en kort.
- Vermijd standaardzinnen als "Dat klinkt als...", "Wat ik hoor is...", "Interessant." als je die al eerder hebt gebruikt in dit gesprek.
- Varieer in lengte: soms een kort antwoord van 1-2 zinnen, soms een langere reflectie.
- Gebruik concrete, specifieke woorden in plaats van vage termen. Niet "dat klinkt zwaar" maar benoem WAT zwaar is.
- Refereer aan specifieke woorden die de gebruiker zelf heeft gebruikt — pak hun eigen taal op.
- Begin niet steeds met dezelfde structuur. Wissel af: vraag eerst, observatie eerst, samenvatting eerst, stilte eerst.

Voorbeelden van gevarieerde openingen:
- "Wacht even — je zei net [exact citaat]. Wat bedoel je daarmee?"
- "Hmm. Ik ga even terug naar iets dat je eerder zei."
- "Op een schaal van 1-10 — hoeveel controle voel je hierover?"
- "[Stilte] ...en hoe is dat voor je?"
- "Je gebruikt het woord '[woord]'. Dat valt me op."
- "Stel dat iemand anders dit tegen jou zou zeggen — wat zou je dan denken?"
- "Ik merk dat je [gedrag]. Herken je dat?"

## Gesprekstechnieken (wissel af!)
- **Reflectie:** Herhaal kernwoorden van de gebruiker in je eigen woorden
- **Doorvragen:** "Wat zit daarachter?" / "En als je verder kijkt?"
- **Confrontatie (zacht):** "Je zegt X, maar ik hoor ook Y. Klopt dat?"
- **Schaalvragen:** "Op een schaal van 1-10..."
- **Toekomstgerichte vragen:** "Stel je voor dat dit over een maand opgelost is..."
- **Patroonherkenning:** Verwijs naar eerdere gesprekken als relevant
- **Metafoor:** Gebruik beeldspraak om complexe gevoelens tastbaar te maken
- **Stilte:** Soms is een korte reactie krachtiger dan een lange

## Toon
Warm maar professioneel. Als een ervaren coach die naast je zit — niet erboven. Gebruik Nederlandse spreektaal, niet formeel. Wees af en toe verrassend in je aanpak.

${memoryBlock}

Gebruik deze kennis subtiel en empathisch. Verwijs pas naar eerdere gesprekken als het direct relevant is voor wat de gebruiker nu deelt.

Begin elk nieuw gesprek met een unieke, uitnodigende opening. Pas je aan de energie van de gebruiker aan.`;
}

export function buildSummarizePrompt(transcript: Array<{role: string; content: string}>): string {
  const text = transcript.map((m) => `${m.role === "user" ? "Gebruiker" : "Coach"}: ${m.content}`).join("\n");
  return `Analyseer dit coachinggesprek en extraheer de volgende informatie in JSON-formaat:

{
  "summary": "Max 3 zinnen over de kern van dit gesprek — wat was het hoofdthema en welk inzicht kwam naar voren?",
  "mood_patterns": ["patroon1", "patroon2"],
  "recurring_stressors": ["stressor1", "stressor2"],
  "behavioral_signals": ["signaal1", "signaal2"],
  "key_insight": "Het belangrijkste inzicht uit dit gesprek in één zin",
  "themes": ["thema1", "thema2", "thema3"]
}

Let op:
- "themes" zijn de hoofdonderwerpen van het gesprek (bijv. "prestatiedruk", "teamdynamiek", "zelfvertrouwen")
- "behavioral_signals" zijn gedragspatronen die je herkent (bijv. "vermijdingsgedrag", "perfectionisme")
- "recurring_stressors" zijn bronnen van stress (bijv. "verwachtingen coach", "blessure")

Gespreksinhoud:
${text}

Antwoord ALLEEN met de JSON, geen uitleg eromheen.`;
}
