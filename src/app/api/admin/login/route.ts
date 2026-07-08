import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  if (!process.env.COOKIE_SECRET) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }
  const token = await makeSessionToken(process.env.COOKIE_SECRET);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
