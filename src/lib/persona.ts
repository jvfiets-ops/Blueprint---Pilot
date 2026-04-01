/**
 * Persona system — maps user category to context-specific terminology.
 * Each category gets its own vocabulary that makes the app feel tailored.
 */

export type Category = "atleet" | "artiest" | "coach" | "ondernemer" | "expert" | "";
export type Lang = "nl" | "en";

export interface PersonaTerms {
  // Core identity
  category: Category;
  categoryLabel: string;         // "Atleet", "Artiest", etc.

  // Performance context
  performance: string;           // "wedstrijd" / "optreden" / "sessie" / "pitch" / "presentatie"
  performancePlural: string;     // "wedstrijden" / "optredens" / etc.
  training: string;              // "training" / "repetitie" / "coaching sessie" / "voorbereiding" / "research"
  trainingPlural: string;
  opponent: string;              // "tegenstander" / "publiek" / "coachee" / "concurrent" / "peer"
  team: string;                  // "team" / "ensemble" / "groep" / "bedrijf" / "vakgroep"
  coach: string;                 // "coach" / "regisseur" / "mentor" / "adviseur" / "supervisor"
  result: string;                // "resultaat" / "voorstelling" / "ontwikkeling" / "omzet" / "output"

  // Match script context
  matchScriptTitle: string;      // "Wedstrijd Script" / "Optreden Script" / etc.
  prePerfTitle: string;          // "Wedstrijdvoorbereiding" / "Pre-show routine" / etc.

  // Reflection context
  reflectEvent1: string;         // "Training" / "Repetitie" / etc.
  reflectEvent2: string;         // "Wedstrijd" / "Optreden" / etc.
  reflectEvent3: string;         // "Gesprek" (same for all)
  reflectEvent4: string;         // "Vergadering" / "Show" / etc.

  // Motivational
  peakState: string;             // "flow" / "in de zone" / etc.
  dailyGoalPrompt: string;       // "Wat is je doel voor de training vandaag?" etc.
}

