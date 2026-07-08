import { describe, it, expect } from "vitest";
import {
  CODE_ALPHABET, CODE_LENGTH, generateCode, generateCodes, isCodeUsable,
  generateCodesSchema,
} from "./access-code";

describe("generateCode", () => {
  it("มีความยาวตามกำหนดและใช้เฉพาะตัวอักษรที่อนุญาต", () => {
    for (let i = 0; i < 200; i++) {
      const c = generateCode();
      expect(c).toHaveLength(CODE_LENGTH);
      expect([...c].every((ch) => CODE_ALPHABET.includes(ch))).toBe(true);
    }
  });
  it("ไม่มีตัวอักษรกำกวม 0 O 1 I L", () => {
    expect(/[0O1IL]/.test(CODE_ALPHABET)).toBe(false);
  });
});

describe("generateCodes", () => {
  it("คืนโค้ดไม่ซ้ำตามจำนวนที่ขอ", () => {
    const codes = generateCodes(50);
    expect(codes).toHaveLength(50);
    expect(new Set(codes).size).toBe(50);
  });
  it("ไม่ชนกับโค้ดที่มีอยู่แล้ว", () => {
    const existing = new Set(generateCodes(10));
    const more = generateCodes(10, existing);
    expect(more.some((c) => existing.has(c))).toBe(false);
  });
});

describe("isCodeUsable", () => {
  it("true เฉพาะเมื่อมี record และ active", () => {
    expect(isCodeUsable({ active: true })).toBe(true);
    expect(isCodeUsable({ active: false })).toBe(false);
    expect(isCodeUsable(null)).toBe(false);
    expect(isCodeUsable(undefined)).toBe(false);
  });
});

describe("generateCodesSchema", () => {
  it("รับ count ที่ถูกต้อง (1..500 จำนวนเต็ม)", () => {
    expect(generateCodesSchema.safeParse({ count: 1 }).success).toBe(true);
    expect(generateCodesSchema.safeParse({ count: 500 }).success).toBe(true);
  });
  it("ปฏิเสธ count นอกช่วงหรือไม่ใช่จำนวนเต็ม", () => {
    expect(generateCodesSchema.safeParse({ count: 0 }).success).toBe(false);
    expect(generateCodesSchema.safeParse({ count: 501 }).success).toBe(false);
    expect(generateCodesSchema.safeParse({ count: 2.5 }).success).toBe(false);
  });
});
