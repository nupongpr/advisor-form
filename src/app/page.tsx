"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSurveyDraft } from "@/lib/use-survey-draft";

export default function Home() {
  const router = useRouter();
  const { draft, setField } = useSurveyDraft();
  const [touched, setTouched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const code = draft.code.trim();

  async function start() {
    if (!code) { setTouched(true); return; }
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) router.push("/survey");
      else setError("รหัสไม่ถูกต้องหรือถูกปิดใช้งาน");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-200 flex-col justify-center px-4 py-10 sm:px-6">
      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">แบบประเมินระบบ ThesisFlow</CardTitle>
          <CardDescription className="leading-relaxed">
            กรุณากรอกรหัส (โค้ด) ที่ได้รับ เพื่อเริ่มทำแบบประเมิน ใช้เวลาประมาณ 10–15 นาที
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">รหัสผู้ตอบ</Label>
            <Input
              id="code"
              value={draft.code}
              onChange={(e) => { setField("code", e.target.value); setError(""); }}
              placeholder="เช่น S01"
              autoComplete="off"
              className="focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            />
            {touched && !code && <p className="text-sm text-destructive">กรุณากรอกรหัส</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button className="w-full" disabled={checking} onClick={start}>
            {checking ? "กำลังตรวจสอบ…" : "เริ่มทำแบบประเมิน"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
