import { describe, it, expect } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("หัวตาราง + แถว", () => expect(toCsv(["a", "b"], [[1, "x"]])).toBe("a,b\r\n1,x"));
  it("escape comma/quote", () => {
    expect(toCsv(["a"], [["x,y"]])).toBe('a\r\n"x,y"');
    expect(toCsv(["a"], [['he said "hi"']])).toBe('a\r\n"he said ""hi"""');
  });
  it("guards against CSV formula injection", () => {
    expect(toCsv(["a"], [["=1+1"]])).toBe("a\r\n'=1+1");
  });
});
