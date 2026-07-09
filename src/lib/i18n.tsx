"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "th" | "en";

const KEY = "thesis-form-lang";

type LanguageContextValue = { lang: Lang; setLang: (l: Lang) => void };
const LanguageContext = createContext<LanguageContextValue>({ lang: "th", setLang: () => {} });

/** Wraps the app (in root layout). Holds the single language state, persisted to localStorage. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR + first client render use "th" (default) to avoid hydration mismatch; the stored
  // choice is applied after mount.
  const [lang, setLangState] = useState<Lang>("th");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // Hydrate from storage after mount (reading in useState initializer would cause a
      // server/client hydration mismatch since SSR always renders the "th" default).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw === "en" || raw === "th") setLangState(raw);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Pick the localized string from a `{ th, en? }` item, falling back to Thai. */
export function tItem(lang: Lang, item: { th: string; en?: string }): string {
  return (lang === "en" ? item.en : item.th) ?? item.th;
}

/** Dictionary shape — declaring it forces `th` and `en` to stay in sync (missing key = compile error). */
type Dict = {
  langLabel: string;
  // landing
  landingTitle: string;
  landingDesc: string;
  landingBullets: [string, string, string, string];
  start: string;
  // wizard step titles
  stepGeneral: string;
  stepOpen: string;
  stepSus: string;
  stepReview: string;
  // demographics
  role: string;
  frequency: string;
  selectRole: string;
  selectFrequency: string;
  // scale anchors
  likertLow: string;
  likertHigh: string;
  susLow: string;
  susHigh: string;
  // review step
  reviewRole: string;
  reviewFreq: string;
  reviewCount: (likert: number, sus: number) => string;
  reviewHint: string;
  // buttons / toast
  back: string;
  next: string;
  submit: string;
  submitting: string;
  submitError: string;
  // thank-you
  thankTitle: string;
  thankBody: string;
  home: string;
};

export const UI: Record<Lang, Dict> = {
  th: {
    langLabel: "ไทย",
    landingTitle: "แบบประเมินระบบ AI thesis co-advisor",
    landingDesc:
      "แบบสอบถามความพึงพอใจและการใช้งานระบบบริหารจัดการวิทยานิพนธ์ AI thesis co-advisor ใช้เวลาประมาณ 10–15 นาที คำตอบเป็นความลับและไม่เก็บข้อมูลที่ระบุตัวตน",
    landingBullets: [
      "ข้อมูลทั่วไป (บทบาทและความถี่ในการใช้งาน)",
      "แบบสอบถามความพึงพอใจการใช้งานระบบติดตามวิทยานิพนธ์ 4 ด้าน รวม 18 ข้อ",
      "คำถามปลายเปิด 3 ข้อ",
      "แบบประเมินความสามารถในการใช้งานระบบ (SUS) 10 ข้อ",
    ],
    start: "เริ่มทำแบบประเมิน",
    stepGeneral: "ข้อมูลทั่วไป",
    stepOpen: "คำถามปลายเปิด",
    stepSus: "แบบวัดการใช้งานระบบ (SUS)",
    stepReview: "ทบทวนและส่ง",
    role: "บทบาท",
    frequency: "ความถี่ในการใช้งาน",
    selectRole: "เลือกบทบาท",
    selectFrequency: "เลือกความถี่ในการใช้งาน",
    likertLow: "น้อยที่สุด",
    likertHigh: "มากที่สุด",
    susLow: "ไม่เห็นด้วยอย่างยิ่ง",
    susHigh: "เห็นด้วยอย่างยิ่ง",
    reviewRole: "บทบาท:",
    reviewFreq: "ความถี่ในการใช้งาน:",
    reviewCount: (likert, sus) => `ตอบ Likert ${likert}/18 · SUS ${sus}/10`,
    reviewHint: "กดส่งเพื่อบันทึกคำตอบ (ส่งได้ครั้งเดียว)",
    back: "ย้อนกลับ",
    next: "ถัดไป",
    submit: "ส่งแบบประเมิน",
    submitting: "กำลังส่ง…",
    submitError: "ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    thankTitle: "ขอบคุณสำหรับการประเมิน 🎉",
    thankBody: "ระบบได้บันทึกคำตอบของท่านเรียบร้อยแล้ว",
    home: "กลับสู่หน้าแรก",
  },
  en: {
    langLabel: "English",
    landingTitle: "AI thesis co-advisor Evaluation",
    landingDesc:
      "A satisfaction and usability questionnaire for the AI thesis co-advisor thesis-management system. It takes about 10–15 minutes. Responses are confidential and no identifying information is collected.",
    landingBullets: [
      "General information (role and frequency of use)",
      "Satisfaction questionnaire on the thesis-tracking system — 4 sections, 18 items",
      "3 open-ended questions",
      "System Usability Scale (SUS), 10 items",
    ],
    start: "Start the evaluation",
    stepGeneral: "General Information",
    stepOpen: "Open-ended Questions",
    stepSus: "System Usability Scale (SUS)",
    stepReview: "Review & Submit",
    role: "Role",
    frequency: "Frequency of use",
    selectRole: "Select a role",
    selectFrequency: "Select frequency of use",
    likertLow: "Least",
    likertHigh: "Most",
    susLow: "Strongly disagree",
    susHigh: "Strongly agree",
    reviewRole: "Role:",
    reviewFreq: "Frequency of use:",
    reviewCount: (likert, sus) => `Answered Likert ${likert}/18 · SUS ${sus}/10`,
    reviewHint: "Press Submit to save your answers (you can submit only once).",
    back: "Back",
    next: "Next",
    submit: "Submit",
    submitting: "Submitting…",
    submitError: "Submission failed. Please try again.",
    thankTitle: "Thank you for your evaluation 🎉",
    thankBody: "Your response has been saved successfully.",
    home: "Back to home",
  },
};
