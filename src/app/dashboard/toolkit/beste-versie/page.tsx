export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BesteVersieClient from "./BesteVersieClient";

export default async function BesteVersiePage() {
  const user = await requireUser();
  const profiles = await prisma.performanceProfile.findMany({
    where: { userId: user.id },
  });

  const formatted = profiles.map((p) => ({
    id: p.id,
    context: p.context as "training" | "wedstrijd" | "algemeen",
    best_version_name: p.bestVersionName || "",
    best_version_description: p.bestVersionDescription || "",
    best_version_keywords: JSON.parse(p.bestVersionKeywords) as string[],
    best_version_codewords: JSON.parse(p.bestVersionCodewords) as string[],
    best_version_external_perspective: p.bestVersionExternalPerspective || "",
    worst_version_name: p.worstVersionName || "",
    worst_version_description: p.worstVersionDescription || "",
    worst_version_keywords: JSON.parse(p.worstVersionKeywords) as string[],
    worst_version_codewords: JSON.parse(p.worstVersionCodewords) as string[],
    worst_version_external_perspective: p.worstVersionExternalPerspective || "",
  }));

  return <BesteVersieClient initialProfiles={formatted} />;
}
