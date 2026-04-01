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

  // ─── Coach page ────────────────────────────────────────────
  coachTitle: t("Mentale Coach", "Mental Coach"),
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

  // ─── Toolkit hub ───────────────────────────────────────────
  toolkitTitle: t("Toolkit", "Toolkit"),
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

  // Tool cards
  toolMatchScript: t("Match Script", "Match Script"),
  toolMatchScriptDesc: t("Stapsgewijze mentale voorbereiding", "Step-by-step mental preparation"),
  toolGameFace: t("Game Face", "Game Face"),
  toolGameFaceDesc: t("Codewoorden die je mentale staat activeren", "Codewords that activate your mental state"),
  toolPersoonlijkheid: t("Persoonlijkheid", "Personality"),
  toolPersoonlijkheidDesc: t("Ontdek je Big 5 profiel", "Discover your Big 5 profile"),
  toolBesteVersie: t("Beste versie", "Best version"),
  toolBesteVersieDesc: t("Definieer je ideale prestatieprofiel", "Define your ideal performance profile"),
  toolRolmodellen: t("Rolmodellen", "Role models"),
  toolRolmodellenDesc: t("Wie inspireert jou?", "Who inspires you?"),
  toolMentoren: t("Mentoren", "Mentors"),
  toolMentorenDesc: t("Wie begeleidt je?", "Who guides you?"),
  toolWeekreview: t("Weekreview", "Week review"),
  toolWeekreviewDesc: t("Wekelijkse terugblik op patronen", "Weekly review of patterns"),
  toolErgodisch: t("Ergodisch denken", "Ergodic thinking"),
  toolErgodischDesc: t("24-uur vs 10-jaar perspectief", "24-hour vs 10-year perspective"),
  toolIntenties: t("Intenties", "Intentions"),
  toolIntentiesDesc: t("Bewuste intenties met terugkoppeling", "Conscious intentions with follow-up"),
  toolOmgeving: t("Omgeving", "Environment"),
  toolOmgevingDesc: t("Wie geeft en wie kost energie?", "Who gives and who costs energy?"),
  toolEnergieAudit: t("Energieaudit", "Energy audit"),
  toolEnergieAuditDesc: t("Welke activiteiten geven of kosten energie?", "Which activities give or cost energy?"),

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
