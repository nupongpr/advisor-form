import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LIKERT_SECTIONS, SUS_ITEMS, OPEN_QUESTIONS, ROLE_OPTIONS } from "@/lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResponseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.response.findUnique({ where: { id }, include: { answers: true } });
  if (!r) notFound();

  const val = new Map(r.answers.map((a) => [a.questionKey, a]));
  const roleLabel = ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? r.role;

  return (
    <main className="mx-auto max-w-[800px] px-4 py-8">
      <Link
        href="/admin"
        className={cn(buttonVariants({ variant: "outline" }), "mb-4 border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80")}
      >
        ← กลับ
      </Link>
      <Card className="mb-4 rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle>คำตอบของ {r.code}</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>บทบาท: {roleLabel}</p>
          <p>ช่วงอายุ: {r.ageBand}</p>
          {r.field && <p>สาขา/หน่วยงาน: {r.field}</p>}
          {r.experience && <p>ประสบการณ์: {r.experience}</p>}
          <p>คะแนน SUS: <b>{r.susScore.toFixed(1)}</b></p>
        </CardContent>
      </Card>

      {LIKERT_SECTIONS.map((s) => (
        <Card key={s.key} className="mb-4 rounded-[1.5rem] shadow-soft border border-border">
          <CardHeader><CardTitle className="text-base">{s.title}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {s.items.map((it) => (
              <div key={it.key} className="flex justify-between rounded-md px-3 py-1.5 even:bg-muted/40">
                <span className="truncate pr-4">{it.th}</span>
                <span className="tabular-nums">{val.get(it.key)?.value ?? "-"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="mb-4 rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle className="text-base">SUS</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {SUS_ITEMS.map((it) => (
            <div key={it.key} className="flex justify-between rounded-md px-3 py-1.5 even:bg-muted/40">
              <span className="truncate pr-4">{it.th}</span>
              <span className="tabular-nums">{val.get(it.key)?.value ?? "-"}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle className="text-base">คำตอบปลายเปิด</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {OPEN_QUESTIONS.map((q) => (
            <div key={q.key}>
              <p className="font-medium">{q.th}</p>
              <p className="text-muted-foreground">{val.get(q.key)?.text ?? "-"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
