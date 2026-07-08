import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeSchema, isCodeUsable } from "@/lib/access-code";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false });

  const code = parsed.data.code.toUpperCase();

  try {
    const record = await prisma.accessCode.findUnique({ where: { code } });
    return NextResponse.json({ valid: isCodeUsable(record) });
  } catch (err) {
    console.error("verify-code lookup failed", err);
    return NextResponse.json({ valid: false });
  }
}
