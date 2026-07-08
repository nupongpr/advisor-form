import { describe, it, expect } from "vitest";
import { scoreSus } from "./sus";

const build = (vals: number[]) => Object.fromEntries(vals.map((v, i) => [`sus_${i + 1}`, v]));

describe("scoreSus (Brooke)", () => {
  it("ข้อคี่=5 ข้อคู่=1 → 100 (เต็ม)", () => expect(scoreSus(build([5,1,5,1,5,1,5,1,5,1]))).toBe(100));
  it("ข้อคี่=1 ข้อคู่=5 → 0", () => expect(scoreSus(build([1,5,1,5,1,5,1,5,1,5]))).toBe(0));
  it("ตอบ 3 ทุกข้อ → 50", () => expect(scoreSus(build([3,3,3,3,3,3,3,3,3,3]))).toBe(50));
  it("ตอบ 5 ทุกข้อ → 50 (ข้อคู่เชิงลบ)", () => expect(scoreSus(build([5,5,5,5,5,5,5,5,5,5]))).toBe(50));
  it("คีย์ไม่ครบ 10 → throw", () => expect(() => scoreSus({ sus_1: 5 })).toThrow());
});
