/**
 * Scripted Coach Engine — rule-based conversational coaching without API
 * Uses keyword detection, sentiment analysis, and coaching frameworks
 * (SDT, CBT, WROP, Socratic questioning, motivational interviewing)
 */

type Lang = string; // accepts any language, falls back to "en" for non-nl

interface CoachState {
  turn: number;
  topic: string;
  sentiment: "negative" | "neutral" | "positive";
  hasExplored: boolean;
  hasReframed: boolean;
  hasPerspectiveSwitched: boolean;
  hasActionPlan: boolean;
  keywords: string[];
}

// ─── Keyword detection ──────────────────────────────────────────
const NEGATIVE_NL = ["bang", "angst", "stress", "moe", "gefrustreerd", "boos", "verdrietig", "onzeker", "twijfel", "faal", "misluk", "niet goed", "slecht", "moeilijk", "zwaar", "druk", "vastlopen", "stuck", "hopeloos", "pijn", "zorgen", "somber"];
const NEGATIVE_EN = ["afraid", "fear", "stress", "tired", "frustrated", "angry", "sad", "insecure", "doubt", "fail", "bad", "difficult", "hard", "pressure", "stuck", "hopeless", "pain", "worry", "anxious", "overwhelm"];
const POSITIVE_NL = ["goed", "blij", "trots", "tevreden", "sterk", "beter", "gelukt", "positief", "energie", "gemotiveerd", "focus", "rust", "vertrouwen", "gegroeid"];
const POSITIVE_EN = ["good", "happy", "proud", "satisfied", "strong", "better", "succeeded", "positive", "energy", "motivated", "focus", "calm", "trust", "grown"];
const PERFORMANCE_NL = ["wedstrijd", "training", "presteren", "team", "coach", "spel", "winnen", "verliezen", "selectie", "blessure"];
const PERFORMANCE_EN = ["match", "training", "perform", "team", "coach", "game", "win", "lose", "selection", "injury"];
const RELATION_NL = ["relatie", "partner", "vriend", "familie", "ouders", "collega", "conflict", "ruzie", "alleen"];
const RELATION_EN = ["relationship", "partner", "friend", "family", "parents", "colleague", "conflict", "fight", "alone"];

function detectSentiment(text: string, lang: Lang): "negative" | "neutral" | "positive" {
  const lower = text.toLowerCase();
  const negWords = lang === "nl" ? NEGATIVE_NL : NEGATIVE_EN;
  const posWords = lang === "nl" ? POSITIVE_NL : POSITIVE_EN;
  const negCount = negWords.filter(w => lower.includes(w)).length;
  const posCount = posWords.filter(w => lower.includes(w)).length;
  if (negCount > posCount) return "negative";
  if (posCount > negCount) return "positive";
  return "neutral";
}

function detectKeywords(text: string, lang: Lang): string[] {
  const lower = text.toLowerCase();
  const all = lang === "nl"
    ? [...NEGATIVE_NL, ...POSITIVE_NL, ...PERFORMANCE_NL, ...RELATION_NL]
    : [...NEGATIVE_EN, ...POSITIVE_EN, ...PERFORMANCE_EN, ...RELATION_EN];
  return all.filter(w => lower.includes(w));
}

function isShortAnswer(text: string): boolean {
  return text.split(/\s+/).length < 5;
}

// ─── Response generation ────────────────────────────────────────

