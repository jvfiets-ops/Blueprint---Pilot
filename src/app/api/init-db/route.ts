import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL,
  role TEXT DEFAULT 'user', approved BOOLEAN DEFAULT true, "gdprConsent" BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'atleet', language TEXT DEFAULT 'nl', "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "UserMemory" (
  id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  summary TEXT, "moodPatterns" TEXT, "recurringStressors" TEXT, "behavioralSignals" TEXT, "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "Reflection" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), "moodIcon" TEXT, "moodScore" INT,
  "conversationTranscript" TEXT, "eventLabel" TEXT DEFAULT 'Training',
  "eventReflectionText" TEXT, "eventReflectionVoiceTranscript" TEXT, "aiSummary" TEXT, "appVersion" TEXT DEFAULT '1.0'
);
CREATE TABLE IF NOT EXISTS "EnvironmentPerson" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, role TEXT,
  emoji TEXT DEFAULT '👤', color TEXT DEFAULT '#7c3aed', gives TEXT DEFAULT '[]', costs TEXT DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS "PerformanceProfile" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now(), context TEXT NOT NULL,
  "bestVersionName" TEXT, "bestVersionDescription" TEXT, "bestVersionKeywords" TEXT DEFAULT '[]',
  "bestVersionCodewords" TEXT DEFAULT '[]', "bestVersionExternalPerspective" TEXT,
  "worstVersionName" TEXT, "worstVersionDescription" TEXT, "worstVersionKeywords" TEXT DEFAULT '[]',
  "worstVersionCodewords" TEXT DEFAULT '[]', "worstVersionExternalPerspective" TEXT, UNIQUE("userId", context)
);
CREATE TABLE IF NOT EXISTS "RoleModel" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, domain TEXT, emoji TEXT DEFAULT '⭐',
  "whyInspiring" TEXT, "whatMakesThemInspiring" TEXT DEFAULT '[]', "personalMeaning" TEXT,
  "qualitiesToAdopt" TEXT DEFAULT '[]', "connectedToBestVersion" BOOLEAN DEFAULT false
);
CREATE TABLE IF NOT EXISTS "Mentor" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), name TEXT NOT NULL, role TEXT, emoji TEXT DEFAULT '🧭',
  "whatTheyTeachMe" TEXT, "howTheyHelpMe" TEXT, "keyLessons" TEXT DEFAULT '[]',
  "contactFrequency" TEXT, "gratitudeNote" TEXT
);
CREATE TABLE IF NOT EXISTS "DailyGoal" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  date TEXT NOT NULL, text TEXT NOT NULL, category TEXT DEFAULT 'algemeen',
  "createdAt" TIMESTAMPTZ DEFAULT now(), UNIQUE("userId", date)
);
CREATE TABLE IF NOT EXISTS "ChatSession" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT, messages TEXT DEFAULT '[]', summary TEXT, "stressorsDetected" TEXT, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "ErgodicDilemma" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), dilemma TEXT NOT NULL, "optionA" TEXT NOT NULL, "optionB" TEXT NOT NULL,
  "choice24h" TEXT NOT NULL, "reason24h" TEXT, "choice10y" TEXT NOT NULL, "reason10y" TEXT,
  aligned BOOLEAN NOT NULL, reflection TEXT, "chosenOption" TEXT, category TEXT DEFAULT 'algemeen'
);
CREATE TABLE IF NOT EXISTS "StrategicGoal" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL, category TEXT DEFAULT 'persoonlijk', timeframe TEXT DEFAULT '3 maanden',
  description TEXT, "whyImportant" TEXT, "successLooksLike" TEXT,
  obstacles TEXT DEFAULT '[]', actions TEXT DEFAULT '[]',
  confidence INT DEFAULT 5, progress INT DEFAULT 0, status TEXT DEFAULT 'actief', reflections TEXT DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS "PersonalityProfile" (
  id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  openness FLOAT NOT NULL, conscientiousness FLOAT NOT NULL, extraversion FLOAT NOT NULL,
  agreeableness FLOAT NOT NULL, neuroticism FLOAT NOT NULL,
  answers TEXT DEFAULT '[]', "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "UserActivity" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL, duration INT, metadata TEXT, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "LoginAttempt" (
  id TEXT PRIMARY KEY, email TEXT NOT NULL, success BOOLEAN DEFAULT false, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "AllowedEmail" (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, note TEXT, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "UsageLimit" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  date TEXT NOT NULL, "messageCount" INT DEFAULT 0, UNIQUE("userId", date)
);
CREATE TABLE IF NOT EXISTS "UserAISetting" (
  id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  provider TEXT, "encryptedApiKey" TEXT, "modelOverride" TEXT, "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "MatchScript" (
  id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  context TEXT DEFAULT 'wedstrijd', visualization TEXT, "focusWords" TEXT DEFAULT '[]',
  breathing TEXT, "bodyLanguage" TEXT, "actionPlan" TEXT, mantra TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "GameFace" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Wedstrijd', codewords TEXT DEFAULT '[]', color TEXT DEFAULT '#A67C52',
  "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "EnergyAudit" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  activity TEXT NOT NULL, quadrant TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "Intention" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  date TEXT NOT NULL, activity TEXT NOT NULL, intention TEXT NOT NULL,
  "followUpScore" INT, "followUpNote" TEXT, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "WeekReview" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "weekStart" TEXT NOT NULL, highlight TEXT, challenge TEXT, "nextWeek" TEXT, "aiSummary" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(), UNIQUE("userId", "weekStart")
);
CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL, "fromAdmin" BOOLEAN DEFAULT false, read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Message"("userId");
CREATE TABLE IF NOT EXISTS "ResetRoutine" (
  id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "faultReaction" TEXT, "letGo" TEXT, signal TEXT, control TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "BlueprintDomain" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL, "nameKey" TEXT, positive TEXT, negative TEXT, improve TEXT,
  "sortOrder" INT DEFAULT 0, "createdAt" TIMESTAMPTZ DEFAULT now(), "updatedAt" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "BlueprintDomain_userId_idx" ON "BlueprintDomain"("userId");
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  id TEXT PRIMARY KEY, "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  subscription TEXT NOT NULL, "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  id TEXT PRIMARY KEY, "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "morningTime" TEXT DEFAULT '08:00', "eveningTime" TEXT DEFAULT '21:00', "pushEnabled" BOOLEAN DEFAULT true
);
`;

export async function GET() {
  try {
    const statements = SCHEMA_SQL.split(";").map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    // Create pilot user if not exists
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, email, name, password, role, approved, "gdprConsent", category, language)
      VALUES ('pilot-user', 'pilot@blueprint.app', 'Pilot', 'no-password', 'admin', true, true, 'atleet', 'nl')
      ON CONFLICT (id) DO NOTHING
    `);

    return NextResponse.json({ ok: true, tables: statements.length });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
