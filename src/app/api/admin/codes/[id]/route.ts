import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ active: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed" }, { status: 400 });
  }
  try {
    const code = await prisma.accessCode.update({ where: { id }, data: { active: parsed.data.active } });
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
