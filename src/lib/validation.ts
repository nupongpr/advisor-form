import { z } from "zod";
import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "./questions";

const scale = z.number().int().min(1).max(5);

const requiredScaleMap = (keys: string[]) =>
  z.object(Object.fromEntries(keys.map((k) => [k, scale])) as Record<string, typeof scale>).strict();

const openMap = z
  .object(Object.fromEntries(OPEN_KEYS.map((k) => [k, z.string().max(2000).default("")])))
  .partial();

export const surveyPayloadSchema = z.object({
  role: z.enum(["student", "advisor", "staff"]),
  frequency: z.enum(["daily", "weekly", "monthly", "rarely"]),
  // UI language the respondent used; defaults to Thai when omitted (older clients).
  language: z.enum(["th", "en"]).default("th"),
  likert: requiredScaleMap(LIKERT_KEYS),
  sus: requiredScaleMap(SUS_KEYS),
  open: openMap.optional(),
  // honeypot: real users leave this empty; bots that fill it fail validation.
  website: z.string().max(0).optional(),
});

export type SurveyPayload = z.infer<typeof surveyPayloadSchema>;
