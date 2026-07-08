@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status: this repo IS the EXP002 app

This repository **is** the EXP002 "ThesisFlow" evaluation form — a **Next.js 16** project
(App Router, `src/` dir, React 19, Tailwind v4) at the repo root. Deployed on **Vercel** from
`https://github.com/nupongpr/advisor-form` (branch `main`).

- Spec, plan, design system, and the source PDF are under **`docs/`**:
  - `docs/superpowers/specs/2026-07-08-thesis-form-exp002-design.md`
  - `docs/superpowers/plans/2026-07-08-thesis-form.md`
  - `docs/DESIGN.md` — **authoritative design system** (violet #6b44b7 palette, IBM Plex
    Sans Thai type scale, spacing/shape, component rules). The globals.css theme + component
    styling derive from this; if styling questions arise, DESIGN.md wins.
  - `docs/2569-EXP002_rv1_instr.pdf`
- `AGENTS.md` warns: **Next.js 16 has breaking changes** — read `node_modules/next/dist/docs/`
  before writing code. Key ones: middleware → `src/proxy.ts` (function `proxy`),
  `cookies()`/`headers()`/`params` are async (`await`), Turbopack default, `next lint` removed.
- Stack in use: Next.js 16 + Prisma 7/**PostgreSQL (NeonDB)** + shadcn/ui (Tailwind v4) +
  react-hook-form/zod + Vitest. Data collection uses API route handlers only (no Server Actions).
  Prisma 7 uses the `prisma-client` generator (output `src/generated/prisma`, git-ignored;
  `postinstall: prisma generate` regenerates it on Vercel). Client is imported from
  `@/generated/prisma/client` through the `@prisma/adapter-pg` driver adapter (`src/lib/prisma.ts`).

## Deploy / environment

- **Neon DB**: committed migrations in `prisma/migrations/` — `20260708072743_init`, then
  `20260708085135_align_demographics_role_frequency` (demographics → `role` + `frequency`; drops the
  old `ageBand`/`field`/`experience`). `prisma migrate deploy` applies pending migrations on Vercel
  builds, or run it locally against Neon (warm the DB first — see P1001 note). Tables: `Response` +
  `Answer`.
- Env vars — set in **Vercel → Settings → Environment Variables** (local `.env` is git-ignored):
  `DATABASE_URL` (Neon), `ADMIN_PASSWORD`, `COOKIE_SECRET`. Local `.env` still holds placeholder
  `change-me-...` for the last two — use real values in production.
- Vercel **Root Directory = default** (this repo root is the app).
- Neon gotcha: `prisma migrate` may report **P1001 "can't reach database server"** — that is usually
  just Neon's ~48s cold-start exceeding the schema engine's short connect timeout, **not** a real
  failure. Warm the DB first with a plain `pg` connect, or verify state with `pg` — the DB is already
  migrated, so no migrate command is normally needed. Prisma 7.8 config has no adapter field, so
  migrations cannot be routed through node-postgres.

## What this app is

This app digitizes **EXP002 rev.1** — a Thai questionnaire + usability instrument used to
evaluate **"ThesisFlow"** (aka "Thesis Navigator" / "Thesis Flow System"), an AI-assisted graduate-
thesis management platform. Respondents — **students, advisors, or graduate-studies staff**
(นักศึกษา / อาจารย์ที่ปรึกษา / เจ้าหน้าที่บัณฑิตศึกษา) — rate ThesisFlow after using it. This web
form replaces the paper instrument.

### ThesisFlow domain (what the questions refer to)

ThesisFlow guides a thesis through a **7-stage research workflow (P1–P7)**:

- **P1** — AI-assisted Literature Synthesis
- **P2** — Proposal development
- **P3** — Proposal review / approval
- **P4** — Ethics: Ethical Red Flag Detection + Instrument Generator
- **P5** — Data collection
- **P6** — AI-assisted analysis
- **P7** — Writing / defense

(P1, P4, P6 labels are explicit in the PDF; P2/P3/P5/P7 are inferred from context — confirm exact
wording against the PDF.) Platform features the questions reference: Progress Dashboard, Thesis
Navigator, Early-warning report (risk of delay), Benchmark report, Exit report, learning-trajectory
tracking (pre/post skills self-assessment, reflection log, feedback log), and a document repository
(Topic approval form, Proposal, IRB/EC, Questionnaire/Interview guide, Progress report, Supervision
log, Turnitin/Similarity report).

### Instrument structure (what the form implements)

1. **Respondent info / demographics** (questionnaire ส่วนที่ 1) — **role** (นักศึกษา / อาจารย์ที่ปรึกษา /
   เจ้าหน้าที่บัณฑิตศึกษา) + **usage frequency** (ทุกวัน / 1-2 ครั้ง/สัปดาห์ / 1-2 ครั้ง/เดือน /
   น้อยกว่าเดือนละครั้ง). Both required. (The PDF's per-role record forms on pp.1–3 also carry age
   bands, but this web form intentionally collects only the questionnaire's two fields.)
2. **Likert questionnaire**, 5-point (5 = มากที่สุด … 1 = น้อยที่สุด), four sections:
   - System Quality & Usability (5 items)
   - Workflow & Functionality (5 items)
   - Perceived Usefulness (5 items)
   - Support Service (3 items)
3. **Open-ended** — 3 free-text questions.
4. **System Usability Scale (SUS)** — the standard 10 items, 5-point, alternating positive/negative
   wording, with agree/disagree anchors (5 = เห็นด้วยอย่างยิ่ง … 1 = ไม่เห็นด้วยอย่างยิ่ง; the Likert
   sections keep the มากที่สุด/น้อยที่สุด anchors). Score with Brooke's formula → 0–100 (odd items:
   value − 1; even items: 5 − value; sum × 2.5). The PDF carries the canonical English text alongside
   the Thai for each item.

UI language is **Thai**; keep Thai as the source-of-truth copy.

## The spec PDF is the source of truth (and it doesn't extract cleanly)

Exact Thai wording for every question lives **only** in `docs/2569-EXP002_rv1_instr.pdf` — its Thai
font has no Unicode mapping, so text extraction drops all Thai. Recover the Latin/structural skeleton:

```
# structural/Latin skeleton only (Thai drops out):
pdftotext -layout docs/2569-EXP002_rv1_instr.pdf -
# real Thai copy — render pages to images and read them visually (poppler installed via winget):
pdftoppm -png -r 200 docs/2569-EXP002_rv1_instr.pdf out/page   # then open out/page-*.png
```

For actual Thai question copy, read the PDF **visually** (render to PNG as above — the embedded Thai
font renders fine even though text extraction fails — or get the text from the project owner); do
not reconstruct Thai wording from the extracted skeleton. The web form digitizes **pages 13–15**
(satisfaction questionnaire + SUS); pages 1–12 are separate record forms, interview guides, and a
before/after timing table.

**Done:** all questionnaire copy in `src/lib/questions.ts` is now the real Thai transcribed from the
PDF — the 18 Likert items, 3 open-ended, 10 SUS items, and the four section titles (pages 13–15).

## Commands

- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`
- Tests: `npm test` (Vitest) — single file: `npx vitest run <file>`
