import { z } from "zod";
import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "./questions";

const scale = z.number().int().min(1).max(5);

const requiredScaleMap = (keys: string[]) =>
  z.object(Object.fromEntries(keys.map((k) => [k, scale])) as Record<string, typeof scale>).strict();

const openMap = z
  .object(Object.fromEntries(OPEN_KEYS.map((k) => [k, z.string().max(2000).default("")])))
  .partial();

export const surveyPayloadSchema = z.object({
  code: z.string().trim().min(1, "กรุณากรอกโค้ด").max(64),
  role: z.enum(["student", "advisor", "committee"]),
  ageBand: z.enum(["<40", "41-50", "51-60", ">60"]),
  field: z.string().trim().max(200).optional(),
  experience: z.string().trim().max(200).optional(),
  likert: requiredScaleMap(LIKERT_KEYS),
  sus: requiredScaleMap(SUS_KEYS),
  open: openMap.optional(),
});

export type SurveyPayload = z.infer<typeof surveyPayloadSchema>;
