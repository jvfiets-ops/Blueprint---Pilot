import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });

  try {
    const detail = await prisma.blueprintDomainDetail.findUnique({
      where: { userId_domain: { userId: user.id, domain } },
    });
    return NextResponse.json(detail);
  } catch {
    return NextResponse.json(null);
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { domain, begeleider, aandacht, watBrengt, watGaatGoed, watGaatMinder, watAnders, reflectie } = body;
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });

  const data = {
    begeleider: begeleider ?? null,
    aandacht: aandacht ?? null,
    watBrengt: watBrengt ?? null,
    watGaatGoed: watGaatGoed ?? null,
    watGaatMinder: watGaatMinder ?? null,
    watAnders: watAnders ?? null,
    reflectie: reflectie ?? null,
  };

  try {
    const detail = await prisma.blueprintDomainDetail.upsert({
      where: { userId_domain: { userId: user.id, domain } },
      create: { userId: user.id, domain, ...data },
      update: data,
    });
    return NextResponse.json(detail);
  } catch (err) {
    console.error("domain-detail PUT error:", err);
    return NextResponse.json({ error: "Save failed: " + String(err) }, { status: 500 });
  }
}