const personas: Record<Category, Record<Lang, PersonaTerms>> = {
  atleet: {
    nl: {
      category: "atleet", categoryLabel: "Atleet",
      performance: "wedstrijd", performancePlural: "wedstrijden",
      training: "training", trainingPlural: "trainingen",
      opponent: "tegenstander", team: "team", coach: "coach", result: "resultaat",
      matchScriptTitle: "Wedstrijd Script", prePerfTitle: "Wedstrijdvoorbereiding",
      reflectEvent1: "Training", reflectEvent2: "Wedstrijd", reflectEvent3: "Gesprek", reflectEvent4: "Teambespreking",
      peakState: "in de zone",
      dailyGoalPrompt: "Wat is je doel voor de training vandaag?",
    },
    en: {
      category: "atleet", categoryLabel: "Athlete",
      performance: "match", performancePlural: "matches",
      training: "training", trainingPlural: "trainings",
      opponent: "opponent", team: "team", coach: "coach", result: "result",
      matchScriptTitle: "Match Script", prePerfTitle: "Pre-match preparation",
      reflectEvent1: "Training", reflectEvent2: "Match", reflectEvent3: "Meeting", reflectEvent4: "Team meeting",
      peakState: "in the zone",
      dailyGoalPrompt: "What is your goal for today's training?",
    },
  },
  artiest: {
    nl: {
      category: "artiest", categoryLabel: "Artiest",
      performance: "optreden", performancePlural: "optredens",
      training: "repetitie", trainingPlural: "repetities",
      opponent: "publiek", team: "ensemble", coach: "regisseur", result: "voorstelling",
      matchScriptTitle: "Performance Script", prePerfTitle: "Pre-show routine",
      reflectEvent1: "Repetitie", reflectEvent2: "Optreden", reflectEvent3: "Gesprek", reflectEvent4: "Productieoverleg",
      peakState: "in flow",
      dailyGoalPrompt: "Wat wil je vandaag bereiken in je repetitie?",
    },
    en: {
      category: "artiest", categoryLabel: "Artist",
      performance: "performance", performancePlural: "performances",
      training: "rehearsal", trainingPlural: "rehearsals",
      opponent: "audience", team: "ensemble", coach: "director", result: "show",
      matchScriptTitle: "Performance Script", prePerfTitle: "Pre-show routine",
      reflectEvent1: "Rehearsal", reflectEvent2: "Performance", reflectEvent3: "Meeting", reflectEvent4: "Production meeting",
      peakState: "in flow",
      dailyGoalPrompt: "What do you want to achieve in today's rehearsal?",
    },
  },
  coach: {
    nl: {
      category: "coach", categoryLabel: "Coach",
      performance: "sessie", performancePlural: "sessies",
      training: "voorbereiding", trainingPlural: "voorbereidingen",
      opponent: "coachee", team: "groep", coach: "mentor", result: "ontwikkeling",
      matchScriptTitle: "Sessie Script", prePerfTitle: "Sessie voorbereiding",
      reflectEvent1: "Coaching sessie", reflectEvent2: "Groepssessie", reflectEvent3: "Gesprek", reflectEvent4: "Teamoverleg",
      peakState: "volledig aanwezig",
      dailyGoalPrompt: "Wat wil je vandaag bereiken met je coachees?",
    },
    en: {
      category: "coach", categoryLabel: "Coach",
      performance: "session", performancePlural: "sessions",
      training: "preparation", trainingPlural: "preparations",
      opponent: "coachee", team: "group", coach: "mentor", result: "development",
      matchScriptTitle: "Session Script", prePerfTitle: "Session preparation",
      reflectEvent1: "Coaching session", reflectEvent2: "Group session", reflectEvent3: "Meeting", reflectEvent4: "Team meeting",
      peakState: "fully present",
      dailyGoalPrompt: "What do you want to achieve with your coachees today?",
    },
  },
  ondernemer: {
    nl: {
      category: "ondernemer", categoryLabel: "Ondernemer",
      performance: "pitch", performancePlural: "pitches",
      training: "voorbereiding", trainingPlural: "voorbereidingen",
      opponent: "concurrent", team: "bedrijf", coach: "adviseur", result: "omzet",
      matchScriptTitle: "Pitch Script", prePerfTitle: "Pre-pitch voorbereiding",
      reflectEvent1: "Werkdag", reflectEvent2: "Pitch / Presentatie", reflectEvent3: "Klantgesprek", reflectEvent4: "Boardmeeting",
      peakState: "scherp en gefocust",
      dailyGoalPrompt: "Wat is de belangrijkste stap die je vandaag zet voor je bedrijf?",
    },
    en: {
      category: "ondernemer", categoryLabel: "Entrepreneur",
      performance: "pitch", performancePlural: "pitches",
      training: "preparation", trainingPlural: "preparations",
      opponent: "competitor", team: "company", coach: "advisor", result: "revenue",
      matchScriptTitle: "Pitch Script", prePerfTitle: "Pre-pitch preparation",
      reflectEvent1: "Work day", reflectEvent2: "Pitch / Presentation", reflectEvent3: "Client meeting", reflectEvent4: "Board meeting",
      peakState: "sharp and focused",
      dailyGoalPrompt: "What's the most important step for your business today?",
    },
  },
  expert: {
    nl: {
      category: "expert", categoryLabel: "Expert",
      performance: "presentatie", performancePlural: "presentaties",
      training: "research", trainingPlural: "onderzoeken",
      opponent: "peer", team: "vakgroep", coach: "supervisor", result: "publicatie",
      matchScriptTitle: "Presentatie Script", prePerfTitle: "Presentatie voorbereiding",
      reflectEvent1: "Onderzoeksdag", reflectEvent2: "Presentatie / Lezing", reflectEvent3: "Overleg", reflectEvent4: "Conferentie",
      peakState: "diep geconcentreerd",
      dailyGoalPrompt: "Wat wil je vandaag leren of afronden in je werk?",
    },
    en: {
      category: "expert", categoryLabel: "Expert",
      performance: "presentation", performancePlural: "presentations",
      training: "research", trainingPlural: "research sessions",
      opponent: "peer", team: "department", coach: "supervisor", result: "publication",
      matchScriptTitle: "Presentation Script", prePerfTitle: "Presentation preparation",
      reflectEvent1: "Research day", reflectEvent2: "Presentation / Lecture", reflectEvent3: "Meeting", reflectEvent4: "Conference",
      peakState: "deeply focused",
      dailyGoalPrompt: "What do you want to learn or complete in your work today?",
    },
  },
  "": {
    nl: {
      category: "", categoryLabel: "High Performer",
      performance: "prestatie", performancePlural: "prestaties",
      training: "voorbereiding", trainingPlural: "voorbereidingen",
      opponent: "uitdaging", team: "team", coach: "coach", result: "resultaat",
      matchScriptTitle: "Prestatie Script", prePerfTitle: "Voorbereiding",
      reflectEvent1: "Training", reflectEvent2: "Wedstrijd / Prestatie", reflectEvent3: "Gesprek", reflectEvent4: "Vergadering",
      peakState: "in flow",
      dailyGoalPrompt: "Wat is je doel voor vandaag?",
    },
    en: {
      category: "", categoryLabel: "High Performer",
      performance: "performance", performancePlural: "performances",
      training: "preparation", trainingPlural: "preparations",
      opponent: "challenge", team: "team", coach: "coach", result: "result",
      matchScriptTitle: "Performance Script", prePerfTitle: "Preparation",
      reflectEvent1: "Training", reflectEvent2: "Performance", reflectEvent3: "Meeting", reflectEvent4: "Meeting",
      peakState: "in flow",
      dailyGoalPrompt: "What is your goal for today?",
    },
  },
};

export function getPersona(category: Category, lang: Lang): PersonaTerms {
  const langKey = lang === "nl" || lang === "en" ? lang : "nl";
  return personas[category]?.[langKey] || personas[""][langKey];
}

export const CATEGORIES: { key: Category; label: string; icon: string; desc: string }[] = [
  { key: "atleet", label: "Atleet", icon: "⚽", desc: "Sporter op hoog niveau — training, wedstrijden, teamdynamiek" },
  { key: "artiest", label: "Artiest", icon: "🎭", desc: "Muzikant, acteur, danser — repetitie, optredens, creativiteit" },
  { key: "coach", label: "Coach", icon: "🧑‍🏫", desc: "Begeleider van anderen — sessies, ontwikkeling, leiderschap" },
  { key: "ondernemer", label: "Ondernemer", icon: "🚀", desc: "Eigen bedrijf — pitches, strategie, groei" },
  { key: "expert", label: "Expert", icon: "🎓", desc: "Specialist in je vakgebied — presentaties, onderzoek, impact" },
];
