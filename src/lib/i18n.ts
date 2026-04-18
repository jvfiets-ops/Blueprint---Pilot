export type Lang = "nl" | "en" | "de" | "es" | "fr" | "pt";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

// Helper: for languages without translations, fall back to EN then NL
type T2 = { nl: string; en: string };
function t(nl: string, en: string): Record<Lang, string> {
  return { nl, en, de: en, es: en, fr: en, pt: en };
}

const translations = {
  // ─── Banner ────────────────────────────────────────────────
  subtitle: t("Jouw persoonlijke", "Your personal"),
  title: t("Blauwdruk voor High Performance", "Blueprint for High Performance"),

  // ─── Navigation ────────────────────────────────────────────
  navVandaag: t("Vandaag", "Today"),
  navCoach: t("Coach", "Coach"),
  navToolkit: t("Toolkit", "Toolkit"),
  navProfiel: t("Mijn profiel", "My profile"),
  navManager: t("Manager", "Manager"),
  navInstellingen: t("Instellingen", "Settings"),
  navUitloggen: t("Uitloggen", "Log out"),
  navReflectie: t("Reflectie", "Reflection"),
  navCoachShort: t("Coach", "Coach"),
  navBlauwdruk: t("Mijn Blauwdruk", "My Blueprint"),
  navBlauwdrukShort: t("Blauwdruk", "Blueprint"),
  navContact: t("Contact met Jesse", "Contact Jesse"),
  navContactShort: t("Jesse", "Jesse"),
  navRoutines: t("Routines", "Routines"),
  navRoutinesShort: t("Routines", "Routines"),

  // ─── Reflectie v2 ──────────────────────────────────────────
  refDevGoalQ: t("Waar wil je beter in worden?", "What do you want to improve at?"),
  refDevGoalLabel: t("Ontwikkeldoel", "Development goal"),
  refDevGoalHint: t("Dit is je langetermijndoel. Je kunt het altijd wijzigen.", "This is your long-term goal. You can always change it."),
  refIntentionQ: t("Wat wil je uit vandaag halen? Waar ligt je focus?", "What do you want to get out of today? Where is your focus?"),
  refIntentionLabel: t("Dagelijkse intentie", "Daily intention"),
  refReviewQ: t("Is het gelukt? Waarom wel of niet?", "Did you succeed? Why or why not?"),
  refReviewLabel: t("Dagelijkse terugblik", "Daily review"),
  refHistory: t("Eerdere reflecties", "Previous reflections"),
  refNoHistory: t("Nog geen eerdere reflecties.", "No previous reflections yet."),
  refEdit: t("Wijzig", "Edit"),
  refSaved: t("Opgeslagen", "Saved"),
  refSave: t("Opslaan", "Save"),

  // ─── Coach v2 ──────────────────────────────────────────────
  coachTitle: t("Persoonlijke Coach", "Personal Coach"),
  coachWelcome: t("Hoi! Waar wil je vandaag mee geholpen worden?", "Hi! What would you like help with today?"),
  coachSetupTitle: t("Hoe wil je de coach gebruiken?", "How do you want to use the coach?"),
  coachOptA: t("Ik gebruik mijn eigen API-sleutel", "I'll use my own API key"),
  coachOptADesc: t("Volledige AI-gestuurde coaching met Claude", "Full AI-powered coaching with Claude"),
  coachOptB: t("Doorgaan zonder API", "Continue without API"),
  coachOptBDesc: t("Begeleide reflectie via vaste vragen", "Guided reflection through fixed questions"),
  coachApiPlaceholder: t("Plak je Anthropic API-sleutel hier...", "Paste your Anthropic API key here..."),
  coachApiSave: t("Opslaan & starten", "Save & start"),
  coachScriptedQ1: t("Waar wil je vandaag mee geholpen worden?", "What would you like help with today?"),
  coachScriptedQ2: t("Hoe lang speelt dit al?", "How long has this been going on?"),
  coachScriptedQ2Opts: t("Kort (dagen)|Weken|Maanden|Langer", "Short (days)|Weeks|Months|Longer"),
  coachScriptedQ3: t("Wat heb je al geprobeerd?", "What have you already tried?"),
  coachScriptedSummary: t("Samenvatting van je reflectie", "Summary of your reflection"),
  coachScriptedEnd: t("Deel dit met Jesse voor verdere begeleiding.", "Share this with Jesse for further guidance."),
  coachNewChat: t("Nieuw gesprek", "New conversation"),

  // ─── Toolkit v2 ────────────────────────────────────────────
  toolkitTitle: t("Mentale Toolkit", "Mental Toolkit"),
  toolMatchScript: t("Match Script", "Match Script"),
  toolMatchScriptDesc: t("Concrete, actiegerichte cues voor focus tijdens een wedstrijd.", "Concrete, action-oriented cues for focus during a match."),
  toolMatchScriptExplain: t("Een Match Script bestaat uit concrete, actiegerichte cues die je helpen om gefocust en taakgericht te blijven tijdens een wedstrijd.", "A Match Script consists of concrete, action-oriented cues that help you stay focused and task-oriented during a match."),
  toolMSActions: t("Wat zijn jouw 3-5 belangrijkste actiepunten tijdens een wedstrijd?", "What are your 3-5 most important action points during a match?"),
  toolMSRole: t("Wat is je rol in het team en wat vraagt die rol van jou?", "What is your role in the team and what does that role ask of you?"),
  toolMSReminder: t("Wat wil je jezelf herinneren als het moeilijk wordt?", "What do you want to remind yourself when things get tough?"),
  toolMSAddAction: t("+ Actiepunt toevoegen", "+ Add action point"),

  toolGameFace: t("Game Face", "Game Face"),
  toolGameFaceDesc: t("Je optimale mentale staat — intern en extern.", "Your optimal mental state — internal and external."),
  toolGameFaceExplain: t("Je Game Face is jouw optimale mentale staat. Intern: hoe voel je je. Extern: hoe kom je over.", "Your Game Face is your optimal mental state. Internal: how you feel. External: how you come across."),
  toolGFMemory: t("Beschrijf je beste wedstrijd(en) — hoe voelde je je daarin?", "Describe your best match(es) — how did you feel?"),
  toolGFImagination: t("Hoe zou je droomversie van jezelf als speler eruitzien?", "What would your dream version of yourself as a player look like?"),
  toolGFPerception: t("Wie wil je zijn als speler? Wat wil je uitstralen?", "Who do you want to be as a player? What do you want to radiate?"),
  toolGFWords: t("Mijn Game Face in 2-3 woorden:", "My Game Face in 2-3 words:"),
  toolGFMetaphor: t("Mijn referentie of metafoor:", "My reference or metaphor:"),

  toolBesteVersie: t("Mijn Beste Versie", "My Best Version"),
  toolBesteVersieDesc: t("Beschrijf jezelf op je allerbest.", "Describe yourself at your very best."),
  toolBVBest: t("Wat was je beste wedstrijd of prestatiemoment ooit?", "What was your best match or performance moment ever?"),
  toolBVFeeling: t("Welk gevoel riep dat op?", "What feeling did that evoke?"),
  toolBVBehavior: t("Hoe zag je gedrag eruit op dat moment?", "What did your behavior look like at that moment?"),
  toolBVSelf: t("Hoe beschrijf jij jezelf op je allerbest?", "How do you describe yourself at your very best?"),
  toolBVOthers: t("Hoe zien anderen jou op het moment dat jij de beste versie van jezelf bent?", "How do others see you when you are the best version of yourself?"),

  toolReset: t("Resetroutine", "Reset Routine"),
  toolResetDesc: t("Snel terug naar focus na een fout of tegenslag.", "Quickly return to focus after a mistake or setback."),
  toolResetExplain: t("Een resetroutine helpt je om na een fout of tegenvaller snel terug te keren naar focus — gericht op wat je kunt controleren.", "A reset routine helps you quickly return to focus after a mistake — focused on what you can control."),
  toolResetFault: t("Hoe reageer je nu typisch op een fout?", "How do you typically react to a mistake?"),
  toolResetLetGo: t("Wat helpt jou om los te laten?", "What helps you let go?"),
  toolResetSignal: t("Wat is jouw signaal om weer vooruit te kijken?", "What is your signal to look forward again?"),
  toolResetControl: t("Wat kun je altijd controleren, ook als het moeilijk gaat?", "What can you always control, even when things are difficult?"),

  // ─── Blauwdruk ─────────────────────────────────────────────
  blauwdrukTitle: t("Mijn Blauwdruk", "My Blueprint"),
  blauwdrukCenter: t("De beste versie van mezelf", "The best version of myself"),
  blauwdrukIntro: t("Klik op een domein om te ontdekken hoe het voor of tegen je werkt.", "Click a domain to discover how it works for or against you."),
  blauwdrukPositive: t("Wanneer werkt dit domein voor jou? Wat geeft het je rust of energie?", "When does this domain work for you? What gives you peace or energy?"),
  blauwdrukNegative: t("Wanneer werkt dit domein tegen jou? Wat verhoogt je stress?", "When does this domain work against you? What increases your stress?"),
  blauwdrukImprove: t("Wat wil je hierin veranderen of verbeteren?", "What do you want to change or improve in this area?"),
  blauwdrukAdd: t("+ Domein toevoegen", "+ Add domain"),
  blauwdrukCTA: t("De blauwdruk geeft inzicht. Maar inzicht alleen is niet genoeg — ontwikkeling vereist begeleiding. Bespreek dit met Jesse.", "The blueprint provides insight. But insight alone is not enough — development requires guidance. Discuss this with Jesse."),

  // Default domains
  domFysiek: t("Fysiek", "Physical"),
  domMentaal: t("Mentaal", "Mental"),
  domMedia: t("Media & publieke druk", "Media & public pressure"),
  domFinancien: t("Financiën & contracten", "Finances & contracts"),
  domRelaties: t("Relaties & sociale omgeving", "Relationships & social environment"),
  domSlaap: t("Slaap & herstel", "Sleep & recovery"),
  domIdentiteit: t("Identiteit & zelfbeeld", "Identity & self-image"),
  domTijd: t("Tijdsmanagement & rust", "Time management & rest"),
  domFamilie: t("Familie & privéleven", "Family & private life"),
  domGeloof: t("Geloof & waarden", "Faith & values"),
  domLeven: t("Leven buiten de sport", "Life outside sports"),
  domVertrouwd: t("Vertrouwde kring", "Trusted circle"),
  domOntspanning: t("Ontspanning", "Relaxation"),
  domPositieveAfleiding: t("Positieve afleiding", "Positive distraction"),

  // ─── Domain Detail Page ────────────────────────────────────
  domDetailBegeleider: t("Wie is mijn begeleider/coach op dit vlak?", "Who is my coach/guide in this area?"),
  domDetailAandacht: t("Op welke manier besteed ik hier aandacht aan?", "How do I pay attention to this?"),
  domDetailWatBrengt: t("Wat brengt me dat?", "What does that bring me?"),
  domDetailWatGaatGoed: t("Wat gaat goed?", "What is going well?"),
  domDetailWatGaatMinder: t("Wat gaat minder?", "What is not going so well?"),
  domDetailWatAnders: t("Wat wil ik anders?", "What do I want to change?"),
  domDetailReflectie: t("Hoe reflecteer ik hierop?", "How do I reflect on this?"),
  domDetailAutoSave: t("Automatisch opgeslagen", "Auto-saved"),
  domDetailSaving: t("Opslaan...", "Saving..."),

  // ─── Persoonlijkheid — Situationele interpretatie ──────────
  persIntTitle: t("Wat zegt dit over mij in een specifieke situatie?", "What does this say about me in a specific situation?"),
  persIntDesc: t("Beschrijf een concrete situatie — de AI analyseert jouw gedrag, gevoel en geeft tips op basis van jouw profiel.", "Describe a concrete situation — the AI analyses your behaviour, feelings and gives tips based on your profile."),
  persSituationPh: t("Bijv. tijdens een wedstrijd onder druk, bij contractonderhandelingen, op een feestje...", "E.g. during a high-pressure match, in contract negotiations, at a party..."),
  persGenerate: t("Genereer interpretatie →", "Generate interpretation →"),
  persGenerating: t("Bezig...", "Generating..."),
  persPastTitle: t("Eerdere interpretaties", "Previous interpretations"),

  // ─── Contact ───────────────────────────────────────────────
  contactTitle: t("Contact met Jesse", "Contact Jesse"),
  contactMessage: t(
    "Deze app geeft je overzicht, structuur en rust. Maar ontwikkeling vereist begeleiding. Jouw gedachten en gevoelens delen met een coach is de volgende stap. Jesse helpt je uitdiepen wat voor jou belangrijk is — en welke experts je op inhoud verder kunnen helpen.",
    "This app gives you overview, structure and peace. But development requires guidance. Sharing your thoughts and feelings with a coach is the next step. Jesse helps you deepen what matters to you — and which experts can help you further."
  ),
  contactCTA: t("Plan een sessie met Jesse", "Schedule a session with Jesse"),

  // ─── Voice ─────────────────────────────────────────────────
  voiceStart: t("Inspreken", "Speak"),
  voiceStop: t("Stoppen", "Stop"),
  voiceListening: t("Luisteren...", "Listening..."),

  // Old sidebar items (kept for compatibility)
  secStressoren: t("Stressoren", "Stressors"),
  secTools: t("Tools", "Tools"),
  secOverzicht: t("Overzicht", "Overview"),
  navMentaal: t("Mentaal", "Mental"),
  navFysiek: t("Fysiek", "Physical"),
  navFinancieel: t("Financieel", "Financial"),
  navLeefstijl: t("Leefstijl", "Lifestyle"),
  navOmgeving: t("Omgeving", "Environment"),
  navDagelijks: t("Dagelijkse reflectie", "Daily reflection"),
  navBesteVersie: t("Beste versie", "Best version"),
  navRolmodellen: t("Rolmodellen", "Role models"),
  navMentoren: t("Mentoren", "Mentors"),
  navGeschiedenis: t("Geschiedenis", "History"),
  navDashboard: t("Dashboard", "Dashboard"),

  // ─── Dashboard / Vandaag ───────────────────────────────────
  todayGoal: t("Je doel voor vandaag", "Your goal for today"),
  todayGoalSub: t("Je kunt je doel bijwerken of direct aan de slag gaan.", "Update your goal or get started right away."),
  todayGoalPh: t("Waar wil je vandaag aan werken?", "What do you want to work on today?"),
  updateAndGo: t("Bijwerken & Ga verder", "Update & Go"),
  quickActions: t("Snelle acties", "Quick actions"),
  startReflection: t("Start reflectie", "Start reflection"),
  openCoach: t("Open coach", "Open coach"),
  recentGoals: t("Recente doelen", "Recent goals"),

  // ─── Coach page (legacy, kept for compat) ──────────────────
  coachSub: t("AI-begeleiding op basis van SDT & CGT", "AI coaching based on SDT & CGT"),
  coachTabCoaching: t("Coaching", "Coaching"),
  coachTabPractice: t("Oefenen", "Practice"),
  newConversation: t("Nieuw gesprek", "New conversation"),
  typeMessage: t("Typ je bericht...", "Type your message..."),

  // ─── Practice conversations ────────────────────────────────
  practiceTitle: t("Gesprekken oefenen", "Practice conversations"),
  practiceSub: t("Oefen moeilijke gesprekken in een veilige omgeving.", "Practice difficult conversations in a safe environment."),
  practiceType: t("Type gesprek", "Conversation type"),
  practiceInternal: t("Intern (met jezelf)", "Internal (with yourself)"),
  practiceExternal: t("Extern (met iemand anders)", "External (with someone else)"),
  practiceGoal: t("Wat wil je bereiken?", "What do you want to achieve?"),
  practiceGoalPh: t("Beschrijf het doel van het gesprek...", "Describe the goal of the conversation..."),
  practiceTraits: t("Eigenschappen gesprekspartner", "Partner traits"),
  practiceTraitsPh: t("Bijv. ongeduldig, defensief, afgeleid...", "E.g. impatient, defensive, distracted..."),
  practiceStart: t("Start oefengesprek", "Start practice"),

  // ─── Toolkit hub (legacy) ───────────────────────────────────
  toolkitSub: t("Tools voor zelfinzicht, voorbereiding en groei", "Tools for self-insight, preparation and growth"),
  toolkitFilled: t("ingevuld", "filled in"),
  toolkitUpdate: t("bekijk en update regelmatig", "review and update regularly"),
  secPrestatierituelen: t("Prestatierituelen", "Performance rituals"),
  secPrestatierituelen_desc: t("Mentale voorbereiding op belangrijke momenten", "Mental preparation for key moments"),
  secZelfinzicht: t("Zelfinzicht", "Self-insight"),
  secZelfinzicht_desc: t("Leer jezelf kennen en definieer je ideale prestatieprofiel", "Know yourself and define your ideal performance profile"),
  secGroei: t("Groei & Progressie", "Growth & Progression"),
  secGroei_desc: t("Volg je voortgang en herken patronen", "Track your progress and recognize patterns"),
  secEnergie: t("Omgeving & Energie", "Environment & Energy"),
  secEnergie_desc: t("Beheer je omgeving en energiebalans", "Manage your environment and energy balance"),

  // (old tool card keys removed — replaced by v2 keys above)

  // ─── Match Script ──────────────────────────────────────────
  msTitle: t("Match Script", "Match Script"),
  msSub: t("Bouw je persoonlijke mentale voorbereiding stap voor stap op.", "Build your personal mental preparation step by step."),
  msContext: t("Context", "Context"),
  msContextSub: t("Waar bereid je je op voor?", "What are you preparing for?"),
  msVisualization: t("Visualisatie", "Visualization"),
  msVisualizationSub: t("Sluit je ogen. Wat zie je als je op je allerbest presteert?", "Close your eyes. What do you see when you perform at your best?"),
  msVisualizationPh: t("Beschrijf zo levendig mogelijk wat je ziet, voelt en hoort...", "Describe as vividly as possible what you see, feel and hear..."),
  msFocusWords: t("Focuswoorden", "Focus words"),
  msFocusWordsSub: t("Welke 3 woorden beschrijven je flow-staat?", "Which 3 words describe your flow state?"),
  msBreathing: t("Ademhaling", "Breathing"),
  msBreathingSub: t("Welk ademhalingsritme brengt je in focus?", "Which breathing pattern brings you into focus?"),
  msBody: t("Lichaamstaal", "Body language"),
  msBodySub: t("Hoe sta je? Hoe beweeg je?", "How do you stand? How do you move?"),
  msBodyPh: t("Schouders naar achteren, borst open, stevige pas...", "Shoulders back, chest open, firm stride..."),
  msAction: t("Actie & Mantra", "Action & Mantra"),
  msActionSub: t("Je eerste 3 acties + persoonlijke mantra", "Your first 3 actions + personal mantra"),
  msFirstActions: t("Eerste 3 acties", "First 3 actions"),
  msMantra: t("Persoonlijke mantra", "Personal mantra"),
  msMantraPh: t("Eén zin die jou activeert...", "One sentence that activates you..."),
  msUseScript: t("Gebruik dit script", "Use this script"),
  msYourScript: t("Je Match Script", "Your Match Script"),
  msSave: t("Opslaan", "Save"),
  msSaved: t("✓ Opgeslagen", "✓ Saved"),
  msNext: t("Volgende →", "Next →"),
  msClose: t("Sluiten", "Close"),

  // ─── Game Face ─────────────────────────────────────────────
  gfTitle: t("Game Face", "Game Face"),
  gfSub: t("Definieer codewoorden die je mentale staat activeren. Gebruik ze als flashcard vlak voor een belangrijk moment.", "Define codewords that activate your mental state. Use them as a flashcard just before a key moment."),
  gfNew: t("Nieuw Game Face", "New Game Face"),
  gfNamePh: t("Naam (bijv. Wedstrijdmodus)", "Name (e.g. Match mode)"),
  gfCodewords: t("Codewoorden (max 3)", "Codewords (max 3)"),
  gfCodewordPh: t("Codewoord...", "Codeword..."),
  gfColor: t("Kleur", "Color"),
  gfActivate: t("Activeren", "Activate"),
  gfReady: t("Klaar", "Ready"),
  gfEmpty: t("Nog geen game faces. Maak je eerste aan.", "No game faces yet. Create your first."),

  // ─── Energie Audit ─────────────────────────────────────────
  eaTitle: t("Energieaudit", "Energy Audit"),
  eaSub: t("Breng in kaart welke activiteiten je energie geven en welke je energie kosten.", "Map which activities give you energy and which cost you energy."),
  eaAddPh: t("Activiteit toevoegen...", "Add activity..."),
  eaAdd: t("Toevoegen", "Add"),
  eaQ1: t("Ideaal", "Ideal"),
  eaQ1desc: t("Veel energie + Veel tijd", "High energy + Lots of time"),
  eaQ2: t("Meer van doen", "Do more of"),
  eaQ2desc: t("Veel energie + Weinig tijd", "High energy + Little time"),
  eaQ3: t("Minimaliseren", "Minimize"),
  eaQ3desc: t("Weinig energie + Veel tijd", "Low energy + Lots of time"),
  eaQ4: t("Elimineren", "Eliminate"),
  eaQ4desc: t("Weinig energie + Weinig tijd", "Low energy + Little time"),
  eaEmpty: t("Nog geen activiteiten", "No activities yet"),

  // ─── Intenties ─────────────────────────────────────────────
  intTitle: t("Intenties", "Intentions"),
  intSub: t("Stel een bewuste intentie voor elke belangrijke activiteit. Na afloop koppel je terug: hoe ging het?", "Set a conscious intention before every important activity. Afterwards, follow up: how did it go?"),
  intActivityPh: t("Wat ga je doen? (bijv. Training, vergadering...)", "What are you going to do? (e.g. Training, meeting...)"),
  intIntentionPh: t("Wat is je intentie? Waar ga je op letten?", "What is your intention? What will you focus on?"),
  intSave: t("Intentie vastleggen", "Set intention"),
  intFollowUp: t("Hoe ging het?", "How did it go?"),
  intFollowUpPh: t("Korte terugkoppeling...", "Brief follow-up..."),
  intEmpty: t("Nog geen intenties. Stel je eerste in.", "No intentions yet. Set your first."),

  // ─── Week Review ───────────────────────────────────────────
  wrTitle: t("Weekreview", "Week Review"),
  wrSub: t("Kijk terug op je week. Herken patronen en bereid de volgende week voor.", "Look back on your week. Recognize patterns and prepare for the next."),
  wrHighlight: t("Wat was je hoogtepunt deze week?", "What was your highlight this week?"),
  wrChallenge: t("Waar liep je tegenaan?", "What did you struggle with?"),
  wrNextWeek: t("Wat is je intentie voor volgende week?", "What is your intention for next week?"),
  wrPrevious: t("Eerdere weken", "Previous weeks"),
  wrWeekOf: t("Week van", "Week of"),

  // ─── Profiel ───────────────────────────────────────────────
  profTitle: t("Mijn profiel", "My profile"),
  profSub: t("Je persoonlijke dashboard — alles op één plek", "Your personal dashboard — everything in one place"),
  profGeschiedenis: t("Geschiedenis", "History"),
  profPatronen: t("Patronen", "Patterns"),
  profOverzicht: t("Overzicht", "Overview"),

  // ─── Reflectie flow ────────────────────────────────────────
  stepStemming: t("Stemming", "Mood"),
  stepGesprek: t("Gesprek", "Conversation"),
  stepReflectie: t("Reflectie", "Reflection"),
  stepOpslaan: t("Opslaan", "Save"),
  howDoYouFeel: t("Hoe voel je je op dit moment?", "How are you feeling right now?"),
  score: t("Score", "Score"),
  reflectTitle: t("Waar wil je op reflecteren?", "What do you want to reflect on?"),
  reflectIntro: t("Reflectie is een van de krachtigste tools voor groei. Door bewust stil te staan bij wat je hebt meegemaakt, maak je van elke ervaring een leermogelijkheid.", "Reflection is one of the most powerful tools for growth. By consciously pausing to consider your experiences, you turn every moment into a learning opportunity."),
  reflectEventType: t("Type gebeurtenis", "Event type"),
  reflectNextMood: t("Volgende: Stemming →", "Next: Mood →"),
  reflectNextConv: t("Start gesprek →", "Start conversation →"),
  reflectSaveFinish: t("Opslaan & Afronden", "Save & Finish"),
  reflectBack: t("Terug", "Back"),

  // Score labels
  s0: t("Heel slecht", "Very bad"), s1: t("Erg slecht", "Very poor"), s2: t("Slecht", "Bad"),
  s3: t("Matig", "Poor"), s4: t("Niet zo goed", "Not great"), s5: t("Neutraal", "Neutral"),
  s6: t("Redelijk", "Decent"), s7: t("Goed", "Good"), s8: t("Heel goed", "Very good"),
  s9: t("Uitstekend", "Excellent"), s10: t("Fantastisch", "Amazing"),

  // AI opening messages
  aiLow: t("klinkt zwaar. Wat speelt er op dit moment het meest?", "sounds tough. What's weighing on you most right now?"),
  aiMid: t("Waarom geen 3? Wat gaat er vandaag eigenlijk wél goed?", "Why not a 3? What's actually going well today?"),
  aiHigh: t("— dat is solide. Wat maakt vandaag een goede dag voor je?", "— that's solid. What makes today a good day for you?"),

  // Chat
  chatPlaceholder: t("Typ hier je antwoord...", "Type your answer..."),
  chatLimit: t("Demo-limiet bereikt voor vandaag. Koppel je eigen API-sleutel voor onbeperkt gebruik.", "Demo limit reached for today. Connect your own API key for unlimited use."),
  toEventReflection: t("Doorgaan naar gebeurtenisreflectie →", "Continue to event reflection →"),

  // Event reflection
  eventReflection: t("Gebeurtenisreflectie", "Event Reflection"),
  evTraining: t("Training", "Training"),
  evGesprek: t("Gesprek", "Meeting"),
  evWedstrijd: t("Wedstrijd", "Match"),
  evVergadering: t("Vergadering", "Meeting"),
  evAnders: t("Anders...", "Other..."),
  qGoed: t("✅ Wat ging er goed?", "✅ What went well?"),
  qBeter: t("🔄 Wat kon beter?", "🔄 What could be better?"),
  qMeenemen: t("🎯 Wat neem je mee naar morgen?", "🎯 What will you take to tomorrow?"),
  voiceHint: t("Spreek in of typ hier.", "Speak or type here."),
  recording: t("🔴 Opnemen...", "🔴 Recording..."),
  speakBtn: t("🎙 Spreek in", "🎙 Speak"),
  typePlaceholder: t("Typ of spreek in...", "Type or speak..."),
  saving: t("Opslaan...", "Saving..."),
  saveSession: t("Sessie afronden en opslaan →", "Complete and save session →"),

  // Session saved
  sessionSaved: t("Sessie opgeslagen", "Session saved"),
  sessionDone: t("Goed gedaan. Je reflectie is opgeslagen en de AI verwerkt de inzichten.", "Well done. Your reflection is saved and the AI processes the insights."),
  event: t("Gebeurtenis", "Event"),
  takeaway: t("Meenemen", "Takeaway"),
  newReflection: t("Nieuwe reflectie starten", "Start new reflection"),

  // ─── Login / Register ──────────────────────────────────────
  login: t("Inloggen", "Log in"),
  register: t("Registreren", "Register"),
  email: t("E-mailadres", "Email"),
  password: t("Wachtwoord", "Password"),
  name: t("Naam", "Name"),
  loginError: t("Onjuist e-mailadres of wachtwoord.", "Incorrect email or password."),
  noAccount: t("Nog geen account?", "No account yet?"),
  hasAccount: t("Al een account?", "Already have an account?"),
  createAccount: t("Account aanmaken", "Create account"),
  loading: t("Laden...", "Loading..."),
  minChars: t("Minimaal 6 tekens", "Minimum 6 characters"),
  fullName: t("Je volledige naam", "Your full name"),
  rememberMe: t("Onthoud mij", "Remember me"),

  // ─── Welkom ────────────────────────────────────────────────
  welkomTitle: t("Welkom bij Blueprint", "Welcome to Blueprint"),
  welkomSub: t("Jouw Blauwdruk voor High Performance", "Your Blueprint for High Performance"),
  welkomIntro: t(
    "Voor topprestaties heb je het juiste fundament nodig. Deze tool helpt je om bewust te werken aan je mentale kracht, zelfinzicht en groei. Gebruik de tools om je voor te bereiden, te reflecteren en patronen te herkennen.",
    "Top performance requires the right foundation. This tool helps you consciously work on your mental strength, self-insight and growth. Use the tools to prepare, reflect and recognize patterns."
  ),
  welkomJesse: t(
    "Het is ten alle tijden goed om contact op te nemen met Jesse om hierover te sparren.",
    "It is always a good idea to contact Jesse to discuss this."
  ),
  welkomStart: t("Aan de slag →", "Get started →"),

  // ─── Contact Jesse ─────────────────────────────────────────
  jesseTitle: t("Contact met Jesse", "Contact Jesse"),
  jesseSub: t(
    "Deze app is een belangrijk onderdeel van het vormgeven van je topprestaties. Maar echt contact blijft altijd heel belangrijk. Zoek daarom gerust direct contact.",
    "This app is an important part of shaping your peak performance. But real contact always remains very important. Feel free to reach out directly."
  ),
  jesseContact: t("Neem contact op", "Get in touch"),
  jessePlaceholder: t("Contactgegevens worden binnenkort toegevoegd.", "Contact details will be added soon."),

  // ─── Consent ───────────────────────────────────────────────
  consentTitle: t("Privacyverklaring", "Privacy statement"),
  consentAgree: t("Ik ga akkoord", "I agree"),

  // ─── Wachten ───────────────────────────────────────────────
  waitTitle: t("Account in afwachting", "Account pending"),
  waitSub: t("Je account is aangemaakt maar moet nog worden goedgekeurd door een beheerder.", "Your account has been created but still needs to be approved by an administrator."),

  // ─── Mentoren ──────────────────────────────────────────────
  mentorenTitle: t("Mentoren", "Mentors"),
  mentorenDesc: t("De mensen die jou helpen groeien.", "The people who help you grow."),
  mentorenAdd: t("Toevoegen", "Add"),
  mentorenNew: t("Nieuwe mentor", "New mentor"),
  mentorenNamePh: t("Naam van je mentor", "Mentor's name"),
  mentorenTeach: t("Wat leert deze persoon jou?", "What does this person teach you?"),
  mentorenTeachPh: t("Beschrijf wat je leert...", "Describe what you learn..."),
  mentorenHelp: t("Hoe helpt deze persoon jou?", "How does this person help you?"),
  mentorenHelpPh: t("Op welke manier ondersteunt hij/zij jou...", "In what way do they support you..."),
  mentorenLessons: t("Belangrijkste lessen", "Key lessons"),
  mentorenFreq: t("Hoe vaak heb je contact?", "How often are you in contact?"),
  mentorenGratitude: t("Dankbaarheid", "Gratitude"),
  mentorenGratitudePh: t("Waar ben je deze mentor dankbaar voor?", "What are you grateful for?"),
  mentorenSave: t("Opslaan", "Save"),
  mentorenCancel: t("Annuleren", "Cancel"),
  mentorenEmpty: t("Nog geen mentoren. Voeg er een toe!", "No mentors yet. Add one!"),

  // ─── Common ────────────────────────────────────────────────
  back: t("← Terug", "← Back"),
  backToolkit: t("← Toolkit", "← Toolkit"),
  save: t("Opslaan", "Save"),
  saved: t("✓ Opgeslagen", "✓ Saved"),
  cancel: t("Annuleren", "Cancel"),
  add: t("Toevoegen", "Add"),
  delete: t("Verwijderen", "Delete"),
  edit: t("Bewerken", "Edit"),
  close: t("Sluiten", "Close"),
  next: t("Volgende", "Next"),
  previous: t("Vorige", "Previous"),
  search: t("Zoeken", "Search"),
  empty: t("Geen data beschikbaar", "No data available"),
} as const;

type Key = keyof typeof translations;

export function getT(lang: Lang): Record<Key, string> {
  const result = {} as Record<Key, string>;
  for (const key of Object.keys(translations) as Key[]) {
    result[key] = translations[key][lang] ?? translations[key]["en"] ?? translations[key]["nl"];
  }
  return result;
}

export function getScoreLabel(score: number, lang: Lang): string {
  const key = `s${score}` as Key;
  return translations[key]?.[lang] ?? String(score);
}

export function getOpeningMessage(score: number, lang: Lang): string {
  const t = getT(lang);
  if (score <= 4) return `${score} ${t.aiLow}`;
  if (score <= 6) return `${score}. ${t.aiMid}`;
  return `${score} ${t.aiHigh}`;
}
