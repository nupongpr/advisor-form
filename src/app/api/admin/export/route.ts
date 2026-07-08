import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "@/lib/questions";

export async function GET() {
  const responses = await prisma.response.findMany({ orderBy: { createdAt: "asc" }, include: { answers: true } });

  const answerCols = [...LIKERT_KEYS, ...SUS_KEYS, ...OPEN_KEYS];
  const headers = ["id", "code", "role", "ageBand", "field", "experience", "susScore", "createdAt", ...answerCols];

  const rows = responses.map((r) => {
    const map = new Map(r.answers.map((a) => [a.questionKey, a.value ?? a.text ?? ""]));
    return [
      r.id, r.code, r.role, r.ageBand, r.field ?? "", r.experience ?? "",
      r.susScore, r.createdAt.toISOString(),
      ...answerCols.map((k) => map.get(k) ?? ""),
    ];
  });

  const csv = "﻿" + toCsv(headers, rows); // BOM ให้ Excel อ่านไทยได้
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thesis-form-responses.csv"`,
    },
  });
}