function getCoachResponse(userText: string, state: CoachState, lang: Lang): { response: string; newState: CoachState } {
  const sentiment = detectSentiment(userText, lang);
  const keywords = detectKeywords(userText, lang);
  const short = isShortAnswer(userText);
  const nl = lang === "nl";

  const newState = { ...state, turn: state.turn + 1, sentiment, keywords: [...state.keywords, ...keywords] };

  // ── Turn 1: Explore the topic ──
  if (state.turn === 0) {
    newState.topic = userText;
    if (sentiment === "negative") {
      return {
        response: nl
          ? `Ik hoor dat dit je bezighoudt. Als je zegt "${userText.slice(0, 40)}..." — wat maakt dat dit nu zo aanwezig is voor jou?`
          : `I hear this is on your mind. When you say "${userText.slice(0, 40)}..." — what makes this so present for you right now?`,
        newState,
      };
    }
    return {
      response: nl
        ? `Interessant dat je dit noemt. Vertel me daar iets meer over — wat speelt er precies?`
        : `Interesting that you bring this up. Tell me a bit more — what's really going on?`,
      newState,
    };
  }

  // ── Short answers: encourage elaboration ──
  if (short && state.turn < 4) {
    const prompts = nl
      ? ["Kun je dat iets verder uitleggen?", "Wat bedoel je daar precies mee?", "Vertel daar eens wat meer over.", "Hoe voelt dat voor je?"]
      : ["Can you elaborate on that?", "What exactly do you mean by that?", "Tell me more about that.", "How does that feel for you?"];
    return { response: prompts[state.turn % prompts.length], newState };
  }

  // ── Turn 2-3: Deeper exploration (WROP: What's the real challenge?) ──
  if (state.turn <= 2 && !state.hasExplored) {
    newState.hasExplored = true;
    if (nl) {
      const responses = [
        `Ik begrijp het. Maar laat me even doorvragen — wat is hieraan voor jou écht de uitdaging? Niet het oppervlakkige, maar wat raakt je het meest?`,
        `Dat klinkt als iets wat je al langer bezighoudt. Als je eerlijk naar jezelf kijkt — wat is de kern van waar je mee worstelt?`,
        `Ik hoor wat je zegt. En als je een stap terug neemt — wat zou je zeggen dat dit eigenlijk écht over gaat?`,
      ];
      return { response: responses[state.turn % responses.length], newState };
    } else {
      return {
        response: `I understand. But let me dig deeper — what is really the challenge here for you? Not the surface level, but what hits you the most?`,
        newState,
      };
    }
  }

  // ── Turn 3-4: CBT reframing ──
  if (state.turn >= 3 && !state.hasReframed) {
    newState.hasReframed = true;
    if (sentiment === "negative") {
      return {
        response: nl
          ? `Ik merk dat je hier best negatief over denkt. En dat snap ik. Maar laat me je iets vragen: is er een andere manier om naar deze situatie te kijken? Soms zitten we vast in één perspectief terwijl er meer mogelijkheden zijn dan we denken.`
          : `I notice you're quite negative about this. And I understand. But let me ask you something: is there another way to look at this situation? Sometimes we get stuck in one perspective while there are more possibilities than we think.`,
        newState,
      };
    }
    return {
      response: nl
        ? `Je hebt al goed nagedacht over dit thema. Wat ik me afvraag: wat zou er gebeuren als je dit probleem niet als een obstakel ziet, maar als informatie? Wat vertelt deze situatie je over wat je belangrijk vindt?`
        : `You've thought about this well. What I wonder: what would happen if you saw this problem not as an obstacle, but as information? What does this situation tell you about what matters to you?`,
      newState,
    };
  }

  // ── Turn 4-5: Perspective switch ──
  if (state.turn >= 4 && !state.hasPerspectiveSwitched) {
    newState.hasPerspectiveSwitched = true;
    return {
      response: nl
        ? `Even een andere invalshoek: stel dat je beste vriend of vriendin precies hetzelfde meemaakt als jij nu. Wat zou je tegen hem of haar zeggen?`
        : `Let me try a different angle: imagine your best friend was going through exactly the same thing as you right now. What would you tell them?`,
      newState,
    };
  }

  // ── Turn 5-6: Action plan (WROP: Plan) ──
  if (state.turn >= 5 && !state.hasActionPlan) {
    newState.hasActionPlan = true;
    return {
      response: nl
        ? `We hebben het nu goed verkend. Laten we concreet worden: als je morgen één klein ding zou veranderen aan hoe je hiermee omgaat — wat zou dat zijn? Niet iets groots, gewoon één stap.`
        : `We've explored this well. Let's get concrete: if you could change one small thing tomorrow about how you deal with this — what would it be? Not something big, just one step.`,
      newState,
    };
  }

  // ── Turn 6+: Wrap up and refer to Jesse ──
  if (state.turn >= 6) {
    if (nl) {
      const recurring = state.keywords.length > 3
        ? `Ik merk trouwens dat thema's als ${[...new Set(state.keywords)].slice(0, 3).join(", ")} terugkomen in wat je vertelt. Dat is waardevol om bewust van te zijn. `
        : "";
      return {
        response: `${recurring}Dit was een goed gesprek. Je hebt duidelijk nagedacht over wat je bezighoudt en je hebt een concrete stap benoemd. Onthoud: bewustzijn is de eerste stap naar verandering. Voor de diepere laag — praat hierover met Jesse. Die kan je helpen om dit verder uit te diepen.`,
        newState,
      };
    }
    return {
      response: `This was a good conversation. You've clearly thought about what's on your mind and you've named a concrete step. Remember: awareness is the first step to change. For the deeper layer — talk to Jesse about this. He can help you explore this further.`,
      newState,
    };
  }

  // ── Fallback: reflective listening ──
  const reflections = nl
    ? [
      `Wat ik hoor is dat ${userText.length > 50 ? userText.slice(0, 50) + "..." : userText} je bezighoudt. Klopt dat? En hoe lang speelt dit al?`,
      `Je beschrijft iets waar veel mensen mee worstelen. Wat heb je tot nu toe geprobeerd om hier anders mee om te gaan?`,
      `Dat is een eerlijk antwoord. Wat denk je dat er nodig is om hier een stap in te zetten?`,
    ]
    : [
      `What I hear is that this is weighing on you. Is that right? And how long has this been going on?`,
      `You're describing something many people struggle with. What have you tried so far to deal with this differently?`,
      `That's an honest answer. What do you think is needed to take a step forward here?`,
    ];

  return { response: reflections[state.turn % reflections.length], newState };
}

export function createInitialState(): CoachState {
  return {
    turn: 0,
    topic: "",
    sentiment: "neutral",
    hasExplored: false,
    hasReframed: false,
    hasPerspectiveSwitched: false,
    hasActionPlan: false,
    keywords: [],
  };
}

export function getScriptedReply(userText: string, state: CoachState, lang: Lang): { response: string; newState: CoachState } {
  return getCoachResponse(userText, state, lang);
}

export function getScriptedGreeting(lang: Lang): string {
  return lang === "nl"
    ? "Hoi! Ik ben je persoonlijke coach. Vertel me — waar wil je het vandaag over hebben? Wat houdt je bezig?"
    : "Hi! I'm your personal coach. Tell me — what do you want to talk about today? What's on your mind?";
}
