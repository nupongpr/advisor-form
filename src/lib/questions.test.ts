import { describe, it, expect } from "vitest";
import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "./questions";

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
