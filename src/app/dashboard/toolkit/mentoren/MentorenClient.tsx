"use client";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { getT } from "@/lib/i18n";

interface Mentor {
  id: string;
  name: string;
  role: string;
  emoji: string;
  what_they_teach_me: string;
  how_they_help_me: string;
  key_lessons: string[];
  contact_frequency: string;
  gratitude_note: string;
}

const ROLES = ["Coach", "Manager", "Ouder", "Leraar", "Collega", "Anders"];
const FREQUENCIES = ["Wekelijks", "Maandelijks", "Af en toe", "Zelden"];
const EMOJIS = ["🧭", "🎯", "💡", "🤝", "🌟", "🔥", "🛡️", "🧠", "❤️", "👑", "🦉", "🌱"];
const LESSON_PRESETS = [
  "Geduld", "Discipline", "Luisteren", "Leiderschap", "Veerkracht",
  "Zelfreflectie", "Communicatie", "Balans", "Vertrouwen", "Focus",
];

function TagInput({ tags, onChange, presets }: { tags: string[]; onChange: (t: string[]) => void; presets?: string[] }) {
  const [input, setInput] = useState("");
  const add = (val: string) => { if (val && !tags.includes(val)) onChange([...tags, val]); setInput(""); };
  return (
    <div>
      {presets && (
        <div className="mb-2 flex flex-wrap gap-1">
          {presets.map(p => (
            <button key={p} onClick={() => add(p)}
              className="rounded-full border px-2 py-0.5 text-[10px] transition-colors"
              style={{ borderColor: tags.includes(p) ? "#A67C52" : "#2a3e33", color: tags.includes(p) ? "#c9a67a" : "#6b7280", background: tags.includes(p) ? "#A67C5222" : "transparent" }}>
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="mb-1.5 flex flex-wrap gap-1">
        {tags.map((t, i) => (
          <span key={i} onClick={() => onChange(tags.filter((_, j) => j !== i))}
            className="cursor-pointer rounded-full bg-[#A67C5222] px-2.5 py-0.5 text-[11px] font-semibold text-[#c9a67a]">
            {t} ×
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(input.trim()); } }}
          placeholder="Eigen les toevoegen..."
          className="flex-1 rounded-lg border border-[#2a3e33] bg-[#0f1a14] px-2.5 py-1.5 text-xs text-white outline-none placeholder:text-gray-700" />
        <button onClick={() => add(input.trim())} className="rounded-lg bg-[#A67C5233] px-2.5 py-1.5 text-xs font-bold text-[#c9a67a]">+</button>
      </div>
    </div>
  );
}

export default function MentorenClient({ initialMentors }: { initialMentors: Mentor[] }) {
  const [lang] = useLang();
  const t = getT(lang);
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", role: "Coach", emoji: "🧭", what_they_teach_me: "",
    how_they_help_me: "", key_lessons: [] as string[],
    contact_frequency: "Maandelijks", gratitude_note: "",
  });

  const saveMentor = async () => {
    if (!form.name.trim()) return;
    const res = await fetch("/api/mentors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.id) setMentors([data as Mentor, ...mentors]);
    setAdding(false);
    setForm({ name: "", role: "Coach", emoji: "🧭", what_they_teach_me: "", how_they_help_me: "", key_lessons: [], contact_frequency: "Maandelijks", gratitude_note: "" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">🧭 {t.mentorenTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{t.mentorenDesc}</p>
        </div>
        <button onClick={() => setAdding(true)} className="rounded-xl bg-[#A67C52] px-4 py-2 text-sm font-bold text-white">
          + {t.mentorenAdd}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 rounded-2xl border border-[#A67C52]/40 bg-[#1a2e23] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">{t.mentorenNew}</h3>

          {/* Emoji picker */}
          <div className="mb-3 flex flex-wrap gap-1">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className="rounded-lg p-1.5 text-xl" style={{ background: form.emoji === e ? "#A67C5233" : "transparent" }}>{e}</button>
            ))}
          </div>

          {/* Name */}
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t.mentorenNamePh}
            className="mb-2 w-full rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600" />

          {/* Role */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {ROLES.map(r => (
              <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                className="rounded-xl px-3 py-1.5 text-xs font-medium"
                style={{ background: form.role === r ? "#A67C52" : "#2a3e33", color: form.role === r ? "#fff" : "#9ca3af" }}>
                {r}
              </button>
            ))}
          </div>

          {/* What they teach */}
          <label className="mb-1 block text-[10px] uppercase text-gray-600">{t.mentorenTeach}</label>
          <textarea value={form.what_they_teach_me} onChange={e => setForm(f => ({ ...f, what_they_teach_me: e.target.value }))}
            rows={2} className="mb-3 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700"
            placeholder={t.mentorenTeachPh} />

          {/* How they help */}
          <label className="mb-1 block text-[10px] uppercase text-gray-600">{t.mentorenHelp}</label>
          <textarea value={form.how_they_help_me} onChange={e => setForm(f => ({ ...f, how_they_help_me: e.target.value }))}
            rows={2} className="mb-3 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700"
            placeholder={t.mentorenHelpPh} />

          {/* Key lessons */}
          <label className="mb-1 block text-[10px] uppercase text-gray-600">{t.mentorenLessons}</label>
          <div className="mb-3">
            <TagInput tags={form.key_lessons} onChange={t => setForm(f => ({ ...f, key_lessons: t }))} presets={LESSON_PRESETS} />
          </div>

          {/* Contact frequency */}
          <label className="mb-1 block text-[10px] uppercase text-gray-600">{t.mentorenFreq}</label>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {FREQUENCIES.map(f => (
              <button key={f} onClick={() => setForm(fm => ({ ...fm, contact_frequency: f }))}
                className="rounded-xl px-3 py-1.5 text-xs font-medium"
                style={{ background: form.contact_frequency === f ? "#A67C52" : "#2a3e33", color: form.contact_frequency === f ? "#fff" : "#9ca3af" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Gratitude note */}
          <label className="mb-1 block text-[10px] uppercase text-gray-600">{t.mentorenGratitude}</label>
          <textarea value={form.gratitude_note} onChange={e => setForm(f => ({ ...f, gratitude_note: e.target.value }))}
            rows={2} className="mb-4 w-full resize-none rounded-xl border border-[#2a3e33] bg-[#0f1a14] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-700"
            placeholder={t.mentorenGratitudePh} />

          <div className="flex gap-2">
            <button onClick={saveMentor} className="flex-1 rounded-xl bg-[#A67C52] py-2.5 text-sm font-bold text-white">{t.mentorenSave}</button>
            <button onClick={() => setAdding(false)} className="rounded-xl border border-[#2a3e33] px-4 text-sm text-gray-500">{t.mentorenCancel}</button>
          </div>
        </div>
      )}

      {/* Mentor cards */}
      {mentors.map(m => (
        <div key={m.id} className="mb-3 rounded-2xl border border-[#2a3e33] bg-[#1a2e23] p-4">
          <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} className="flex w-full items-center gap-3 text-left">
            <span className="text-3xl">{m.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white">{m.name}</div>
              <div className="text-xs text-gray-500">{m.role}{m.contact_frequency ? ` · ${m.contact_frequency}` : ""}</div>
            </div>
            {m.key_lessons.length > 0 && (
              <span className="rounded-full bg-[#A67C5222] px-2 py-0.5 text-[10px] text-[#c9a67a]">
                {m.key_lessons.length} {m.key_lessons.length === 1 ? "les" : "lessen"}
              </span>
            )}
            <span className="text-[10px] text-gray-600">{expanded === m.id ? "▲" : "▼"}</span>
          </button>

          {expanded === m.id && (
            <div className="mt-3 border-t border-[#2a3e33] pt-3 space-y-3">
              {m.what_they_teach_me && (
                <div>
                  <label className="mb-0.5 block text-[10px] uppercase text-gray-600">{t.mentorenTeach}</label>
                  <p className="text-sm text-gray-400">{m.what_they_teach_me}</p>
                </div>
              )}
              {m.how_they_help_me && (
                <div>
                  <label className="mb-0.5 block text-[10px] uppercase text-gray-600">{t.mentorenHelp}</label>
                  <p className="text-sm text-gray-400">{m.how_they_help_me}</p>
                </div>
              )}
              {m.key_lessons.length > 0 && (
                <div>
                  <label className="mb-1 block text-[10px] uppercase text-gray-600">{t.mentorenLessons}</label>
                  <div className="flex flex-wrap gap-1">
                    {m.key_lessons.map((l, i) => (
                      <span key={i} className="rounded-full bg-[#A67C5222] px-2.5 py-0.5 text-[10px] text-[#c9a67a]">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {m.gratitude_note && (
                <div className="rounded-xl bg-[#A67C5211] p-3">
                  <label className="mb-0.5 block text-[10px] uppercase text-[#c9a67a]">💜 {t.mentorenGratitude}</label>
                  <p className="text-sm italic text-gray-400">{m.gratitude_note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {mentors.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-[#2a3e33] py-12 text-center text-sm text-gray-600">
          {t.mentorenEmpty}
        </div>
      )}
    </div>
  );
}
