"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AccessCode = { id: string; code: string; active: boolean; createdAt: string };

export function CodesManager() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [count, setCount] = useState("10");
  const [created, setCreated] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/codes");
    if (res.ok) setCodes((await res.json()).codes);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function generate() {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > 500) { toast.error("จำนวนต้องเป็น 1–500"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: n }),
      });
      if (!res.ok) throw new Error();
      setCreated((await res.json()).created);
      await load();
      toast.success(`สร้าง ${n} โค้ดแล้ว`);
    } catch { toast.error("สร้างโค้ดไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  async function toggle(c: AccessCode) {
    const res = await fetch(`/api/admin/codes/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !c.active } : x)));
    else toast.error("อัปเดตไม่สำเร็จ");
  }

  function copyAll() {
    navigator.clipboard.writeText(created.join("\n")).then(() => toast.success("คัดลอกแล้ว"));
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle className="text-base">สร้างโค้ดใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="count">จำนวน</Label>
              <Input id="count" value={count} onChange={(e) => setCount(e.target.value)} className="w-32" inputMode="numeric" />
            </div>
            <Button onClick={generate} disabled={busy}>{busy ? "กำลังสร้าง…" : "สร้างโค้ด"}</Button>
          </div>
          {created.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">โค้ดที่เพิ่งสร้าง ({created.length})</p>
                <Button variant="outline" onClick={copyAll}>คัดลอกทั้งหมด</Button>
              </div>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-sm tabular-nums">{created.join("\n")}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle className="text-base">โค้ดทั้งหมด ({codes.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-semibold text-foreground">โค้ด</TableHead>
                <TableHead className="font-semibold text-foreground">สถานะ</TableHead>
                <TableHead className="font-semibold text-foreground">สร้างเมื่อ</TableHead>
                <TableHead className="font-semibold text-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id} className="border-0 even:bg-muted/40">
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>
                    <Badge variant={c.active ? "default" : "secondary"} className="rounded-full">
                      {c.active ? "ใช้งาน" : "ปิด"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleString("th-TH")}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => toggle(c)}>{c.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}</Button>
                  </TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && (
                <TableRow className="border-0"><TableCell colSpan={4} className="text-center text-muted-foreground">ยังไม่มีโค้ด</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
