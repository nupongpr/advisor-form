import { describe, it, expect } from "vitest";
import { mean } from "./stats";

describe("mean", () => {
  it("เฉลี่ยปกติ", () => expect(mean([2, 4])).toBe(3));
  it("อาเรย์ว่าง → 0", () => expect(mean([])).toBe(0));
});
