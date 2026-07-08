import { describe, it, expect } from "vitest";
import { toAnswerRows } from "./responses";
import { LIKERT_KEYS, SUS_KEYS } from "./questions";
import type { SurveyPayload } from "./validation";

const payload = {
  code: "S01", role: "student", ageBand: "<40",
  likert: Object.fromEntries(LIKERT_KEYS.map((k) => [k, 4])),
  sus: Object.fromEntries(SUS_KEYS.map((k) => [k, 3])),
  open: { open_1: "ดีมาก", open_2: "", open_3: "  " },
} as SurveyPayload;

describe("toAnswerRows", () => {
  it("Likert 18 + SUS 10 + open ที่ไม่ว่างเท่านั้น", () => {
    const rows = toAnswerRows(payload);
    const likertKeys: readonly string[] = LIKERT_KEYS;
    const susKeys: readonly string[] = SUS_KEYS;
    expect(rows.filter((r) => likertKeys.includes(r.questionKey))).toHaveLength(18);
    expect(rows.filter((r) => susKeys.includes(r.questionKey))).toHaveLength(10);
    const open = rows.filter((r) => r.questionKey.startsWith("open_"));
    expect(open).toHaveLength(1);
    expect(open[0]).toMatchObject({ questionKey: "open_1", value: null, text: "ดีมาก" });
  });
});
