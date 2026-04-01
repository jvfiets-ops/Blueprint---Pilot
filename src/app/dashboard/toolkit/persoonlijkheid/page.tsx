"use client";
import { useState, useEffect } from "react";

// Big Five IPIP-NEO 25-item short scale (5 per trait)
const QUESTIONS = [
  // Openness (O)
  { id: 1, text: "Ik heb een levendige fantasie.", trait: "O", reversed: false },
  { id: 2, text: "Ik ben geïnteresseerd in abstracte ideeën.", trait: "O", reversed: false },
  { id: 3, text: "Ik zoek graag nieuwe ervaringen op.", trait: "O", reversed: false },
  { id: 4, text: "Ik hou niet van verandering.", trait: "O", reversed: true },
  { id: 5, text: "Ik waardeer kunst en schoonheid.", trait: "O", reversed: false },
  // Conscientiousness (C)
  { id: 6, text: "Ik ben altijd goed voorbereid.", trait: "C", reversed: false },
  { id: 7, text: "Ik let op details.", trait: "C", reversed: false },
  { id: 8, text: "Ik stel taken vaak uit.", trait: "C", reversed: true },
  { id: 9, text: "Ik volg een vast schema.", trait: "C", reversed: false },
  { id: 10, text: "Ik maak mijn taken altijd af.", trait: "C", reversed: false },
  // Extraversion (E)
  { id: 11, text: "Ik ben het middelpunt van een feest.", trait: "E", reversed: false },
  { id: 12, text: "Ik praat graag met veel mensen.", trait: "E", reversed: false },
  { id: 13, text: "Ik voel me op mijn gemak bij vreemden.", trait: "E", reversed: false },
  { id: 14, text: "Ik ben liever op de achtergrond.", trait: "E", reversed: true },
  { id: 15, text: "Ik start graag gesprekken.", trait: "E", reversed: false },
  // Agreeableness (A)
  { id: 16, text: "Ik geef om anderen.", trait: "A", reversed: false },
  { id: 17, text: "Ik help anderen graag.", trait: "A", reversed: false },
  { id: 18, text: "Ik kan soms bot overkomen.", trait: "A", reversed: true },
  { id: 19, text: "Ik ben meevoelend met anderen.", trait: "A", reversed: false },
  { id: 20, text: "Ik werk graag samen.", trait: "A", reversed: false },
  // Neuroticism (N)
  { id: 21, text: "Ik maak me snel zorgen.", trait: "N", reversed: false },
  { id: 22, text: "Ik word snel gestrest.", trait: "N", reversed: false },
  { id: 23, text: "Ik ben meestal ontspannen.", trait: "N", reversed: true },
  { id: 24, text: "Mijn stemming wisselt vaak.", trait: "N", reversed: false },
  { id: 25, text: "Ik voel me zelden onzeker.", trait: "N", reversed: true },
];

