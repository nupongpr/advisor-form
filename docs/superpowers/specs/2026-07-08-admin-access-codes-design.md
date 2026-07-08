# Admin-issued access codes — design

**Date:** 2026-07-08 · **App:** advisor-form (EXP002 "ThesisFlow" evaluation form)

## Context & motivation

Today the survey has no real access control. The landing page ([src/app/page.tsx](../../../src/app/page.tsx))
collects a "รหัสผู้ตอบ" (code) but only checks it is non-empty — any typed string (`abc`, `123`)
lets the respondent into `/survey`, and the submit path ([src/app/api/responses/route.ts](../../../src/app/api/responses/route.ts))
accepts any `code` of 1–64 chars. The `code` is stored on `Response` as free text; nothing validates
it against a list. The landing copy already says "กรุณากรอกรหัส (โค้ด) ที่ได้รับ", implying codes are
*meant* to be issued — but that is not enforced.

We want only people holding a code **issued by an admin** to be able to take the survey.

## Goals / non-goals

**Goal (only):** restrict access — a valid, active, admin-issued code is required to enter and to
submit; random/guessed codes are rejected.

**Non-goals** (explicitly out of scope, confirmed with owner):
- Not single-use / no duplicate-submission prevention — a code is reusable while active.
- Not respondent identification / tracking — codes are anonymous, not tied to a person.
- Not role-derived-from-code — `role` remains a field the respondent picks in the survey.

## Decisions (confirmed)

- Admin **generates codes in batches** (random). No manual per-code entry needed.
- Codes are **reusable while `active`**; admin can toggle a code **active ↔ inactive**. Deactivating
  a code blocks further use.
- Enforcement at **two points**: landing (UX) + submit (security).

## Data model

New Prisma model (does **not** touch `Response`; `Response.code` stays a plain string):

```prisma
model AccessCode {
  id        String   @id @default(cuid())
  code      String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

- `code` is unique (DB-enforced) and indexed via the unique constraint.
- Kept intentionally minimal (no label/note, no per-code metadata) per owner review.

## User flows

**Respondent (landing → survey):**
1. Enter code on `/`, click "เริ่มทำแบบประเมิน".
2. Client calls `POST /api/verify-code` with `{ code }`.
3. `valid: true` → proceed to `/survey` (code kept in the localStorage draft as today).
   `valid: false` → show inline error "รหัสไม่ถูกต้องหรือถูกปิดใช้งาน"; stay on the page.
4. Button shows a brief loading state during the check.

**Respondent (submit):**
- `POST /api/responses` re-checks the submitted `code` is an existing **active** `AccessCode` before
  saving. If not → `403` (client shows the existing "ส่งไม่สำเร็จ" toast, or a specific message). This
  is the real gate — it cannot be bypassed from the client.

**Admin (manage codes):**
1. From the dashboard, open `/admin/codes`.
2. Enter a count, click "สร้างโค้ด" → N random codes are created and shown, with a
   "คัดลอกทั้งหมด" button to hand them out.
3. Table lists all codes: code · active toggle · createdAt.
4. Toggle a code active/inactive as needed.

## API endpoints

| Method + path | auth | behaviour |
|---|---|---|
| `POST /api/verify-code` | public | body `{ code }` → `{ valid: boolean }`; valid = exists AND `active` |
| `POST /api/admin/codes` | admin | body `{ count }` → generate `count` unique random codes, return them |
| `GET /api/admin/codes` | admin | list all codes |
| `PATCH /api/admin/codes/[id]` | admin | body `{ active }` → toggle a code active/inactive |

- `/api/admin/*` is already protected by the cookie-session middleware ([src/proxy.ts](../../../src/proxy.ts),
  matcher `"/api/admin/:path*"`). New admin endpoints inherit that protection automatically.
- `/api/verify-code` is intentionally **public** (respondents are anonymous). It must NOT live under
  `/api/admin`.
- `count` is bounded (e.g. 1–500) to avoid abuse/accidents.

## Admin UI

New page `src/app/admin/codes/page.tsx`, linked from the dashboard header
([src/app/admin/page.tsx](../../../src/app/admin/page.tsx)):
- **Generate** form: number input (count) + "สร้างโค้ด" button; on success shows the freshly
  generated codes and a "คัดลอกทั้งหมด" (copy-all) button.
- **List** table: code, status toggle (active/inactive), created date.
- Follows existing shadcn/ui + DESIGN.md styling (Card/Table/Badge/Button as elsewhere in admin).

## Code generation

- Length **8**, from an unambiguous alphabet excluding `0 O 1 I L` (e.g.
  `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, 30 symbols → ~30⁸ ≈ 6.5×10¹¹ space).
- Generated with Node `crypto` (no new dependency); check each against the DB and regenerate on the
  (rare) collision, or rely on the `@unique` constraint + retry.
- A small pure helper (e.g. `src/lib/access-code.ts`) holds generation + a `verifyCode(code)` lookup so
  it is unit-testable in isolation.

## Security considerations

- **Submit-side check is the real gate** — the landing check is UX only and can be bypassed.
- `/api/verify-code` is unauthenticated and reveals code validity, so it is theoretically brute-forceable;
  the 8-char random space makes this impractical for this low-stakes survey. **Optional:** light
  rate-limiting on `/api/verify-code` (deferred unless the owner wants it).
- Generated codes are returned to the admin once at creation (and visible in the list), consistent with
  their anonymous, reusable nature.

## Migration

- Additive migration: `CREATE TABLE "AccessCode"` (+ unique index on `code`). Non-destructive; safe on
  the live Neon DB. Apply with `npx prisma migrate deploy` (also runs on Vercel build). Regenerate the
  client with `prisma generate` (runs via `postinstall`).

## Testing (Vitest)

- `generateCode()` — correct length, only allowed alphabet, produces distinct values across many calls.
- `verifyCode(code)` — true for an existing active code; false for inactive; false for non-existent.
- Submit rejection — `POST /api/responses` (or its validation/guard unit) rejects a code that is
  missing/inactive.
- Existing 28 tests must still pass; `tsc`, `lint`, `build` green.

## Behavior change / rollout

- After this ships, respondents need an admin-issued code; there are currently **0 responses**, so
  there is no backward-compat concern.
- **Admin must generate at least one batch before anyone can take the survey.** Worth a one-line note
  in the admin UI / handoff.

## Out of scope (cut per owner review)

- `note`/label field, times-used column, delete-a-code, rate-limiting, code expiry, per-code role.
  None are built. `active`/`inactive` toggle is the only lifecycle control.
