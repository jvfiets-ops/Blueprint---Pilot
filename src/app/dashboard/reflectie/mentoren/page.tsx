export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MentorenClient from "./MentorenClient";

export default async function MentorenPage() {
  const user = await requireUser();
  const mentors = await prisma.mentor.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const formatted = mentors.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role || "",
    emoji: m.emoji,
    what_they_teach_me: m.whatTheyTeachMe || "",
    how_they_help_me: m.howTheyHelpMe || "",
    key_lessons: JSON.parse(m.keyLessons) as string[],
    contact_frequency: m.contactFrequency || "",
    gratitude_note: m.gratitudeNote || "",
  }));

  return <MentorenClient initialMentors={formatted} />;
}
