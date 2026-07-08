import { describe, it, expect } from "vitest";
import { surveyPayloadSchema } from "./validation";
import { LIKERT_KEYS, SUS_KEYS } from "./questions";

const fullLikert = Object.fromEntries(LIKERT_KEYS.map((k) => [k, 4]));
const fullSus = Object.fromEntries(SUS_KEYS.map((k) => [k, 3]));
const valid = {
  code: "S01", role: "student", frequency: "weekly",
  likert: fullLikert, sus: fullSus, open: { open_1: "ดี", open_2: "", open_3: "" },
};

describe("surveyPayloadSchema", () => {
  it("ผ่านเมื่อข้อมูลครบถูกต้อง", () => expect(surveyPayloadSchema.safeParse(valid).success).toBe(true));
  it("ไม่ผ่านเมื่อโค้ดว่าง", () => expect(surveyPayloadSchema.safeParse({ ...valid, code: "" }).success).toBe(false));
  it("ไม่ผ่านเมื่อ Likert ไม่ครบ", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sq_1, ...rest } = fullLikert as Record<string, number>;
    expect(surveyPayloadSchema.safeParse({ ...valid, likert: rest }).success).toBe(false);
  });
  it("ไม่ผ่านเมื่อค่า SUS นอกช่วง", () => expect(surveyPayloadSchema.safeParse({ ...valid, sus: { ...fullSus, sus_1: 9 } }).success).toBe(false));
  it("ไม่ผ่านเมื่อ role ผิด", () => expect(surveyPayloadSchema.safeParse({ ...valid, role: "teacher" }).success).toBe(false));
  it("ผ่านเมื่อ role เป็นเจ้าหน้าที่ (staff)", () => expect(surveyPayloadSchema.safeParse({ ...valid, role: "staff" }).success).toBe(true));
  it("ไม่ผ่านเมื่อไม่มีความถี่การใช้งาน", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { frequency, ...noFreq } = valid;
    expect(surveyPayloadSchema.safeParse(noFreq).success).toBe(false);
  });
  it("ไม่ผ่านเมื่อความถี่การใช้งานผิด", () => expect(surveyPayloadSchema.safeParse({ ...valid, frequency: "yearly" }).success).toBe(false));
});
