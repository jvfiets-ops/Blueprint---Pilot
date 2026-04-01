import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OmgevingClient from "./OmgevingClient";

export default async function OmgevingPage() {
  const user = await requireUser();
  const persons = await prisma.environmentPerson.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const formatted = persons.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role || "",
    emoji: p.emoji,
    color: p.color,
    gives: JSON.parse(p.gives) as string[],
    costs: JSON.parse(p.costs) as string[],
  }));

  return <OmgevingClient initialPersons={formatted} />;
}
