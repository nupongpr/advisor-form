import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { surveyPayloadSchema } from "@/lib/validation";
import { scoreSus } from "@/lib/sus";
import { toAnswerRows } from "@/lib/responses";

// Defense-in-depth cap; a valid payload is a few KB. Zod also bounds each field.
const MAX_BODY_BYTES = 50_000;

export async function POST(req: NextRequest) {
  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = surveyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    // Do not echo validation issue details to the client.
    return NextResponse.json({ error: "validation failed" }, { status: 400 });
  }
  const p = parsed.data;

  let created;
  try {
    created = await prisma.response.create({
      data: {
        role: p.role, frequency: p.frequency, language: p.language,
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
    select: { id: true, role: true, frequency: true, language: true, susScore: true, createdAt: true },
  });
  return NextResponse.json({ responses });
}
