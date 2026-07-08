import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCodes, generateCodesSchema } from "@/lib/access-code";

export async function GET() {
  try {
    const codes = await prisma.accessCode.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ codes });
  } catch (err) {
    console.error("failed to list access codes", err);
    return NextResponse.json({ error: "failed to load" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = generateCodesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const existing = new Set((await prisma.accessCode.findMany({ select: { code: true } })).map((r) => r.code));
    const created = generateCodes(parsed.data.count, existing);
    await prisma.accessCode.createMany({ data: created.map((code) => ({ code })) });

    return NextResponse.json({ created }, { status: 201 });
  } catch (err) {
    console.error("failed to generate access codes", err);
    return NextResponse.json({ error: "failed to generate" }, { status: 500 });
  }
}