const TRAIT_INFO: Record<string, { label: string; icon: string; color: string; highDesc: string; lowDesc: string; qualities: string[]; pitfalls: string[] }> = {
  O: {
    label: "Openheid",
    icon: "🎨",
    color: "#A67C52",
    highDesc: "Je bent creatief, nieuwsgierig en staat open voor nieuwe ideeën en ervaringen.",
    lowDesc: "Je bent praktisch ingesteld en geeft de voorkeur aan bekende routines.",
    qualities: ["Creativiteit", "Aanpassingsvermogen", "Visie", "Innovatie"],
    pitfalls: ["Onrust bij routine", "Te veel hooi op de vork", "Moeite met focus"],
  },
  C: {
    label: "Zorgvuldigheid",
    icon: "📋",
    color: "#6b8f71",
    highDesc: "Je bent georganiseerd, gedisciplineerd en werkt doelgericht.",
    lowDesc: "Je bent flexibel en spontaan, maar kan moeite hebben met structuur.",
    qualities: ["Discipline", "Betrouwbaarheid", "Doorzettingsvermogen", "Organisatie"],
    pitfalls: ["Perfectionisme", "Rigiditeit", "Moeite met improvisatie"],
  },
  E: {
    label: "Extraversie",
    icon: "⚡",
    color: "#c9a67a",
    highDesc: "Je haalt energie uit sociale interactie en bent uitgesproken.",
    lowDesc: "Je laadt op in rust en werkt graag zelfstandig.",
    qualities: ["Leiderschap", "Energie", "Communicatie", "Enthousiasme"],
    pitfalls: ["Overprikkeling", "Dominantie", "Moeite met alleen zijn"],
  },
  A: {
    label: "Meegaandheid",
    icon: "🤝",
    color: "#7a9e7e",
    highDesc: "Je bent empathisch, coöperatief en harmonie is belangrijk voor je.",
    lowDesc: "Je bent direct, competitief en staat stevig in je schoenen.",
    qualities: ["Teamspeler", "Empathie", "Conflictoplossing", "Vertrouwen"],
    pitfalls: ["Moeite met grenzen", "Conflictvermijding", "Te meegaand"],
  },
  N: {
    label: "Emotionele stabiliteit",
    icon: "🧘",
    color: "#8b6f47",
    highDesc: "Je ervaart emoties intensief en bent gevoelig voor stress.",
    lowDesc: "Je bent emotioneel stabiel en kalm onder druk.",
    qualities: ["Gevoeligheid", "Alertheid", "Empathie", "Zelfreflectie"],
    pitfalls: ["Piekeren", "Stressgevoeligheid", "Onzekerheid", "Stemmingswisselingen"],
  },
};

type Step = "intro" | "test" | "results";

