import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { makeSessionToken, safeEqual, SESSION_COOKIE } from "@/lib/auth";

const SESSION_TTL_SEC = 60 * 60 * 8;

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const secret = process.env.COOKIE_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!secret || !adminPassword) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const ok = typeof password === "string" && password.length > 0 && (await safeEqual(password, adminPassword, secret));
  if (!ok) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await makeSessionToken(secret, SESSION_TTL_SEC);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_SEC,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
