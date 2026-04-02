export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RolModellenClient from "./RolModellenClient";

export default async function RolModellenPage() {
  const user = await requireUser();
  const models = await prisma.roleModel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const formatted = models.map((m) => ({
    id: m.id,
    name: m.name,
    domain: m.domain || "",
    emoji: m.emoji,
    why_inspiring: m.whyInspiring || "",
    what_makes_them_inspiring: JSON.parse(m.whatMakesThemInspiring) as string[],
    personal_meaning: m.personalMeaning || "",
    qualities_to_adopt: JSON.parse(m.qualitiesToAdopt) as string[],
    connected_to_best_version: m.connectedToBestVersion,
  }));

  return <RolModellenClient initialModels={formatted} />;
}
