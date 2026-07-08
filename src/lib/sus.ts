import { SUS_KEYS } from "./questions";

/** คิดคะแนน SUS สูตร Brooke: ข้อคี่ = ค่า−1, ข้อคู่ = 5−ค่า, รวม ×2.5 → 0–100 */
export function scoreSus(answers: Record<string, number>): number {
  let sum = 0;
  for (let i = 0; i < SUS_KEYS.length; i++) {
    const v = answers[SUS_KEYS[i]];
    if (typeof v !== "number" || v < 1 || v > 5) {
      throw new Error(`SUS answer missing/invalid for ${SUS_KEYS[i]}`);
    }
    sum += (i + 1) % 2 === 1 ? v - 1 : 5 - v;
  }
  return sum * 2.5;
}
