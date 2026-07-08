import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginRoute =
    pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  if (isLoginRoute) return NextResponse.next();

  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    (pathname === "/api/responses" && req.method === "GET");
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const ok = await verifySessionToken(token, process.env.COOKIE_SECRET ?? "");
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/responses"],
};