export default function PersoonlijkheidPage() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/personality")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.openness !== undefined) {
          setScores({
            O: data.openness,
            C: data.conscientiousness,
            E: data.extraversion,
            A: data.agreeableness,
            N: data.neuroticism,
          });
          setStep("results");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const calculateScores = () => {
    const traitScores: Record<string, number[]> = { O: [], C: [], E: [], A: [], N: [] };
    QUESTIONS.forEach((q) => {
      const val = answers[q.id];
      if (val !== undefined) {
        const score = q.reversed ? 6 - val : val;
        traitScores[q.trait].push(score);
      }
    });
    const result: Record<string, number> = {};
    for (const [trait, values] of Object.entries(traitScores)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      result[trait] = Math.round((avg / 5) * 100);
    }
    return result;
  };

  const handleFinish = async () => {
    const result = calculateScores();
    setScores(result);
    setSaving(true);
    await fetch("/api/personality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openness: result.O,
        conscientiousness: result.C,
        extraversion: result.E,
        agreeableness: result.A,
        neuroticism: result.N,
        answers: Object.entries(answers).map(([id, val]) => ({ id: Number(id), value: val })),
      }),
    }).catch(() => {});
    setSaving(false);
    setStep("results");
  };

  const q = QUESTIONS[currentQ];
  const answered = Object.keys(answers).length;
  const allAnswered = answered === QUESTIONS.length;

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-500">Laden...</div>;
  }

  // INTRO
  if (step === "intro") {
    return (
      <div className="mx-auto max-w-lg">
        <h2 className="mb-2 text-xl font-black text-white">🧬 Persoonlijkheidsprofiel</h2>
        <p className="mb-4 text-sm text-gray-400">Big Five Persoonlijkheidstest</p>

        <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <p className="mb-3 text-sm leading-relaxed text-gray-300">
            De Big Five is het meest wetenschappelijk onderbouwde model voor persoonlijkheid.
            Het meet vijf kerndimensies die samen een compleet beeld geven van hoe jij denkt, voelt en handelt.
          </p>
          <p className="mb-3 text-sm leading-relaxed text-gray-300">
            Na het invullen krijg je inzicht in je kwaliteiten en valkuilen — specifiek gericht op jouw prestaties.
          </p>
          <p className="text-xs text-gray-500">
            De test bestaat uit 25 stellingen en duurt ~5 minuten.
          </p>
        </div>

        <button
          onClick={() => setStep("test")}
          className="w-full rounded-xl py-3 text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
        >
          Start de test →
        </button>
      </div>
    );
  }

  // TEST
  if (step === "test") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Persoonlijkheidstest</h2>
          <span className="text-xs text-gray-500">{answered}/{QUESTIONS.length}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1.5 rounded-full bg-[#2a3e33]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(answered / QUESTIONS.length) * 100}%`, background: "#A67C52" }}
          />
        </div>

        {/* Question */}
        <div className="mb-6 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-5">
          <p className="mb-1 text-[10px] uppercase text-gray-500">Stelling {currentQ + 1} van {QUESTIONS.length}</p>
          <p className="mb-5 text-base font-semibold text-white">{q.text}</p>

          <div className="flex flex-col gap-2">
            {[
              { val: 1, label: "Helemaal niet mee eens" },
              { val: 2, label: "Niet mee eens" },
              { val: 3, label: "Neutraal" },
              { val: 4, label: "Mee eens" },
              { val: 5, label: "Helemaal mee eens" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => {
                  setAnswers({ ...answers, [q.id]: opt.val });
                  if (currentQ < QUESTIONS.length - 1) {
                    setTimeout(() => setCurrentQ(currentQ + 1), 200);
                  }
                }}
                className="rounded-xl border p-3 text-left text-sm transition-all"
                style={{
                  borderColor: answers[q.id] === opt.val ? "#A67C52" : "#2a3e33",
                  background: answers[q.id] === opt.val ? "#A67C52/20" : "#152620",
                  color: answers[q.id] === opt.val ? "#c9a67a" : "#aaa",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-xs text-gray-400 disabled:opacity-30"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentQ(Math.min(QUESTIONS.length - 1, currentQ + 1))}
            disabled={currentQ === QUESTIONS.length - 1}
            className="rounded-xl border border-[#2a3e33] px-4 py-2.5 text-xs text-gray-400 disabled:opacity-30"
          >
            →
          </button>
          {allAnswered && (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #1C3D2E, #A67C52)" }}
            >
              {saving ? "Opslaan..." : "Bekijk resultaten →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULTS
  if (step === "results" && scores) {
    return (
      <div className="mx-auto max-w-lg">
        <h2 className="mb-1 text-xl font-black text-white">🧬 Jouw Persoonlijkheidsprofiel</h2>
        <p className="mb-6 text-xs text-gray-500">Big Five — gebaseerd op wetenschappelijk onderzoek</p>

        {/* Score bars */}
        <div className="mb-6 space-y-3">
          {(["O", "C", "E", "A", "N"] as const).map((trait) => {
            const info = TRAIT_INFO[trait];
            const score = scores[trait];
            return (
              <div key={trait} className="rounded-xl border border-[#2a3e33] bg-[#1a2e23] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{info.icon} {info.label}</span>
                  <span className="text-lg font-black" style={{ color: info.color }}>{score}%</span>
                </div>
                <div className="mb-3 h-2 rounded-full bg-[#2a3e33]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, background: info.color }}
                  />
                </div>
                <p className="mb-2 text-xs leading-relaxed text-gray-300">
                  {score >= 50 ? info.highDesc : info.lowDesc}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(score >= 50 ? info.qualities : info.pitfalls).map((q) => (
                    <span key={q} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: info.color + "22", color: info.color }}>
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* High performance insight */}
        <div className="mb-4 rounded-2xl border border-[#A67C52]/30 bg-[#A67C52]/10 p-4">
          <p className="mb-1 text-sm font-semibold text-[#c9a67a]">💡 Inzicht voor jouw prestaties</p>
          <p className="text-xs leading-relaxed text-gray-300">
            {scores.C >= 60
              ? "Je hoge zorgvuldigheid is een kracht voor consistente prestaties. Let op dat perfectionisme je niet remt."
              : "Werk aan structuur en planning om je talent optimaal te benutten."}
            {" "}
            {scores.N >= 60
              ? "Je gevoeligheid voor stress vraagt om bewuste ontspanningstechnieken."
              : "Je emotionele stabiliteit is een fundament voor presteren onder druk."}
          </p>
        </div>

        <button
          onClick={() => { setStep("intro"); setAnswers({}); setCurrentQ(0); setScores(null); }}
          className="w-full rounded-xl border border-[#2a3e33] py-2.5 text-xs text-gray-400"
        >
          Test opnieuw doen
        </button>
      </div>
    );
  }

  return null;
}
