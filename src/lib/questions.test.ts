import { describe, it, expect } from "vitest";
import {
  LIKERT_KEYS, SUS_KEYS, OPEN_KEYS,
  LIKERT_SECTIONS, OPEN_QUESTIONS, ROLE_OPTIONS, FREQUENCY_OPTIONS, SUS_ITEMS,
} from "./questions";

describe("questions config", () => {
  it("มี Likert 18 คีย์ ไม่ซ้ำ", () => {
    expect(LIKERT_KEYS).toHaveLength(18);
    expect(new Set(LIKERT_KEYS).size).toBe(18);
  });
  it("มี SUS 10 คีย์ เรียง sus_1..sus_10", () => {
    expect(SUS_KEYS).toEqual(Array.from({ length: 10 }, (_, i) => `sus_${i + 1}`));
  });
  it("มีปลายเปิด 3 คีย์", () => {
    expect(OPEN_KEYS).toEqual(["open_1", "open_2", "open_3"]);
  });
});

// Coverage guard: กันข้อความหลุดไม่ได้แปลอังกฤษ (ทุก item/option ต้องมี en ที่ไม่ว่าง)
describe("i18n coverage (อังกฤษครบทุกข้อความข้อมูล)", () => {
  const nonEmpty = (s: string | undefined) => (s ?? "").trim().length > 0;

  it("Likert ทุกข้อ + หัวข้อทุกด้าน มี en/titleEn ไม่ว่าง", () => {
    for (const s of LIKERT_SECTIONS) {
      expect(nonEmpty(s.titleEn)).toBe(true);
      for (const it of s.items) expect(nonEmpty(it.en)).toBe(true);
    }
  });
  it("คำถามปลายเปิดทุกข้อ มี en ไม่ว่าง", () => {
    for (const q of OPEN_QUESTIONS) expect(nonEmpty(q.en)).toBe(true);
  });
  it("SUS ทุกข้อ มี en ไม่ว่าง", () => {
    for (const it of SUS_ITEMS) expect(nonEmpty(it.en)).toBe(true);
  });
  it("ตัวเลือกบทบาท/ความถี่ ทุกตัวมี en ไม่ว่าง", () => {
    for (const o of ROLE_OPTIONS) expect(nonEmpty(o.en)).toBe(true);
    for (const o of FREQUENCY_OPTIONS) expect(nonEmpty(o.en)).toBe(true);
  });
});
