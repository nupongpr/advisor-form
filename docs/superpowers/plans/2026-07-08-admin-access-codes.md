# Admin-issued Access Codes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a valid, active, admin-issued code to take the survey; give admins a page to generate batches of random codes and activate/deactivate them.

**Architecture:** New `AccessCode` Prisma table. A public `POST /api/verify-code` gates the landing page (UX); `POST /api/responses` re-checks the code server-side (the real gate). Admin CRUD lives under the already-auth-protected `/api/admin/codes*` with a `/admin/codes` UI page. Pure code-generation/validation logic sits in `src/lib/access-code.ts` (unit-tested); routes/UI are verified with curl + Playwright, matching this repo's existing test strategy (pure libs unit-tested, routes verified live).

**Tech Stack:** Next.js 16 (App Router, route handlers), Prisma 7 + PostgreSQL (Neon) via `@prisma/adapter-pg`, zod, shadcn/ui (base-ui, Tailwind v4), sonner (toasts), Vitest.

## Global Constraints

Copied from the spec + repo conventions (AGENTS.md / CLAUDE.md). Every task implicitly includes these:

- **Next.js 16 differs from training data** — read `node_modules/next/dist/docs/` before writing Next code. `params`/`cookies()`/`headers()` are **async** (`await params`). Middleware lives in `src/proxy.ts` (fn `proxy`). Turbopack default. `next lint` removed (`npm run lint` = `eslint`).
- **Data collection = API route handlers only. No Server Actions.**
- **shadcn here is base-ui, not Radix:** checked state = `data-checked`; `<Button>` has no `asChild` (use `buttonVariants()` + `<Link>`/`<a>`); `<Select>` needs an `items` prop.
- **Prisma 7:** client imported from `@/generated/prisma/client` through `@prisma/adapter-pg` (`src/lib/prisma.ts`, exported `prisma`). Generated client is git-ignored; run `npx prisma generate` after schema edits. Apply migrations with `npx prisma migrate deploy` (Neon may throw **P1001** on cold start — warm with a `pg` connect first; it's not a real failure).
- **UI language is Thai**; keep Thai as source-of-truth copy.
- **Do not break existing tests** — `npx vitest run` is green at 28/28; `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass. Keep them green.
- **Access-code rules:** codes are random, 8 chars, alphabet excludes `0 O 1 I L`. Reusable while `active`; admin toggles `active`↔`inactive`. No single-use, no note/label, no delete, no times-used, no per-code role (all explicitly out of scope).

---

### Task 1: AccessCode table + migration + client regen

**Files:**
- Modify: `prisma/schema.prisma` (add model, after the `Answer` model)
- Create: `prisma/migrations/<timestamp>_add_access_code/migration.sql`
- Regenerate: `src/generated/prisma/**` (via `prisma generate`, git-ignored — not hand-edited)

**Interfaces:**
- Produces: Prisma model `AccessCode { id, code (unique), active, createdAt }`, available at runtime as `prisma.accessCode`.

- [ ] **Step 1: Add the model to the schema**

Append to `prisma/schema.prisma`:

```prisma
model AccessCode {
  id        String   @id @default(cuid())
  code      String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Create the migration folder + SQL**

Run (Git Bash):
```bash
cd "c:/@Projects/thesis-form/advisor-form"
TS=$(date -u +%Y%m%d%H%M%S)
mkdir -p "prisma/migrations/${TS}_add_access_code"
echo "created prisma/migrations/${TS}_add_access_code"
```
Write the SQL to that new folder's `migration.sql`:
```sql
-- CreateTable
CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");
```

- [ ] **Step 3: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: `✔ Generated Prisma Client ... to .\src\generated\prisma`

- [ ] **Step 4: Apply the migration to Neon**

Warm Neon first to avoid P1001 (create `scratch-warm.js` or reuse a `pg` connect), then:
Run: `npx prisma migrate deploy`
Expected: `Applying migration ..._add_access_code` then `All migrations have been successfully applied.`
Note: this writes to the live DB — the CREATE TABLE is **additive/non-destructive**. If auto-mode/permissions block it, the human runs it (or it runs on the next Vercel build). It does NOT block later tasks' typechecking (the regenerated client from Step 3 is enough for `tsc`); only the live runtime E2E in Task 8 needs the table present.

- [ ] **Step 5: Verify typecheck still green**

Run: `npx tsc --noEmit`
Expected: no output, exit 0.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add AccessCode table + migration"
```

---

### Task 2: Access-code library (generation + validation) — TDD

**Files:**
- Create: `src/lib/access-code.ts`
- Test: `src/lib/access-code.test.ts`

**Interfaces:**
- Produces:
  - `CODE_ALPHABET: string`, `CODE_LENGTH: number`
  - `generateCode(): string`
  - `generateCodes(count: number, existing?: Set<string>): string[]`
  - `isCodeUsable(record: { active: boolean } | null | undefined): boolean`
  - `generateCodesSchema` (zod: `{ count: 1..500 int }`), `verifyCodeSchema` (zod: `{ code: string 1..64 }`)

- [ ] **Step 1: Write the failing tests**

Create `src/lib/access-code.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  CODE_ALPHABET, CODE_LENGTH, generateCode, generateCodes, isCodeUsable,
  generateCodesSchema,
} from "./access-code";

describe("generateCode", () => {
  it("มีความยาวตามกำหนดและใช้เฉพาะตัวอักษรที่อนุญาต", () => {
    for (let i = 0; i < 200; i++) {
      const c = generateCode();
      expect(c).toHaveLength(CODE_LENGTH);
      expect([...c].every((ch) => CODE_ALPHABET.includes(ch))).toBe(true);
    }
  });
  it("ไม่มีตัวอักษรกำกวม 0 O 1 I L", () => {
    expect(/[0O1IL]/.test(CODE_ALPHABET)).toBe(false);
  });
});

describe("generateCodes", () => {
  it("คืนโค้ดไม่ซ้ำตามจำนวนที่ขอ", () => {
    const codes = generateCodes(50);
    expect(codes).toHaveLength(50);
    expect(new Set(codes).size).toBe(50);
  });
  it("ไม่ชนกับโค้ดที่มีอยู่แล้ว", () => {
    const existing = new Set(generateCodes(10));
    const more = generateCodes(10, existing);
    expect(more.some((c) => existing.has(c))).toBe(false);
  });
});

describe("isCodeUsable", () => {
  it("true เฉพาะเมื่อมี record และ active", () => {
    expect(isCodeUsable({ active: true })).toBe(true);
    expect(isCodeUsable({ active: false })).toBe(false);
    expect(isCodeUsable(null)).toBe(false);
    expect(isCodeUsable(undefined)).toBe(false);
  });
});

describe("generateCodesSchema", () => {
  it("รับ count ที่ถูกต้อง (1..500 จำนวนเต็ม)", () => {
    expect(generateCodesSchema.safeParse({ count: 1 }).success).toBe(true);
    expect(generateCodesSchema.safeParse({ count: 500 }).success).toBe(true);
  });
  it("ปฏิเสธ count นอกช่วงหรือไม่ใช่จำนวนเต็ม", () => {
    expect(generateCodesSchema.safeParse({ count: 0 }).success).toBe(false);
    expect(generateCodesSchema.safeParse({ count: 501 }).success).toBe(false);
    expect(generateCodesSchema.safeParse({ count: 2.5 }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/access-code.test.ts`
Expected: FAIL — `Failed to resolve import "./access-code"` (module does not exist yet).

- [ ] **Step 3: Implement the library**

Create `src/lib/access-code.ts`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/access-code.test.ts`
Expected: PASS (all specs green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/access-code.ts src/lib/access-code.test.ts
git commit -m "feat: access-code generation + validation helpers"
```

---

### Task 3: Public verify-code endpoint

**Files:**
- Create: `src/app/api/verify-code/route.ts`

**Interfaces:**
- Consumes: `prisma` (`@/lib/prisma`), `verifyCodeSchema`, `isCodeUsable` (`@/lib/access-code`)
- Produces: `POST /api/verify-code` with body `{ code: string }` → `{ valid: boolean }` (HTTP 200). Public (NOT under `/api/admin`, so the middleware matcher ignores it).

- [ ] **Step 1: Implement the route**

Create `src/app/api/verify-code/route.ts`:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeSchema, isCodeUsable } from "@/lib/access-code";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false });

  const record = await prisma.accessCode.findUnique({ where: { code: parsed.data.code } });
  return NextResponse.json({ valid: isCodeUsable(record) });
}
```

- [ ] **Step 2: Verify with curl (needs Task 1 migration applied + a code)**

Start dev server: `PORT=3100 npm run dev` (background). Insert a test code and probe:
```bash
# create one active code directly for the test, then verify it:
node -e "const {Client}=require('pg');const fs=require('fs');const u=fs.readFileSync('.env','utf8').match(/DATABASE_URL\s*=\s*\"?([^\"\r\n]+)/)[1];const c=new Client({connectionString:u,connectionTimeoutMillis:70000});(async()=>{await c.connect();await c.query(\"INSERT INTO \\\"AccessCode\\\"(id,code,active) VALUES ('t_ok','TESTOK22',true) ON CONFLICT (code) DO NOTHING\");await c.query(\"INSERT INTO \\\"AccessCode\\\"(id,code,active) VALUES ('t_off','TESTOFF3',false) ON CONFLICT (code) DO NOTHING\");await c.end();console.log('seeded');})()"
curl -s -X POST localhost:3100/api/verify-code -H "Content-Type: application/json" -d '{"code":"TESTOK22"}'   # expect {"valid":true}
curl -s -X POST localhost:3100/api/verify-code -H "Content-Type: application/json" -d '{"code":"TESTOFF3"}'   # expect {"valid":false}
curl -s -X POST localhost:3100/api/verify-code -H "Content-Type: application/json" -d '{"code":"NOPE9999"}'   # expect {"valid":false}
```
Expected: `{"valid":true}`, `{"valid":false}`, `{"valid":false}`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/verify-code/route.ts
git commit -m "feat(api): public verify-code endpoint"
```

---

### Task 4: Landing page gates on verify-code

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `POST /api/verify-code` (Task 3).

- [ ] **Step 1: Rewrite the landing interaction to verify before navigating**

Replace the body of `src/app/page.tsx` (keep imports; add `useState` usage) so the button calls verify-code:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSurveyDraft } from "@/lib/use-survey-draft";

export default function Home() {
  const router = useRouter();
  const { draft, setField } = useSurveyDraft();
  const [touched, setTouched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const code = draft.code.trim();

  async function start() {
    if (!code) { setTouched(true); return; }
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) router.push("/survey");
      else setError("รหัสไม่ถูกต้องหรือถูกปิดใช้งาน");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-200 flex-col justify-center px-4 py-10 sm:px-6">
      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">แบบประเมินระบบ ThesisFlow</CardTitle>
          <CardDescription className="leading-relaxed">
            กรุณากรอกรหัส (โค้ด) ที่ได้รับ เพื่อเริ่มทำแบบประเมิน ใช้เวลาประมาณ 10–15 นาที
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">รหัสผู้ตอบ</Label>
            <Input
              id="code"
              value={draft.code}
              onChange={(e) => { setField("code", e.target.value); setError(""); }}
              placeholder="เช่น S01"
              autoComplete="off"
              className="focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            />
            {touched && !code && <p className="text-sm text-destructive">กรุณากรอกรหัส</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button className="w-full" disabled={checking} onClick={start}>
            {checking ? "กำลังตรวจสอบ…" : "เริ่มทำแบบประเมิน"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Verify with Playwright**

With dev server + seeded codes from Task 3 running: navigate to `http://localhost:3100/`, type `NOPE9999`, click "เริ่มทำแบบประเมิน" → expect the error text "รหัสไม่ถูกต้องหรือถูกปิดใช้งาน" and URL still `/`. Then clear, type `TESTOK22`, click → expect navigation to `/survey`.

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` (expect clean), then:
```bash
git add src/app/page.tsx
git commit -m "feat: gate landing page on verify-code"
```

---

### Task 5: Submit-side enforcement in POST /api/responses

**Files:**
- Modify: `src/app/api/responses/route.ts` (inside `POST`, after payload parse, before `prisma.response.create`)

**Interfaces:**
- Consumes: `isCodeUsable` (`@/lib/access-code`), `prisma`.

- [ ] **Step 1: Add the import**

At the top of `src/app/api/responses/route.ts`, add:
```ts
import { isCodeUsable } from "@/lib/access-code";
```

- [ ] **Step 2: Enforce the code before saving**

Immediately after `const p = parsed.data;` and before the `let created;` block, insert:
```ts
  const codeRecord = await prisma.accessCode.findUnique({ where: { code: p.code } });
  if (!isCodeUsable(codeRecord)) {
    return NextResponse.json({ error: "invalid or inactive code" }, { status: 403 });
  }
```

- [ ] **Step 3: Verify with curl**

With dev server + seeded codes running, build a minimal valid payload helper and POST. Fastest check — reuse the browser: in an authenticated-free context, POST directly:
```bash
# invalid code -> 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3100/api/responses \
  -H "Content-Type: application/json" \
  -d '{"code":"NOPE9999","role":"student","frequency":"weekly","likert":{},"sus":{},"open":{}}'
# expect 400 (validation fails first: likert/sus empty) — so test the code gate with a FULL payload instead:
```
Because the zod payload validation runs before the code check, use a complete payload to isolate the 403. Create `scratch-post.js`:
```js
const LIKERT=["sq_1","sq_2","sq_3","sq_4","sq_5","wf_1","wf_2","wf_3","wf_4","wf_5","pu_1","pu_2","pu_3","pu_4","pu_5","ss_1","ss_2","ss_3"];
const SUS=Array.from({length:10},(_,i)=>`sus_${i+1}`);
const likert=Object.fromEntries(LIKERT.map(k=>[k,4]));
const sus=Object.fromEntries(SUS.map(k=>[k,4]));
async function post(code){const r=await fetch("http://localhost:3100/api/responses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code,role:"student",frequency:"weekly",likert,sus,open:{}})});console.log(code,r.status);}
(async()=>{await post("NOPE9999");await post("TESTOFF3");await post("TESTOK22");})();
```
Run: `node scratch-post.js`
Expected: `NOPE9999 403`, `TESTOFF3 403`, `TESTOK22 201`. Then delete the `TESTOK22` response row if you want a clean DB (optional; note it's the only submit). Remove `scratch-post.js` after.

- [ ] **Step 4: Confirm existing tests still pass + commit**

Run: `npx vitest run` (expect 28/28 + the new access-code specs), `npx tsc --noEmit` (clean).
```bash
git add src/app/api/responses/route.ts
git commit -m "feat(api): reject submit with invalid or inactive access code"
```

---

### Task 6: Admin codes API (list + generate)

**Files:**
- Create: `src/app/api/admin/codes/route.ts`

**Interfaces:**
- Consumes: `prisma`, `generateCodes`, `generateCodesSchema` (`@/lib/access-code`).
- Produces:
  - `GET /api/admin/codes` → `{ codes: { id, code, active, createdAt }[] }` (newest first)
  - `POST /api/admin/codes` body `{ count }` → `{ created: string[] }` (HTTP 201)
  - Both auth-protected automatically by the middleware matcher `"/api/admin/:path*"`.

- [ ] **Step 1: Implement the route**

Create `src/app/api/admin/codes/route.ts`:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCodes, generateCodesSchema } from "@/lib/access-code";

export async function GET() {
  const codes = await prisma.accessCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = generateCodesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = new Set((await prisma.accessCode.findMany({ select: { code: true } })).map((r) => r.code));
  const created = generateCodes(parsed.data.count, existing);
  await prisma.accessCode.createMany({ data: created.map((code) => ({ code })) });

  return NextResponse.json({ created }, { status: 201 });
}
```

- [ ] **Step 2: Verify auth gate + behavior with curl**

Without a session cookie:
```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3100/api/admin/codes   # expect 401
```
Then log in to get the cookie and exercise it:
```bash
# login (uses ADMIN_PASSWORD from .env)
PW=$(node -e "const fs=require('fs');console.log((fs.readFileSync('.env','utf8').match(/ADMIN_PASSWORD\s*=\s*\"?([^\"\r\n]+)/)||[])[1]||'')")
curl -s -c cookies.txt -X POST localhost:3100/api/admin/login -H "Content-Type: application/json" -d "{\"password\":\"$PW\"}" -o /dev/null
curl -s -b cookies.txt -X POST localhost:3100/api/admin/codes -H "Content-Type: application/json" -d '{"count":3}'   # expect {"created":["...","...","..."]} 
curl -s -b cookies.txt localhost:3100/api/admin/codes | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log('count=',JSON.parse(d).codes.length))"
```
Expected: 401 unauthenticated; `{"created":[...3 codes...]}`; list count ≥ 3. Remove `cookies.txt` after.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/codes/route.ts
git commit -m "feat(api): admin list + generate access codes"
```

---

### Task 7: Admin codes toggle API (PATCH)

**Files:**
- Create: `src/app/api/admin/codes/[id]/route.ts`

**Interfaces:**
- Consumes: `prisma`.
- Produces: `PATCH /api/admin/codes/[id]` body `{ active: boolean }` → `{ code: { id, code, active, createdAt } }`. Auth-protected by matcher.

- [ ] **Step 1: Implement the route (Next 16 async params)**

Create `src/app/api/admin/codes/[id]/route.ts`:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ active: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed" }, { status: 400 });
  }
  try {
    const code = await prisma.accessCode.update({ where: { id }, data: { active: parsed.data.active } });
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
```

- [ ] **Step 2: Verify with curl**

Using the logged-in cookie and an `id` from the GET list:
```bash
ID=$(curl -s -b cookies.txt localhost:3100/api/admin/codes | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>process.stdout.write(JSON.parse(d).codes[0].id))")
curl -s -b cookies.txt -X PATCH "localhost:3100/api/admin/codes/$ID" -H "Content-Type: application/json" -d '{"active":false}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log('active=',JSON.parse(d).code.active))"
```
Expected: `active= false`. (Toggle back to `true` similarly if desired.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/codes/[id]/route.ts"
git commit -m "feat(api): toggle access code active/inactive"
```

---

### Task 8: Admin codes UI page + dashboard link

**Files:**
- Create: `src/app/admin/codes/page.tsx`
- Create: `src/components/admin/codes-manager.tsx`
- Modify: `src/app/admin/page.tsx` (add a link to `/admin/codes` in the header)

**Interfaces:**
- Consumes: `GET/POST /api/admin/codes`, `PATCH /api/admin/codes/[id]`.

- [ ] **Step 1: Create the page wrapper**

Create `src/app/admin/codes/page.tsx`:
```tsx
import Link from "next/link";
import { CodesManager } from "@/components/admin/codes-manager";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminCodesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <Link
        href="/admin"
        className={cn(buttonVariants({ variant: "outline" }), "mb-4 border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80")}
      >
        ← กลับ
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">จัดการโค้ดเข้าใช้งาน</h1>
      <CodesManager />
    </main>
  );
}
```

- [ ] **Step 2: Create the client manager component**

Create `src/components/admin/codes-manager.tsx`:
```tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AccessCode = { id: string; code: string; active: boolean; createdAt: string };

export function CodesManager() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [count, setCount] = useState("10");
  const [created, setCreated] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/codes");
    if (res.ok) setCodes((await res.json()).codes);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generate() {
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > 500) { toast.error("จำนวนต้องเป็น 1–500"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: n }),
      });
      if (!res.ok) throw new Error();
      setCreated((await res.json()).created);
      await load();
      toast.success(`สร้าง ${n} โค้ดแล้ว`);
    } catch { toast.error("สร้างโค้ดไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  async function toggle(c: AccessCode) {
    const res = await fetch(`/api/admin/codes/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !c.active } : x)));
    else toast.error("อัปเดตไม่สำเร็จ");
  }

  function copyAll() {
    navigator.clipboard.writeText(created.join("\n")).then(() => toast.success("คัดลอกแล้ว"));
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle className="text-base">สร้างโค้ดใหม่</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="count">จำนวน</Label>
              <Input id="count" value={count} onChange={(e) => setCount(e.target.value)} className="w-32" inputMode="numeric" />
            </div>
            <Button onClick={generate} disabled={busy}>{busy ? "กำลังสร้าง…" : "สร้างโค้ด"}</Button>
          </div>
          {created.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">โค้ดที่เพิ่งสร้าง ({created.length})</p>
                <Button variant="outline" onClick={copyAll}>คัดลอกทั้งหมด</Button>
              </div>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-sm tabular-nums">{created.join("\n")}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader><CardTitle className="text-base">โค้ดทั้งหมด ({codes.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-semibold text-foreground">โค้ด</TableHead>
                <TableHead className="font-semibold text-foreground">สถานะ</TableHead>
                <TableHead className="font-semibold text-foreground">สร้างเมื่อ</TableHead>
                <TableHead className="font-semibold text-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id} className="border-0 even:bg-muted/40">
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>
                    <Badge variant={c.active ? "default" : "secondary"} className="rounded-full">
                      {c.active ? "ใช้งาน" : "ปิด"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleString("th-TH")}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => toggle(c)}>{c.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}</Button>
                  </TableCell>
                </TableRow>
              ))}
              {codes.length === 0 && (
                <TableRow className="border-0"><TableCell colSpan={4} className="text-center text-muted-foreground">ยังไม่มีโค้ด</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Add the dashboard link**

In `src/app/admin/page.tsx`, in the header `<div className="flex gap-2">` (next to the CSV link and `LogoutButton`), add before the CSV link:
```tsx
          <a href="/admin/codes" className={buttonVariants({ variant: "outline" })}>จัดการโค้ด</a>
```

- [ ] **Step 4: Verify with Playwright**

Log in at `/admin/login`, click "จัดการโค้ด" → `/admin/codes`. Enter `5` → "สร้างโค้ด" → expect 5 codes shown + "คัดลอกทั้งหมด" and the table populated. Click "ปิดใช้งาน" on a row → badge changes to "ปิด". Screenshot to confirm.

- [ ] **Step 5: Typecheck/lint/build + commit**

Run: `npx tsc --noEmit`, `npm run lint`, `npm run build` (all green).
```bash
git add src/app/admin/codes/page.tsx src/components/admin/codes-manager.tsx src/app/admin/page.tsx
git commit -m "feat(admin): access-codes management page"
```

---

### Task 9: End-to-end verification + cleanup

**Files:** none (verification only)

- [ ] **Step 1: Full check suite**

Run each and confirm green:
- `npx vitest run` → all pass (28 existing + access-code specs)
- `npx tsc --noEmit` → clean
- `npm run lint` → clean
- `npm run build` → succeeds

- [ ] **Step 2: Full happy-path E2E (Playwright, against live Neon)**

With the migration applied and dev server running:
1. Admin logs in → `/admin/codes` → generate 2 codes → copy one (call it `X`).
2. Deactivate a *different* code `Y`.
3. New tab as respondent → `/` → enter `Y` → expect rejection.
4. Enter `X` → proceed → complete all wizard steps → submit → `/thank-you`.
5. Admin dashboard shows the new response; `/admin/responses/[id]` shows role + frequency; CSV export includes it.

- [ ] **Step 3: Clean up test artifacts**

Remove any `scratch-*.js`, `cookies.txt`, screenshots, and delete seeded test codes (`TESTOK22`, `TESTOFF3`) and the test response row from Neon if you want a pristine DB before handoff. Confirm `git status` shows only intended files.

- [ ] **Step 4: Final commit (if any cleanup touched tracked files) + push**

```bash
git status --short
git push origin main
```

---

## Notes for the implementer

- **Order matters:** Task 1 (schema/client) must land before any task that references `prisma.accessCode`, or `tsc` fails.
- **Live DB:** verify-code, submit enforcement, admin API, and E2E all need the `AccessCode` table to actually exist in Neon (Task 1 Step 4). If applying to Neon is blocked/deferred, you can still land Tasks 2–8 (code + typecheck + unit tests) and defer only the live curl/Playwright verifications until the migration is applied.
- **No new dependencies** — `node:crypto`, `zod`, `sonner`, and existing shadcn/ui components cover everything.
