import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, checkPasscode } from "@/lib/auth";

export async function POST(req: Request) {
  const { passcode } = (await req.json().catch(() => ({}))) as { passcode?: string };
  if (!passcode || !checkPasscode(passcode)) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
