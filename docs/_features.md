# Features & Work Checklist — EXP002 "ThesisFlow" evaluation form

A living checklist of what the app does and what's been built. Source instrument:
`docs/2569-EXP002_rv1_instr.pdf` (the web form digitizes **pages 13–15**). UI language: Thai.

Legend: `[x]` done & verified · `[~]` done, live-DB apply pending · `[ ]` not started

---

## 1. Respondent survey (`/survey`, wizard)

- [x] Landing page collects respondent **code**; wizard gated on code (`use-survey-draft.ts`, localStorage draft)
- [x] 8-step wizard with progress bar (`src/components/survey/survey-wizard.tsx`)
- [x] **Step 0 — ข้อมูลทั่วไป**: role + usage frequency (both required to advance)
- [x] **Steps 1–4 — Likert** (4 sections, 18 items), 5-point scale via `ScaleField`
- [x] **Step 5 — open-ended** (3 free-text)
- [x] **Step 6 — SUS** (10 items), agree/disagree anchors
- [x] **Step 7 — review & submit** (one-time submit → `POST /api/responses` → `/thank-you`)
- [x] Client resumes from a saved draft (localStorage `thesis-form-draft`)

## 2. Instrument content (`src/lib/questions.ts`) — real Thai from the PDF

- [x] **18 Likert items** transcribed from PDF pp.13–14 (`sq`×5, `wf`×5, `pu`×5, `ss`×3)
- [x] **4 section titles** match the PDF's ด้านที่ 1–4 headings
- [x] **3 open-ended** questions (PDF p.14, ส่วนที่ 3)
- [x] **10 SUS items** Thai wording matches PDF p.15 exactly (English kept alongside)
- [x] Likert anchors = มากที่สุด/น้อยที่สุด; **SUS anchors = เห็นด้วยอย่างยิ่ง/ไม่เห็นด้วยอย่างยิ่ง**
      (`ScaleField` takes optional `lowLabel`/`highLabel`)

## 3. Demographics (questionnaire ส่วนที่ 1) — aligned to the PDF

- [x] **role**: นักศึกษา / อาจารย์ที่ปรึกษา / เจ้าหน้าที่บัณฑิตศึกษา (`student`/`advisor`/`staff`)
- [x] **frequency**: ทุกวัน / 1-2 ครั้ง/สัปดาห์ / 1-2 ครั้ง/เดือน / น้อยกว่าเดือนละครั้ง
- [x] Removed the non-questionnaire fields (`ageBand`, `field`, `experience`) from UI, payload, schema, CSV, admin

## 4. Scoring & validation

- [x] SUS scored with Brooke's formula → 0–100 (`src/lib/sus.ts`)
- [x] Zod payload validation, keys/counts derived from `questions.ts` (`src/lib/validation.ts`)
- [x] `role` + `frequency` are required enums

## 5. Admin (`/admin`, cookie session)

- [x] Login / logout, auth gate via `src/proxy.ts` (Next 16 middleware)
- [x] Dashboard: totals, avg SUS, role breakdown, per-item Likert averages, responses table
- [x] Response detail page (role, frequency, SUS score, all answers)
- [x] CSV export with UTF-8 BOM (`/api/admin/export`) — columns: id, code, role, frequency, susScore, createdAt, + all answer keys

## 6. Access control — admin-issued codes

- [x] `AccessCode` table (code unique, active flag); migration `20260708134659_add_access_code`
- [x] Respondents must enter a valid, **active** admin-issued code — checked at the landing page
      (`POST /api/verify-code`, public) and enforced server-side on submit (`POST /api/responses` → 403)
- [x] Codes are case-insensitive on entry (normalized/stored uppercase), reusable while active
- [x] Admin page `/admin/codes`: generate random 8-char batches, copy-all, list, activate/deactivate
      (`GET`/`POST /api/admin/codes`, `PATCH /api/admin/codes/[id]`)
- [x] Pure gen/validate lib `src/lib/access-code.ts` + 7 unit tests; live E2E 16/16 green

## 7. Data / infrastructure

- [x] Prisma 7 + PostgreSQL (Neon) via `@prisma/adapter-pg`; `Response` + `Answer` + `AccessCode` tables
- [x] Migrations applied to Neon: `20260708072743_init`, `20260708085135_align_demographics_role_frequency`,
      `20260708134659_add_access_code`
- [x] No Server Actions — API route handlers only

## 8. Verification

- [x] `npx vitest run` → **35/35 pass** (28 instrument + 7 access-code)
- [x] `npx tsc --noEmit` → clean
- [x] `npm run lint` → clean
- [x] `npm run build` → succeeds
- [x] UI walkthrough (Playwright) of every wizard step — Thai copy, demographics, SUS anchors correct
- [x] Access-codes live E2E 16/16 (generate → verify → toggle → submit gate 403/201 → CSV) + landing-gate UI
- [x] Live DB migrations applied to Neon; test data cleaned up (DB pristine)

## 9. Pending

- [ ] **Vercel deploy** — import repo (Root Directory = default) + set env vars
      (`DATABASE_URL`, `ADMIN_PASSWORD`, `COOKIE_SECRET`) in the Vercel dashboard.
      Note: the build runs `next build` only (no auto-migrate) — both migrations are already applied to Neon.
- [ ] **Operational:** an admin must generate at least one code batch (`/admin/codes`) before anyone
      can take the survey — otherwise the landing page rejects every code.
