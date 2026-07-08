"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScaleField } from "./scale-field";
import { useSurveyDraft } from "@/lib/use-survey-draft";
import {
  LIKERT_SECTIONS, SUS_ITEMS, OPEN_QUESTIONS, ROLE_OPTIONS, FREQUENCY_OPTIONS, LIKERT_KEYS, SUS_KEYS,
} from "@/lib/questions";

export function SurveyWizard() {
  const router = useRouter();
  const { draft, loaded, setField, setLikert, setSus, setOpen, reset } = useSurveyDraft();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 0=ข้อมูลทั่วไป, 1..4=Likert, 5=ปลายเปิด, 6=SUS, 7=ทบทวน
  const totalSteps = 8;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const canNext = useMemo(() => {
    if (step === 0) return !!draft.role && !!draft.frequency;
    if (step >= 1 && step <= 4) return LIKERT_SECTIONS[step - 1].items.every((i) => !!draft.likert[i.key]);
    if (step === 5) return true;
    if (step === 6) return SUS_ITEMS.every((i) => !!draft.sus[i.key]);
    return true;
  }, [step, draft]);

  if (!loaded) return null;
  if (!draft.code.trim()) {
    return (
      <div className="p-8 text-center">
        <p>ไม่พบรหัสผู้ตอบ</p>
        <Button className="mt-4" onClick={() => router.push("/")}>กลับไปกรอกรหัส</Button>
      </div>
    );
  }

  async function submit() {
    setSubmitting(true);
    const payload = {
      code: draft.code.trim(), role: draft.role, frequency: draft.frequency,
      likert: draft.likert, sus: draft.sus, open: draft.open,
    };
    try {
      const res = await fetch("/api/responses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      reset();
      router.push("/thank-you");
    } catch {
      toast.error("ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-200 px-4 py-10 sm:px-6">
      <Progress value={progress} className="h-2.5 rounded-full mb-8" />
      <Card key={step} className="rounded-[1.5rem] shadow-soft border border-border animate-in fade-in-0 duration-300">
        <CardHeader>
          <CardTitle>
            {step === 0 && "ข้อมูลทั่วไป"}
            {step >= 1 && step <= 4 && LIKERT_SECTIONS[step - 1].title}
            {step === 5 && "คำถามปลายเปิด"}
            {step === 6 && "แบบวัดการใช้งานระบบ (SUS)"}
            {step === 7 && "ทบทวนและส่ง"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>บทบาท</Label>
                <Select items={ROLE_OPTIONS} value={draft.role ?? ""} onValueChange={(v) => setField("role", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="เลือกบทบาท" /></SelectTrigger>
                  <SelectContent>{ROLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ความถี่ในการใช้งาน</Label>
                <Select items={FREQUENCY_OPTIONS} value={draft.frequency ?? ""} onValueChange={(v) => setField("frequency", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="เลือกความถี่ในการใช้งาน" /></SelectTrigger>
                  <SelectContent>{FREQUENCY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}

          {step >= 1 && step <= 4 && LIKERT_SECTIONS[step - 1].items.map((it) => (
            <ScaleField key={it.key} name={it.key} label={it.th} value={draft.likert[it.key]} onChange={(v) => setLikert(it.key, v)} />
          ))}

          {step === 5 && OPEN_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-2">
              <Label htmlFor={q.key}>{q.th}</Label>
              <Textarea
                id={q.key}
                value={draft.open[q.key] ?? ""}
                onChange={(e) => setOpen(q.key, e.target.value)}
                rows={3}
                className="focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
              />
            </div>
          ))}

          {step === 6 && SUS_ITEMS.map((it) => (
            <ScaleField
              key={it.key}
              name={it.key}
              label={it.th}
              value={draft.sus[it.key]}
              onChange={(v) => setSus(it.key, v)}
              lowLabel="ไม่เห็นด้วยอย่างยิ่ง"
              highLabel="เห็นด้วยอย่างยิ่ง"
            />
          ))}

          {step === 7 && (
            <div className="space-y-2 text-sm">
              <p>โค้ด: <b>{draft.code}</b></p>
              <p>บทบาท: {ROLE_OPTIONS.find((r) => r.value === draft.role)?.label}</p>
              <p>ความถี่ในการใช้งาน: {FREQUENCY_OPTIONS.find((f) => f.value === draft.frequency)?.label}</p>
              <p>ตอบ Likert {LIKERT_KEYS.filter((k) => draft.likert[k]).length}/18 · SUS {SUS_KEYS.filter((k) => draft.sus[k]).length}/10</p>
              <p className="text-muted-foreground">กดส่งเพื่อบันทึกคำตอบ (ส่งได้ครั้งเดียว)</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          className="border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80"
          disabled={step === 0 || submitting}
          onClick={() => setStep((s) => s - 1)}
        >
          ย้อนกลับ
        </Button>
        {step < totalSteps - 1 ? (
          <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>ถัดไป</Button>
        ) : (
          <Button disabled={submitting} onClick={submit}>{submitting ? "กำลังส่ง…" : "ส่งแบบประเมิน"}</Button>
        )}
      </div>
    </main>
  );
}
