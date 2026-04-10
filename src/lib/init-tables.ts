import { prisma } from "./prisma";

let initialized = false;

export async function ensureTablesExist() {
  if (initialized) return;
  try {
    await prisma.$executeRawUnsafe(`SELECT 1 FROM "User" LIMIT 1`);
    initialized = true;
  } catch {
    // Tables don't exist — create them
    const SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL,
  role TEXT DEFAULT 'user', approved BOOLEAN DEFAULT true, "gdprConsent" BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'atleet', language TEXT DEFAULT 'nl', "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "UserMemory" (id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, summary TEXT, "moodPatterns" TEXT, "recurringStressors" TEXT, "behavioralSignals" TEXT, "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "Reflection" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, "createdAt" TIMESTAMPTZ DEFAULT now(), "moodIcon" TEXT, "moodScore" INT, "conversationTranscript" TEXT, "eventLabel" TEXT DEFAULT 'Training', "eventReflectionText" TEXT, "eventReflectionVoiceTranscript" TEXT, "aiSummary" TEXT, "appVersion" TEXT DEFAULT '1.0');
CREATE TABLE IF NOT EXISTS "ChatSession" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, title TEXT, messages TEXT DEFAULT '[]', summary TEXT, "stressorsDetected" TEXT, "createdAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "LoginAttempt" (id TEXT PRIMARY KEY, email TEXT NOT NULL, success BOOLEAN DEFAULT false, "createdAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "UsageLimit" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, date TEXT NOT NULL, "messageCount" INT DEFAULT 0, UNIQUE("userId", date));
CREATE TABLE IF NOT EXISTS "UserAISetting" (id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, provider TEXT, "encryptedApiKey" TEXT, "modelOverride" TEXT, "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "UserActivity" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, type TEXT NOT NULL, duration INT, metadata TEXT, "createdAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "Message" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, content TEXT NOT NULL, "fromAdmin" BOOLEAN DEFAULT false, read BOOLEAN DEFAULT false, "createdAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "ResetRoutine" (id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, "faultReaction" TEXT, "letGo" TEXT, signal TEXT, control TEXT, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "BlueprintDomain" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, name TEXT NOT NULL, "nameKey" TEXT, positive TEXT, negative TEXT, improve TEXT, "sortOrder" INT DEFAULT 0, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "PerformanceProfile" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now(), context TEXT NOT NULL, "bestVersionName" TEXT, "bestVersionDescription" TEXT, "bestVersionKeywords" TEXT DEFAULT '[]', "bestVersionCodewords" TEXT DEFAULT '[]', "bestVersionExternalPerspective" TEXT, "worstVersionName" TEXT, "worstVersionDescription" TEXT, "worstVersionKeywords" TEXT DEFAULT '[]', "worstVersionCodewords" TEXT DEFAULT '[]', "worstVersionExternalPerspective" TEXT, UNIQUE("userId", context));
CREATE TABLE IF NOT EXISTS "RoleModel" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, "createdAt" TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, domain TEXT, emoji TEXT DEFAULT '⭐', "whyInspiring" TEXT, "whatMakesThemInspiring" TEXT DEFAULT '[]', "personalMeaning" TEXT, "qualitiesToAdopt" TEXT DEFAULT '[]', "connectedToBestVersion" BOOLEAN DEFAULT false);
CREATE TABLE IF NOT EXISTS "Mentor" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, "createdAt" TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, role TEXT, emoji TEXT DEFAULT '🧭', "whatTheyTeachMe" TEXT, "howTheyHelpMe" TEXT, "keyLessons" TEXT DEFAULT '[]', "contactFrequency" TEXT, "gratitudeNote" TEXT);
CREATE TABLE IF NOT EXISTS "DailyGoal" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, date TEXT NOT NULL, text TEXT NOT NULL, category TEXT DEFAULT 'algemeen', "createdAt" TIMESTAMPTZ DEFAULT now(), UNIQUE("userId", date));
CREATE TABLE IF NOT EXISTS "MatchScript" (id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, context TEXT DEFAULT 'wedstrijd', visualization TEXT, "focusWords" TEXT DEFAULT '[]', breathing TEXT, "bodyLanguage" TEXT, "actionPlan" TEXT, mantra TEXT, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "GameFace" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, name TEXT DEFAULT 'Wedstrijd', codewords TEXT DEFAULT '[]', color TEXT DEFAULT '#A67C52', "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "PersonalityProfile" (id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE, openness FLOAT NOT NULL, conscientiousness FLOAT NOT NULL, extraversion FLOAT NOT NULL, agreeableness FLOAT NOT NULL, neuroticism FLOAT NOT NULL, answers TEXT DEFAULT '[]', "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "BlauwdrukBron" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, thema TEXT NOT NULL, titel TEXT NOT NULL, beschrijving TEXT, categorie TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "Rolmodel" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, naam TEXT NOT NULL, omschrijving TEXT, kwaliteit TEXT NOT NULL, leerpunt TEXT NOT NULL, toepassing TEXT, domein TEXT NOT NULL, relatie TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "AntsLog" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, "antTekst" TEXT NOT NULL, "antType" TEXT NOT NULL, "bewijsVoor" TEXT, "bewijsTegen" TEXT, squash TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "Routine" (id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE, naam TEXT NOT NULL, beschrijving TEXT, categorie TEXT DEFAULT 'ANDERS', frequentie TEXT DEFAULT 'DAGELIJKS', tijdstip TEXT DEFAULT 'FLEXIBEL', "isHelpend" BOOLEAN, kleur TEXT DEFAULT '#7F77DD', icoon TEXT DEFAULT 'zap', actief BOOLEAN DEFAULT true, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS "RoutineLog" (id TEXT PRIMARY KEY, "routineId" TEXT REFERENCES "Routine"(id) ON DELETE CASCADE, datum TEXT NOT NULL, status TEXT NOT NULL, notitie TEXT, UNIQUE("routineId", datum));
    `;
    const statements = SQL.split(";").map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt).catch(() => {});
    }
    initialized = true;
  }
}
