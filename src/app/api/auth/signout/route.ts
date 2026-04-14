import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL("/onboarding", req.url);
  const response = NextResponse.redirect(url);
  response.cookies.set("hpb-user-token", "", { maxAge: 0, path: "/" });
  return response;
}
