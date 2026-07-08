"use client";
import { useCallback, useEffect, useState } from "react";

export type SurveyDraft = {
  code: string; role?: string; frequency?: string;
  likert: Record<string, number>; sus: Record<string, number>; open: Record<string, string>;
};

const KEY = "thesis-form-draft";
const empty: SurveyDraft = { code: "", likert: {}, sus: {}, open: {} };

export function useSurveyDraft() {
  const [draft, setDraft] = useState<SurveyDraft>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDraft({ ...empty, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(draft));
  }, [draft, loaded]);

  const setField = useCallback((k: keyof SurveyDraft, v: string) => setDraft((d) => ({ ...d, [k]: v })), []);
  const setLikert = useCallback((k: string, v: number) => setDraft((d) => ({ ...d, likert: { ...d.likert, [k]: v } })), []);
  const setSus = useCallback((k: string, v: number) => setDraft((d) => ({ ...d, sus: { ...d.sus, [k]: v } })), []);
  const setOpen = useCallback((k: string, v: string) => setDraft((d) => ({ ...d, open: { ...d.open, [k]: v } })), []);
  const reset = useCallback(() => { localStorage.removeItem(KEY); setDraft(empty); }, []);

  return { draft, loaded, setField, setLikert, setSus, setOpen, reset };
}
