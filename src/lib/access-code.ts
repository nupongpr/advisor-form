import { randomInt } from "node:crypto";
import { z } from "zod";

// 8-char codes; alphabet excludes ambiguous 0 O 1 I L
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 8;

export function generateCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

export function generateCodes(count: number, existing: Set<string> = new Set()): string[] {
  const made = new Set<string>();
  while (made.size < count) {
    const c = generateCode();
    if (!existing.has(c) && !made.has(c)) made.add(c);
  }
  return [...made];
}

export function isCodeUsable(record: { active: boolean } | null | undefined): boolean {
  return !!record && record.active;
}

export const generateCodesSchema = z.object({ count: z.number().int().min(1).max(500) });
export const verifyCodeSchema = z.object({ code: z.string().trim().min(1).max(64) });
