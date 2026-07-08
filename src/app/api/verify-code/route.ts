import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeSchema, isCodeUsable } from "@/lib/access-code";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false });

  const record = await prisma.accessCode.findUnique({ where: { code: parsed.data.code } });
  return NextResponse.json({ valid: isCodeUsable(record) });
}
