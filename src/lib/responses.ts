import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "./questions";
import type { SurveyPayload } from "./validation";

export type AnswerRow = { questionKey: string; value: number | null; text: string | null };

export function toAnswerRows(payload: SurveyPayload): AnswerRow[] {
  const rows: AnswerRow[] = [];
  for (const k of LIKERT_KEYS) rows.push({ questionKey: k, value: payload.likert[k], text: null });
  for (const k of SUS_KEYS) rows.push({ questionKey: k, value: payload.sus[k], text: null });
  for (const k of OPEN_KEYS) {
    const t = (payload.open?.[k] ?? "").trim();
    if (t) rows.push({ questionKey: k, value: null, text: t });
  }
  return rows;
}
