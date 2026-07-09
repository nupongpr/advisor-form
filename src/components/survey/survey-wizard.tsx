"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScaleField } from "./scale-field";
import { LanguageToggle } from "@/components/language-toggle";
import { useSurveyDraft } from "@/lib/use-survey-draft";
import { useLanguage, UI, tItem } from "@/lib/i18n";
import {
  LIKERT_SECTIONS, SUS_ITEMS, OPEN_QUESTIONS, ROLE_OPTIONS, FREQUENCY_OPTIONS, LIKERT_KEYS, SUS_KEYS,
} from "@/lib/questions";

export function SurveyWizard() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = UI[lang];
  const { draft, loaded, setField, setLikert, setSus, setOpen, reset } = useSurveyDraft();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const optLabel = (o: { label: string; en: string }) => (lang === "en" ? o.en : o.label);
  // Localized items so the Select TRIGGER (base-ui reads its label from `items`) matches the language,
  // not just the dropdown options.
  const roleItems = ROLE_OPTIONS.map((o) => ({ value: o.value, label: optLabel(o) }));
  const freqItems = FREQUENCY_OPTIONS.map((o) => ({ value: o.value, label: optLabel(o) }));

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

  async function submit() {
    setSubmitting(true);
    const payload = {
      role: draft.role, frequency: draft.frequency,
      likert: draft.likert, sus: draft.sus, open: draft.open,
      language: lang,
      website: honeypotRef.current?.value ?? "",
    };
    try {
      const res = await fetch("/api/responses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      reset();
      router.push("/thank-you");
    } catch {
      toast.error(t.submitError);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-200 px-4 py-10 sm:px-6">
      {/* honeypot: hidden from real users; bots that fill it are rejected server-side */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
      />
      <div className="mb-4 flex justify-end">
        <LanguageToggle />
      </div>
      <Progress value={progress} className="h-2.5 rounded-full mb-8" />
      <Card key={step} className="rounded-[1.5rem] shadow-soft border border-border animate-in fade-in-0 duration-300">
        <CardHeader>
          <CardTitle>
            {step === 0 && t.stepGeneral}
            {step >= 1 && step <= 4 && (lang === "en" ? LIKERT_SECTIONS[step - 1].titleEn : LIKERT_SECTIONS[step - 1].title)}
            {step === 5 && t.stepOpen}
            {step === 6 && t.stepSus}
            {step === 7 && t.stepReview}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>{t.role}</Label>
                <Select items={roleItems} value={draft.role ?? ""} onValueChange={(v) => setField("role", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder={t.selectRole} /></SelectTrigger>
                  <SelectContent>{roleItems.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.frequency}</Label>
                <Select items={freqItems} value={draft.frequency ?? ""} onValueChange={(v) => setField("frequency", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder={t.selectFrequency} /></SelectTrigger>
                  <SelectContent>{freqItems.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </>
          )}

          {step >= 1 && step <= 4 && LIKERT_SECTIONS[step - 1].items.map((it) => (
            <ScaleField
              key={it.key}
              name={it.key}
              label={tItem(lang, it)}
              value={draft.likert[it.key]}
              onChange={(v) => setLikert(it.key, v)}
              lowLabel={t.likertLow}
              highLabel={t.likertHigh}
            />
          ))}

          {step === 5 && OPEN_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-2">
              <Label htmlFor={q.key}>{tItem(lang, q)}</Label>
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
              label={tItem(lang, it)}
              value={draft.sus[it.key]}
              onChange={(v) => setSus(it.key, v)}
              lowLabel={t.susLow}
              highLabel={t.susHigh}
            />
          ))}

          {step === 7 && (
            <div className="space-y-2 text-sm">
              <p>{t.reviewRole} {(() => { const o = ROLE_OPTIONS.find((r) => r.value === draft.role); return o ? optLabel(o) : ""; })()}</p>
              <p>{t.reviewFreq} {(() => { const o = FREQUENCY_OPTIONS.find((f) => f.value === draft.frequency); return o ? optLabel(o) : ""; })()}</p>
              <p>{t.reviewCount(LIKERT_KEYS.filter((k) => draft.likert[k]).length, SUS_KEYS.filter((k) => draft.sus[k]).length)}</p>
              <p className="text-muted-foreground">{t.reviewHint}</p>
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
          {t.back}
        </Button>
        {step < totalSteps - 1 ? (
          <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>{t.next}</Button>
        ) : (
          <Button disabled={submitting} onClick={submit}>{submitting ? t.submitting : t.submit}</Button>
        )}
      </div>
    </main>
  );
}
