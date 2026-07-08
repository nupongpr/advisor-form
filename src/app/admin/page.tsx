import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { mean } from "@/lib/stats";
import { LIKERT_SECTIONS, ROLE_OPTIONS } from "@/lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [responses, likertRows] = await Promise.all([
    prisma.response.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.answer.groupBy({ by: ["questionKey"], _avg: { value: true }, where: { value: { not: null } } }),
  ]);

  const total = responses.length;
  const susAvg = mean(responses.map((r) => r.susScore));
  const roleLabel = (v: string) => ROLE_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const avgByKey = new Map(likertRows.map((r) => [r.questionKey, r._avg.value ?? 0]));

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">แดชบอร์ดผู้ดูแล</h1>
        <div className="flex gap-2">
          <a href="/admin/codes" className={buttonVariants({ variant: "outline" })}>จัดการโค้ด</a>
          <a href="/api/admin/export" className={buttonVariants({ variant: "outline" })}>ดาวน์โหลด CSV</a>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[1.5rem] shadow-soft border border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">จำนวนผู้ตอบ</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{total}</CardContent>
        </Card>
        <Card className="rounded-[1.5rem] shadow-soft border border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">SUS เฉลี่ย</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{susAvg.toFixed(1)}</CardContent>
        </Card>
        <Card className="rounded-[1.5rem] shadow-soft border border-border">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">แยกตามบทบาท</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {ROLE_OPTIONS.map((o) => (
              <div key={o.value} className="flex justify-between"><span>{o.label}</span><span>{responses.filter((r) => r.role === o.value).length}</span></div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle>ค่าเฉลี่ย Likert รายข้อ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {LIKERT_SECTIONS.map((s) => (
            <div key={s.key}>
              <p className="mb-2 font-medium">{s.title}</p>
              <div className="space-y-1 text-sm">
                {s.items.map((it) => (
                  <div key={it.key} className="flex justify-between rounded-md px-3 py-1.5 even:bg-muted/40">
                    <span className="truncate pr-4">{it.th}</span>
                    <span className="tabular-nums">{(avgByKey.get(it.key) ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle>รายการคำตอบ</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-semibold text-foreground">โค้ด</TableHead>
                <TableHead className="font-semibold text-foreground">บทบาท</TableHead>
                <TableHead className="font-semibold text-foreground">SUS</TableHead>
                <TableHead className="font-semibold text-foreground">เวลา</TableHead>
                <TableHead className="font-semibold text-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((r) => (
                <TableRow key={r.id} className="border-0 even:bg-muted/40 hover:bg-accent/40">
                  <TableCell className="font-medium">{r.code}</TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-full">{roleLabel(r.role)}</Badge></TableCell>
                  <TableCell className="tabular-nums">{r.susScore.toFixed(1)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString("th-TH")}</TableCell>
                  <TableCell><Link className="text-primary underline" href={`/admin/responses/${r.id}`}>ดู</Link></TableCell>
                </TableRow>
              ))}
              {total === 0 && <TableRow className="border-0"><TableCell colSpan={5} className="text-center text-muted-foreground">ยังไม่มีคำตอบ</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
