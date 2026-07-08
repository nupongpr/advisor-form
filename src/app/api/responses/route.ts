import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { surveyPayloadSchema } from "@/lib/validation";
import { scoreSus } from "@/lib/sus";
import { toAnswerRows } from "@/lib/responses";
import { isCodeUsable } from "@/lib/access-code";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = surveyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const p = parsed.data;

  const codeRecord = await prisma.accessCode.findUnique({ where: { code: p.code } });
  if (!isCodeUsable(codeRecord)) {
    return NextResponse.json({ error: "invalid or inactive code" }, { status: 403 });
  }

  let created;
  try {
    created = await prisma.response.create({
      data: {
        code: p.code, role: p.role, frequency: p.frequency,
        susScore: scoreSus(p.sus),
        answers: { create: toAnswerRows(p) },
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("failed to save response", err);
    return NextResponse.json({ error: "failed to save" }, { status: 500 });
  }

  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function GET() {
  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, code: true, role: true, frequency: true, susScore: true, createdAt: true },
  });
  return NextResponse.json({ responses });
}
