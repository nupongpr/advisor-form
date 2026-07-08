# thesis-form (แบบประเมิน ThesisFlow / EXP002) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้างเว็บฟอร์มดิจิทัลของเครื่องมือวิจัย EXP002 rev.1 ให้ผู้ตอบ (นักศึกษา/อาจารย์/กรรมการ) กรอกโค้ดแล้วทำแบบประเมิน ThesisFlow ผ่าน wizard บันทึกลงฐานข้อมูล คิดคะแนน SUS อัตโนมัติ และมีหน้าแอดมินดูสรุป + export CSV

**Architecture:** ทำงานในโปรเจกต์ **`advisor-form/`** (Next.js 16, App Router, `src/` dir) ที่ scaffold ไว้แล้ว — เพิ่ม Prisma/shadcn/Vitest ทับ. หน้าเว็บ + API route handlers (ไม่ใช้ Server Actions สำหรับการเขียน; การอ่านในหน้าแอดมินทำผ่าน async Server Component query Prisma ตรงได้). ฟอร์มฝั่ง client ใช้ react-hook-form + zod แล้ว POST payload ทั้งชุดเข้า `/api/responses`. ข้อมูลเก็บแบบ normalized (`Response` + `Answer`) ใน SQLite. Logic บริสุทธิ์ (SUS, validation, CSV, auth) อยู่ใน `src/lib/` เพื่อเทสต์ TDD ด้วย Vitest.

**Tech Stack:** Next.js **16.2.10** (App Router, `src/`, Turbopack default) · React 19.2 · TypeScript · Prisma + **PostgreSQL (NeonDB)** · shadcn/ui + **Tailwind v4** · react-hook-form + zod · Vitest · **Vercel**

**Working directory:** ทุกคำสั่งรันในโฟลเดอร์ `advisor-form/` (เช่น `cd "c:/@Projects/thesis-form/advisor-form"`)
**Spec:** `advisor-form/docs/superpowers/specs/2026-07-08-thesis-form-exp002-design.md`

## Global Constraints

- ทำงานในโปรเจกต์ `advisor-form/` เท่านั้น — อย่า scaffold ใหม่ (มี Next.js 16 อยู่แล้ว)
- **Next.js 16 breaking changes (ต้องยึดตามนี้ ห้ามใช้แบบ Next 15/เดิม):**
  - Middleware เปลี่ยนเป็นไฟล์ **`src/proxy.ts`** ฟังก์ชันชื่อ **`proxy`** — runtime nodejs เท่านั้น (ห้ามตั้ง edge)
  - `cookies()`, `headers()`, `params`, `searchParams` เป็น **async ต้อง `await`**
  - Turbopack เป็น default (ไม่ต้องใส่ `--turbopack`); `next lint` ถูกลบ (ใช้ `eslint` ตรง ๆ)
  - Tailwind v4: ไม่มี `tailwind.config.js` — ธีมอยู่ใน `src/app/globals.css` (`@import "tailwindcss"`, `:root`, `@theme inline`)
- alias `@/*` → `./src/*` (จาก `advisor-form/tsconfig.json`) — import เขียน `@/lib/...`, `@/components/...` โดยไฟล์จริงอยู่ใต้ `src/`
- ไม่ใช้ Server Actions สำหรับการเขียนข้อมูล — ทุก mutation ผ่าน API route handler (`src/app/api/**/route.ts`)
- UI ภาษาไทย; ข้อความคำถามใน `src/lib/questions.ts` เป็น placeholder ที่เจ้าของงานจะส่งข้อความจริงมาแทน (โครงสร้าง/คีย์ห้ามเปลี่ยน)
- Question keys คงที่: Likert = `sq_1..sq_5, wf_1..wf_5, pu_1..pu_5, ss_1..ss_3` (18) · SUS = `sus_1..sus_10` · ปลายเปิด = `open_1..open_3`
- Likert/SUS สเกล 1–5 · SUS สูตร Brooke → 0–100 (ข้อคี่ = ค่า−1, ข้อคู่ = 5−ค่า, รวม ×2.5)
- บังคับตอบข้อปิด (Likert 18 + SUS 10) ครบก่อนส่ง · ปลายเปิดไม่บังคับ
- primary color = ม่วงอ่อน (violet) ตั้งผ่าน CSS variable `--primary` จุดเดียว
- DB: **PostgreSQL (NeonDB)** — `DATABASE_URL` เจ้าของงานจะใส่ใน `.env` ภายหลัง (และตั้งใน Vercel env ตอน deploy); ห้าม commit `.env*` · deploy บน **Vercel**
- **ขั้นที่แตะ DB จริง (migrate, curl POST, Prisma Studio, ดูข้อมูลใน admin) เลื่อนไปทำหลังมี `DATABASE_URL`** — ระหว่างนี้ `prisma generate` (ออฟไลน์) พอให้ client + `npx tsc --noEmit` + `npm run build` ผ่าน (หน้า admin `force-dynamic` ไม่ query ตอน build)
- แต่ละ task จบด้วย commit ตาม conventional commits
- **Design system:** ยึด `advisor-form/docs/DESIGN.md` เป็น source of truth — ดูส่วน **Design System (DESIGN.md)** ด้านล่าง ซึ่ง **override** สไตล์ inline ที่โชว์ในโค้ดของ Task 7–10

---

## Design System (DESIGN.md)

**Source of truth:** `advisor-form/docs/DESIGN.md` — ทุก UI task ต้องยึดตามนี้ สไตล์: academic / professional / reassuring (Corporate + Soft Minimalism) — whitespace เยอะ, พื้น grey-violet + การ์ดขาว, เงานุ่ม, มนขอบ ส่วนนี้ **override** สไตล์ inline ที่โชว์ในโค้ด Task 7–10

### 1. Theme — `src/app/globals.css`
ธีมเต็ม (Tailwind v4, hex ตรง DESIGN.md, ไม่ใช้ oklch) อยู่ใน **Task 1 Step 4** — มี `:root`/`.dark`, `@theme inline`, `@utility shadow-soft`, type utilities · `--primary #6b44b7` เป็นปุ่มปรับสีม่วงจุดเดียว · ข้อความไทยใช้ `leading-relaxed` (1.6) · ฟอนต์ต่อผ่าน `next/font` เป็น `var(--font-thai)` ใน layout.tsx แล้ว

### 2. Typography (IBM Plex Sans Thai)
ใช้ recipe ตาม DESIGN scale (อย่าใช้ขนาดสุ่ม):
- headline-lg (H1): `text-2xl sm:text-[30px] font-semibold tracking-[-0.02em] leading-tight`
- headline-md (card title): `text-2xl font-semibold leading-tight`
- headline-sm (section): `text-xl font-medium leading-snug`
- body-lg `text-lg leading-relaxed` · body-md (default) `text-base leading-relaxed` · body-sm `text-sm leading-relaxed`
- label-md (field label) `text-sm font-medium` · label-sm (badge/meta) `text-xs font-medium`
- (หรือใช้คลาส `.text-headline-lg` … `.text-label-sm` ที่นิยามใน globals.css)

### 3. Layout & spacing
- **Wizard / survey / thank-you / login:** center **`max-w-[800px]`** (แทน `max-w-xl/2xl/md/sm`); gutter `px-4 sm:px-6`; `py-10`
- **Admin dashboard:** `max-w-6xl px-4 sm:px-6`; summary `grid gap-4 sm:grid-cols-3`; ตารางเต็มกว้าง
- **section-gap** (ระหว่างการ์ด/บล็อก) `space-y-10` (2.5rem) · **element-gap** (label↔input) `space-y-4` / label↔control `space-y-2` — baseline 4/8px

### 4. Cards & panels
ทุก wizard step + admin panel = การ์ดขาว `rounded-[1.5rem] bg-card shadow-soft border border-border`; fade-in เปลี่ยน step: `key={step}` + `className="animate-in fade-in-0 duration-300"`

### 5. Buttons
- **Primary** (ถัดไป / ส่ง / เริ่มทำแบบประเมิน): shadcn `<Button>` default = พื้นม่วงตัน + อักษรขาว `rounded-lg` (.5rem) — ไม่ต้องเพิ่มคลาส
- **Secondary / Back** (ย้อนกลับ, กลับ): พื้น **pale-violet + อักษร dark-violet** ตาม DESIGN → `variant="outline" className="border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80"` (พื้น `#eaddff`, อักษร `#25005a`) — **ไม่ใช้ `variant="secondary"`** (จะได้อักษรเทา `#45464f` ไม่ตรง DESIGN)
- **Ghost** (Logout): `variant="ghost"`

### 6. Likert — ใช้ `ScaleField` ที่แก้แล้ว
อย่าเขียน markup Likert เองใน wizard — ใช้ `src/components/survey/scale-field.tsx` (Task 8 Step 1): แนวนอนไล่ **1..5 ซ้าย→ขวา**, label ปลายทาง (น้อยที่สุดซ้าย, มากที่สุดขวา), วงกลมแตะง่าย, ที่เลือกใช้ `primary` · props คงเดิม `{ name, label, value, onChange }` · ทั้ง Likert (Task 8) และ SUS ใช้ตัวเดียวกัน

### 7. Inputs & selects (label เหนือ control เสมอ)
- wrapper `space-y-2`, `<Label>` (label-md) แล้วค่อย control
- focus = ขอบหนาเป็น primary + glow: `focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary`; idle `border-input` (#e4e7ec) · ใช้กับ `<Input>` (access code) และ `<Textarea>` (ปลายเปิด)

### 8. Progress bar (หนา, pill)
เด่นบนสุดของ wizard, 8–12px pill: `<Progress value={progress} className="h-2.5 rounded-full mb-8" />` (fill = `bg-primary` อยู่แล้ว) · จะ sticky ก็ได้: `sticky top-0 z-10 -mx-4 px-4 py-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60`

### 9. Admin data tables
สะอาด **ไม่มีเส้นแนวตั้ง**, zebra, header เข้ม+หนา: header row `className="bg-muted"`, head cells `className="font-semibold text-foreground"`; body rows `className="border-0 even:bg-muted/40 hover:bg-accent/40"` · role column ใช้ **pill badge** `<Badge variant="secondary" className="rounded-full">` · แถวสรุป Likert-average และหน้า detail: แทน `border-b py-1` ด้วย `rounded-md px-3 py-1.5 even:bg-muted/40`

### 10. Checklist ต่อ UI ทุกหน้า
`max-w-[800px]` (wizard) หรือ `max-w-6xl` (admin) · หุ้มด้วยการ์ด `rounded-[1.5rem] shadow-soft border-border` · `space-y-10` ระหว่าง section, `space-y-4`/`space-y-2` ภายใน · Primary ม่วงตัน, Back = outline pale-violet+dark-violet (§5) · input label-above + primary focus ring · ข้อความไทย `leading-relaxed` · ปุ่มปรับสีม่วงจุดเดียว = `--primary`

### 11. รายการแก้ต่อ task (line-level)
- **Task 1 Step 4:** ธีม globals.css จาก DESIGN.md hex — *(ทำในสเต็ปแล้ว)*
- **Task 1 Step 5 layout.tsx:** body = `min-h-dvh bg-background text-foreground font-sans antialiased` — *(ทำแล้ว)*
- **Task 7 landing:** `max-w-xl`→`max-w-[800px]`; Card += `rounded-[1.5rem] shadow-soft border-border`; code `<Input>` += focus ring
- **Task 8 wizard:** `max-w-2xl`→`max-w-[800px]`, wrapper `px-4 sm:px-6 py-10`
- **Task 8 Progress:** `className="mb-6"`→`className="h-2.5 rounded-full mb-8"`
- **Task 8 Card:** += `key={step}` + `rounded-[1.5rem] shadow-soft border-border animate-in fade-in-0 duration-300`
- **Task 8 CardContent:** `space-y-4`→`space-y-6`
- **Task 8 Back button:** `variant="outline"` + `className="border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80"` (Next/Submit คง primary)
- **Task 8 Textarea:** += focus ring classes
- **Task 8 thank-you:** `max-w-md`→`max-w-[800px]`; Card += `rounded-[1.5rem] shadow-soft border-border`
- **Task 9 login:** Card += `rounded-[1.5rem] shadow-soft border-border`; password `<Input>` += focus ring
- **Task 10 admin:** `max-w-5xl`→`max-w-6xl`; ทุก Card += `rounded-[1.5rem] shadow-soft border-border`
- **Task 10 Table:** header `bg-muted` + head cells `font-semibold text-foreground`; body rows `border-0 even:bg-muted/40 hover:bg-accent/40`
- **Task 10 role Badge:** += `className="rounded-full"`
- **Task 10 Likert-avg & detail rows:** `border-b py-1`→`rounded-md px-3 py-1.5 even:bg-muted/40`
- **Task 10 detail:** `max-w-2xl`→`max-w-[800px]`; back button = outline pale-violet (§5)

---

### Task 1: เพิ่ม Prisma + shadcn/ui + Vitest + ธีมม่วง + ฟอนต์ไทย (ในโปรเจกต์ที่มีอยู่)

**Files:**
- Create: `advisor-form/prisma/schema.prisma` (ผ่าน `prisma init`), `advisor-form/components.json` + `src/components/ui/*` + `src/lib/utils.ts` (ผ่าน shadcn), `advisor-form/vitest.config.ts`
- Modify: `src/app/globals.css` (สี primary ม่วง), `src/app/layout.tsx` (ฟอนต์ไทย + Toaster), `package.json` (สคริปต์ `test`)

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test` ทำงานได้; component shadcn พร้อมใช้; ธีม primary ม่วง; ฟอนต์ไทย

- [ ] **Step 1: ติดตั้ง dependencies**

Run (ใน `advisor-form/`):
```bash
npm i @prisma/client zod react-hook-form @hookform/resolvers
npm i -D prisma vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```
Expected: ติดตั้งสำเร็จ (หากมี peer-deps warning จาก React 19 ให้เพิ่ม `--legacy-peer-deps`)

- [ ] **Step 2: init Prisma**

Run: `npx prisma init --datasource-provider postgresql`
Expected: สร้าง `prisma/schema.prisma` (datasource postgresql) + `prisma.config.ts` (Prisma 7); `DATABASE_URL` ใส่ภายหลัง (Neon)
> หมายเหตุ: Task 1 ถูกรันก่อนเปลี่ยนแผน จึง init ด้วย `sqlite` — **Task 2 Step 1 เปลี่ยน `provider` เป็น `postgresql`**

- [ ] **Step 3: init shadcn/ui + add คอมโพเนนต์**

Run:
```bash
npx shadcn@latest init -d
npx shadcn@latest add button card input label radio-group select textarea form progress table badge separator sonner
```
Expected: มี `components.json`, `src/components/ui/*`, `src/lib/utils.ts`; shadcn เขียนชุด CSS variables (รวม `--primary`) ลง `src/app/globals.css` แบบ Tailwind v4 (`:root` + `@theme inline`)
(ถ้า CLI ถาม ให้ตอบค่า default; หากติด peer-deps ใช้ `--legacy-peer-deps`)

- [ ] **Step 4: ตั้งธีมจาก DESIGN.md ใน `src/app/globals.css`**

หลังบรรทัด `@import "tailwindcss";` ที่ scaffold/shadcn มีอยู่ ให้แทนที่บล็อกสี/รัศมีที่ shadcn เขียนไว้ด้วยธีมจาก **DESIGN.md** (hex ตรงต้นฉบับ ไม่แปลงเป็น oklch; `--primary: #6b44b7` เป็นปุ่มปรับสีม่วงจุดเดียว) — ผ่านการตรวจ (verify) ครบทุก shadcn variable แล้ว:

```css
:root {
  /* base surfaces */
  --background: #f8f9fa;         /* surface / background (grey-violet tint) */
  --foreground: #191c1d;         /* on-background */
  --card: #ffffff;              /* pure-white card (Level 1) */
  --card-foreground: #191c1d;
  --popover: #ffffff;
  --popover-foreground: #191c1d;

  /* brand */
  --primary: #6b44b7;           /* light violet */
  --primary-foreground: #ffffff;

  --secondary: #e2e1ed;         /* secondary-container (pale) */
  --secondary-foreground: #45464f;

  --muted: #f3f4f5;             /* surface-container-low */
  --muted-foreground: #667085;  /* text-muted */

  --accent: #eaddff;            /* primary-fixed (pale violet) */
  --accent-foreground: #25005a; /* on-primary-fixed (dark violet) */

  --destructive: #ba1a1a;       /* error */
  --destructive-foreground: #ffffff;

  --border: #e4e7ec;            /* border-muted */
  --input: #e4e7ec;
  --ring: #6b44b7;              /* focus = primary */

  --radius: 0.5rem;             /* interactive controls */

  --chart-1: #6b44b7;
  --chart-2: #855ed2;
  --chart-3: #d2bbff;
  --chart-4: #552ba0;
  --chart-5: #caa82b;

  --sidebar: #ffffff;
  --sidebar-foreground: #191c1d;
  --sidebar-primary: #6b44b7;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #eaddff;
  --sidebar-accent-foreground: #25005a;
  --sidebar-border: #e4e7ec;
  --sidebar-ring: #6b44b7;
}

.dark {
  /* DERIVED — DESIGN.md is light-first (ships no dark ramp); tune ถ้ามี dark palette ทางการภายหลัง */
  --background: #17151c;
  --foreground: #f0f1f2;
  --card: #201d27;
  --card-foreground: #f0f1f2;
  --popover: #201d27;
  --popover-foreground: #f0f1f2;
  --primary: #d2bbff;           /* inverse-primary */
  --primary-foreground: #25005a;
  --secondary: #45464f;
  --secondary-foreground: #e2e1ed;
  --muted: #2a2731;
  --muted-foreground: #ccc3d4;
  --accent: #552ba0;
  --accent-foreground: #eaddff;
  --destructive: #ffb4ab;
  --destructive-foreground: #690005;
  --border: #322f3b;
  --input: #322f3b;
  --ring: #d2bbff;
  --chart-1: #d2bbff; --chart-2: #b79bf0; --chart-3: #855ed2; --chart-4: #eaddff; --chart-5: #e7c345;
  --sidebar: #201d27;
  --sidebar-foreground: #f0f1f2;
  --sidebar-primary: #d2bbff;
  --sidebar-primary-foreground: #25005a;
  --sidebar-accent: #552ba0;
  --sidebar-accent-foreground: #eaddff;
  --sidebar-border: #322f3b;
  --sidebar-ring: #d2bbff;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* IBM Plex Sans Thai (next/font) → Noto Sans Thai fallback */
  --font-sans: var(--font-thai), "Noto Sans Thai", ui-sans-serif, system-ui, sans-serif;

  /* radius (DESIGN.md): sm .25 / DEFAULT .5 / md .75 / lg 1 / xl 1.5 (cards) */
  --radius-sm: 0.25rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-full: 9999px;
}

/* soft diffused shadow: blur 15px, ~5% opacity, primary-tinted */
@utility shadow-soft {
  box-shadow: 0 4px 15px 0 rgb(107 68 183 / 0.05);
}

/* Thai type scale (DESIGN.md); line-height 1.5–1.6× กัน glyph ชน */
@layer utilities {
  .text-headline-lg { font-size: 1.875rem; line-height: 2.375rem; font-weight: 600; letter-spacing: -0.02em; }
  @media (max-width: 639px) { .text-headline-lg { font-size: 1.5rem; line-height: 2rem; } }
  .text-headline-md { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }
  .text-headline-sm { font-size: 1.25rem; line-height: 1.75rem; font-weight: 500; }
  .text-body-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-body-md { font-size: 1rem; line-height: 1.5rem; }
  .text-body-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-label-md { font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; }
  .text-label-sm { font-size: 0.75rem; line-height: 1rem; font-weight: 500; }
}

@layer base {
  * { border-color: var(--border); outline-color: var(--ring); }
  body { background-color: var(--background); color: var(--foreground); font-family: var(--font-sans); line-height: 1.6; }
}
```
DESIGN.md = source of truth; วิธีใช้แต่ละคอมโพเนนต์อยู่ในส่วน **Design System (DESIGN.md)** ด้านบน (การ์ด, ปุ่ม, Likert, ตาราง, progress ฯลฯ)

- [ ] **Step 5: ฟอนต์ไทย + Toaster ใน `src/app/layout.tsx`**

แทน import ฟอนต์เดิม (Geist) ด้วย IBM Plex Sans Thai และใส่ `<Toaster>`:
```tsx
import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const thai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "แบบประเมินระบบ ThesisFlow",
  description: "แบบสอบถามและแบบวัดการใช้งานระบบ ThesisFlow (EXP002)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={thai.variable}>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Vitest config + สคริปต์**

Create `advisor-form/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```
เพิ่มใน `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`

- [ ] **Step 7: ตรวจ build/test**

Run: `npm run build` → Expected: build ผ่าน
Run: `npx vitest run` → Expected: "No test files found" (ไม่มี error)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(advisor-form): add Prisma, shadcn/ui, Vitest, violet theme, Thai font"
```

---

### Task 2: Prisma schema + migration + client singleton

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Interfaces:**
- Produces: `prisma` (instance ของ `PrismaClient`) จาก `@/lib/prisma`; โมเดล `Response`, `Answer`

- [ ] **Step 1: เขียน schema (+ เปลี่ยน provider เป็น postgresql)**

ในบล็อก `datasource db` ของ `prisma/schema.prisma` เปลี่ยน `provider = "sqlite"` → `provider = "postgresql"` (คงบล็อก `generator client { provider = "prisma-client"  output = "../src/generated/prisma" }`; url อยู่ใน `prisma.config.ts` ผ่าน `DATABASE_URL`) แล้วเพิ่มโมเดล:
```prisma
model Response {
  id         String   @id @default(cuid())
  code       String
  role       String
  ageBand    String
  field      String?
  experience String?
  susScore   Float
  createdAt  DateTime @default(now())
  answers    Answer[]
}

model Answer {
  id          String   @id @default(cuid())
  responseId  String
  response    Response @relation(fields: [responseId], references: [id], onDelete: Cascade)
  questionKey String
  value       Int?
  text        String?

  @@index([responseId])
  @@index([questionKey])
}
```

- [ ] **Step 2: generate client (migrate เลื่อนไปหลังมี DATABASE_URL)**

ยังไม่มี `DATABASE_URL` (Neon) — **ยังไม่ migrate**. รัน `npx prisma generate` (ออฟไลน์ ไม่ต้องต่อ DB) เพื่อสร้าง client ที่ `src/generated/prisma`
Expected: generate สำเร็จ, มีโฟลเดอร์ `src/generated/prisma`
> เมื่อเจ้าของงานใส่ `DATABASE_URL` แล้ว ค่อยรัน `npx prisma migrate dev --name init` (dev) หรือ `npx prisma migrate deploy` (Vercel/prod) เพื่อสร้างตารางบน Postgres

- [ ] **Step 3: client singleton**

Create `src/lib/prisma.ts`:
```ts
import { PrismaClient } from "@/generated/prisma/client"; // Prisma 7 prisma-client generator (output: src/generated/prisma); ยืนยัน entry จริงหลัง generate

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: ตรวจ**

Run: `npx tsc --noEmit` → Expected: ไม่มี error (ต้อง `prisma generate` แล้วใน Step 2)
> `npx prisma studio` / ดูตารางจริง เลื่อนไปหลัง migrate (ต้องมี `DATABASE_URL`)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Response/Answer Prisma models and client singleton"
```

---

### Task 3: นิยามชุดคำถาม (config) + types

**Files:**
- Create: `src/lib/questions.ts`, `src/lib/questions.test.ts`

**Interfaces:**
- Produces: `Role`, `AgeBand`, `LIKERT_SECTIONS`, `OPEN_QUESTIONS`, `SUS_ITEMS`, `LIKERT_KEYS` (18), `SUS_KEYS` (10), `OPEN_KEYS` (3), `ROLE_OPTIONS`, `AGE_OPTIONS`, `SCALE_LABELS`

- [ ] **Step 1: เขียน config**

Create `src/lib/questions.ts` (ข้อความ `th` เป็น placeholder — เจ้าของงานจะแทนด้วยข้อความจริงจาก PDF; คีย์ห้ามเปลี่ยน):
```ts
export type Role = "student" | "advisor" | "committee";
export type AgeBand = "<40" | "41-50" | "51-60" | ">60";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "นักศึกษา" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
  { value: "committee", label: "กรรมการ" },
];

export const AGE_OPTIONS: { value: AgeBand; label: string }[] = [
  { value: "<40", label: "น้อยกว่า 40 ปี" },
  { value: "41-50", label: "41–50 ปี" },
  { value: "51-60", label: "51–60 ปี" },
  { value: ">60", label: "มากกว่า 60 ปี" },
];

export const SCALE_LABELS: Record<number, string> = {
  5: "มากที่สุด", 4: "มาก", 3: "ปานกลาง", 2: "น้อย", 1: "น้อยที่สุด",
};

export const LIKERT_SECTIONS = [
  {
    key: "sq", title: "คุณภาพระบบและการใช้งาน (System Quality & Usability)",
    items: [
      { key: "sq_1", th: "[PLACEHOLDER] ข้อ 1 คุณภาพระบบ" },
      { key: "sq_2", th: "[PLACEHOLDER] ข้อ 2 คุณภาพระบบ" },
      { key: "sq_3", th: "[PLACEHOLDER] ข้อ 3 คุณภาพระบบ" },
      { key: "sq_4", th: "[PLACEHOLDER] ข้อ 4 คุณภาพระบบ" },
      { key: "sq_5", th: "[PLACEHOLDER] ข้อ 5 คุณภาพระบบ" },
    ],
  },
  {
    key: "wf", title: "การทำงานและฟังก์ชัน (Workflow & Functionality)",
    items: [
      { key: "wf_1", th: "[PLACEHOLDER] ข้อ 1 การทำงาน" },
      { key: "wf_2", th: "[PLACEHOLDER] ข้อ 2 การทำงาน" },
      { key: "wf_3", th: "[PLACEHOLDER] ข้อ 3 การทำงาน" },
      { key: "wf_4", th: "[PLACEHOLDER] ข้อ 4 การทำงาน" },
      { key: "wf_5", th: "[PLACEHOLDER] ข้อ 5 การทำงาน" },
    ],
  },
  {
    key: "pu", title: "การรับรู้ประโยชน์ (Perceived Usefulness)",
    items: [
      { key: "pu_1", th: "[PLACEHOLDER] ข้อ 1 ประโยชน์" },
      { key: "pu_2", th: "[PLACEHOLDER] ข้อ 2 ประโยชน์" },
      { key: "pu_3", th: "[PLACEHOLDER] ข้อ 3 ประโยชน์" },
      { key: "pu_4", th: "[PLACEHOLDER] ข้อ 4 ประโยชน์" },
      { key: "pu_5", th: "[PLACEHOLDER] ข้อ 5 ประโยชน์" },
    ],
  },
  {
    key: "ss", title: "บริการสนับสนุน (Support Service)",
    items: [
      { key: "ss_1", th: "[PLACEHOLDER] ข้อ 1 บริการสนับสนุน" },
      { key: "ss_2", th: "[PLACEHOLDER] ข้อ 2 บริการสนับสนุน" },
      { key: "ss_3", th: "[PLACEHOLDER] ข้อ 3 บริการสนับสนุน" },
    ],
  },
] as const;

export const OPEN_QUESTIONS = [
  { key: "open_1", th: "[PLACEHOLDER] จุดเด่นของระบบที่ท่านประทับใจคืออะไร" },
  { key: "open_2", th: "[PLACEHOLDER] สิ่งที่ควรปรับปรุงคืออะไร" },
  { key: "open_3", th: "[PLACEHOLDER] ข้อเสนอแนะเพิ่มเติม" },
] as const;

export const SUS_ITEMS = [
  { key: "sus_1", th: "ฉันคิดว่าฉันอยากใช้ระบบนี้บ่อย ๆ", en: "I think that I would like to use this system frequently." },
  { key: "sus_2", th: "ฉันพบว่าระบบนี้ซับซ้อนเกินความจำเป็น", en: "I found the system unnecessarily complex." },
  { key: "sus_3", th: "ฉันคิดว่าระบบนี้ใช้งานง่าย", en: "I thought the system was easy to use." },
  { key: "sus_4", th: "ฉันคิดว่าฉันต้องขอความช่วยเหลือจากผู้เชี่ยวชาญจึงจะใช้ระบบนี้ได้", en: "I think that I would need the support of a technical person to be able to use this system." },
  { key: "sus_5", th: "ฉันพบว่าฟังก์ชันต่าง ๆ ในระบบนี้ทำงานเชื่อมโยงกันได้ดี", en: "I found the various functions in this system were well integrated." },
  { key: "sus_6", th: "ฉันคิดว่าระบบนี้มีความไม่สอดคล้องกันมากเกินไป", en: "I thought there was too much inconsistency in this system." },
  { key: "sus_7", th: "ฉันคิดว่าคนส่วนใหญ่จะเรียนรู้การใช้ระบบนี้ได้อย่างรวดเร็ว", en: "I would imagine that most people would learn to use this system very quickly." },
  { key: "sus_8", th: "ฉันพบว่าระบบนี้ใช้งานยุ่งยากมาก", en: "I found the system very cumbersome to use." },
  { key: "sus_9", th: "ฉันรู้สึกมั่นใจมากเมื่อใช้ระบบนี้", en: "I felt very confident using the system." },
  { key: "sus_10", th: "ฉันต้องเรียนรู้หลายอย่างก่อนที่จะเริ่มใช้ระบบนี้ได้", en: "I needed to learn a lot of things before I could get going with this system." },
] as const;

export const LIKERT_KEYS = LIKERT_SECTIONS.flatMap((s) => s.items.map((i) => i.key));
export const SUS_KEYS = SUS_ITEMS.map((i) => i.key);
export const OPEN_KEYS = OPEN_QUESTIONS.map((i) => i.key);
```

- [ ] **Step 2: เทสต์**

Create `src/lib/questions.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "./questions";

describe("questions config", () => {
  it("มี Likert 18 คีย์ ไม่ซ้ำ", () => {
    expect(LIKERT_KEYS).toHaveLength(18);
    expect(new Set(LIKERT_KEYS).size).toBe(18);
  });
  it("มี SUS 10 คีย์ เรียง sus_1..sus_10", () => {
    expect(SUS_KEYS).toEqual(Array.from({ length: 10 }, (_, i) => `sus_${i + 1}`));
  });
  it("มีปลายเปิด 3 คีย์", () => {
    expect(OPEN_KEYS).toEqual(["open_1", "open_2", "open_3"]);
  });
});
```

- [ ] **Step 3: รันเทสต์** — Run: `npx vitest run src/lib/questions.test.ts` → Expected: PASS 3

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add EXP002 question config with stable keys"
```

---

### Task 4: คิดคะแนน SUS (`src/lib/sus.ts`) — TDD

**Files:**
- Create: `src/lib/sus.ts`, `src/lib/sus.test.ts`

**Interfaces:**
- Consumes: `SUS_KEYS` จาก `@/lib/questions`
- Produces: `scoreSus(answers: Record<string, number>): number` — อ่าน `sus_1..sus_10` (1–5) คืน 0–100

- [ ] **Step 1: เทสต์ให้ fail**

Create `src/lib/sus.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { scoreSus } from "./sus";

const build = (vals: number[]) => Object.fromEntries(vals.map((v, i) => [`sus_${i + 1}`, v]));

describe("scoreSus (Brooke)", () => {
  it("ข้อคี่=5 ข้อคู่=1 → 100 (เต็ม)", () => expect(scoreSus(build([5,1,5,1,5,1,5,1,5,1]))).toBe(100));
  it("ข้อคี่=1 ข้อคู่=5 → 0", () => expect(scoreSus(build([1,5,1,5,1,5,1,5,1,5]))).toBe(0));
  it("ตอบ 3 ทุกข้อ → 50", () => expect(scoreSus(build([3,3,3,3,3,3,3,3,3,3]))).toBe(50));
  it("ตอบ 5 ทุกข้อ → 50 (ข้อคู่เชิงลบ)", () => expect(scoreSus(build([5,5,5,5,5,5,5,5,5,5]))).toBe(50));
  it("คีย์ไม่ครบ 10 → throw", () => expect(() => scoreSus({ sus_1: 5 })).toThrow());
});
```

- [ ] **Step 2: รันให้ fail** — Run: `npx vitest run src/lib/sus.test.ts` → Expected: FAIL

- [ ] **Step 3: implementation**

Create `src/lib/sus.ts`:
```ts
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
```

- [ ] **Step 4: รันให้ผ่าน** — Run: `npx vitest run src/lib/sus.test.ts` → Expected: PASS 5

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add SUS scoring (Brooke formula) with tests"
```

---

### Task 5: Validation schema (`src/lib/validation.ts`) — TDD

**Files:**
- Create: `src/lib/validation.ts`, `src/lib/validation.test.ts`

**Interfaces:**
- Consumes: `LIKERT_KEYS`, `SUS_KEYS`, `OPEN_KEYS`
- Produces: `surveyPayloadSchema` (zod), `type SurveyPayload = z.infer<typeof surveyPayloadSchema>` — รูป payload: `{ code, role, ageBand, field?, experience?, likert: Record<string,number> (18 คีย์ 1–5), sus: Record<string,number> (10 คีย์ 1–5), open: Record<string,string> (open_1..3) }`

- [ ] **Step 1: เทสต์ให้ fail**

Create `src/lib/validation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { surveyPayloadSchema } from "./validation";
import { LIKERT_KEYS, SUS_KEYS } from "./questions";

const fullLikert = Object.fromEntries(LIKERT_KEYS.map((k) => [k, 4]));
const fullSus = Object.fromEntries(SUS_KEYS.map((k) => [k, 3]));
const valid = {
  code: "S01", role: "student", ageBand: "<40", field: "วิศวกรรม",
  likert: fullLikert, sus: fullSus, open: { open_1: "ดี", open_2: "", open_3: "" },
};

describe("surveyPayloadSchema", () => {
  it("ผ่านเมื่อข้อมูลครบถูกต้อง", () => expect(surveyPayloadSchema.safeParse(valid).success).toBe(true));
  it("ไม่ผ่านเมื่อโค้ดว่าง", () => expect(surveyPayloadSchema.safeParse({ ...valid, code: "" }).success).toBe(false));
  it("ไม่ผ่านเมื่อ Likert ไม่ครบ", () => {
    const { sq_1, ...rest } = fullLikert as Record<string, number>;
    expect(surveyPayloadSchema.safeParse({ ...valid, likert: rest }).success).toBe(false);
  });
  it("ไม่ผ่านเมื่อค่า SUS นอกช่วง", () => expect(surveyPayloadSchema.safeParse({ ...valid, sus: { ...fullSus, sus_1: 9 } }).success).toBe(false));
  it("ไม่ผ่านเมื่อ role ผิด", () => expect(surveyPayloadSchema.safeParse({ ...valid, role: "teacher" }).success).toBe(false));
});
```

- [ ] **Step 2: รันให้ fail** — Run: `npx vitest run src/lib/validation.test.ts` → Expected: FAIL

- [ ] **Step 3: implementation**

Create `src/lib/validation.ts`:
```ts
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
  open: openMap,
});

export type SurveyPayload = z.infer<typeof surveyPayloadSchema>;
```

- [ ] **Step 4: รันให้ผ่าน** — Run: `npx vitest run src/lib/validation.test.ts` → Expected: PASS 5

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add zod survey payload validation with tests"
```

---

### Task 6: payload → answer rows + POST/GET `/api/responses`

**Files:**
- Create: `src/lib/responses.ts`, `src/lib/responses.test.ts`, `src/app/api/responses/route.ts`

**Interfaces:**
- Consumes: `SurveyPayload`, `scoreSus`, `prisma`
- Produces: `toAnswerRows(payload): { questionKey; value: number|null; text: string|null }[]`; route `POST /api/responses` → `201 { id }` | `400`; `GET /api/responses` (แอดมิน) → `200 { responses }`

- [ ] **Step 1: เทสต์ `toAnswerRows` ให้ fail**

Create `src/lib/responses.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { toAnswerRows } from "./responses";
import { LIKERT_KEYS, SUS_KEYS } from "./questions";
import type { SurveyPayload } from "./validation";

const payload = {
  code: "S01", role: "student", ageBand: "<40",
  likert: Object.fromEntries(LIKERT_KEYS.map((k) => [k, 4])),
  sus: Object.fromEntries(SUS_KEYS.map((k) => [k, 3])),
  open: { open_1: "ดีมาก", open_2: "", open_3: "  " },
} as SurveyPayload;

describe("toAnswerRows", () => {
  it("Likert 18 + SUS 10 + open ที่ไม่ว่างเท่านั้น", () => {
    const rows = toAnswerRows(payload);
    expect(rows.filter((r) => LIKERT_KEYS.includes(r.questionKey))).toHaveLength(18);
    expect(rows.filter((r) => SUS_KEYS.includes(r.questionKey))).toHaveLength(10);
    const open = rows.filter((r) => r.questionKey.startsWith("open_"));
    expect(open).toHaveLength(1);
    expect(open[0]).toMatchObject({ questionKey: "open_1", value: null, text: "ดีมาก" });
  });
});
```

- [ ] **Step 2: รันให้ fail** — Run: `npx vitest run src/lib/responses.test.ts` → Expected: FAIL

- [ ] **Step 3: `src/lib/responses.ts`**

```ts
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
```

- [ ] **Step 4: รันให้ผ่าน** — Run: `npx vitest run src/lib/responses.test.ts` → Expected: PASS

- [ ] **Step 5: route handler (Next 16)**

Create `src/app/api/responses/route.ts`:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { surveyPayloadSchema } from "@/lib/validation";
import { scoreSus } from "@/lib/sus";
import { toAnswerRows } from "@/lib/responses";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = surveyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const p = parsed.data;

  const created = await prisma.response.create({
    data: {
      code: p.code, role: p.role, ageBand: p.ageBand,
      field: p.field ?? null, experience: p.experience ?? null,
      susScore: scoreSus(p.sus),
      answers: { create: toAnswerRows(p) },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function GET() {
  const responses = await prisma.response.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, code: true, role: true, ageBand: true, susScore: true, createdAt: true },
  });
  return NextResponse.json({ responses });
}
```
หมายเหตุ: `GET` จะถูกป้องกันโดย `src/proxy.ts` (Task 9)

- [ ] **Step 6: ตรวจด้วยตนเอง**

Run: `npm run dev` แล้ว:
```bash
curl -s -X POST http://localhost:3000/api/responses -H "Content-Type: application/json" \
  -d '{"code":"S01","role":"student","ageBand":"<40","likert":{"sq_1":4,"sq_2":4,"sq_3":4,"sq_4":4,"sq_5":4,"wf_1":4,"wf_2":4,"wf_3":4,"wf_4":4,"wf_5":4,"pu_1":4,"pu_2":4,"pu_3":4,"pu_4":4,"pu_5":4,"ss_1":4,"ss_2":4,"ss_3":4},"sus":{"sus_1":5,"sus_2":1,"sus_3":5,"sus_4":1,"sus_5":5,"sus_6":1,"sus_7":5,"sus_8":1,"sus_9":5,"sus_10":1},"open":{"open_1":"ทดสอบ"}}'
```
Expected: `{"id":"..."}` (201); `npx prisma studio` เห็น 1 `Response` (susScore=100) + 29 `Answer`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add responses API (POST create, GET list) with answer mapping"
```

---

### Task 7: hook เก็บ draft + หน้าแรก (กรอกโค้ด)

**Files:**
- Create: `src/lib/use-survey-draft.ts`, `src/app/page.tsx` (แทนของ scaffold)

**Interfaces:**
- Produces: `SurveyDraft`, `useSurveyDraft()` (sync `localStorage` คีย์ `thesis-form-draft`), หน้าแรกกรอกโค้ด → `router.push("/survey")`

- [ ] **Step 1: hook**

Create `src/lib/use-survey-draft.ts`:
```ts
"use client";
import { useCallback, useEffect, useState } from "react";

export type SurveyDraft = {
  code: string; role?: string; ageBand?: string; field?: string; experience?: string;
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
```

- [ ] **Step 2: หน้าแรก**

แทน `src/app/page.tsx`:
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
  const code = draft.code.trim();

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">แบบประเมินระบบ ThesisFlow</CardTitle>
          <CardDescription>กรุณากรอกรหัส (โค้ด) ที่ได้รับ เพื่อเริ่มทำแบบประเมิน ใช้เวลาประมาณ 10–15 นาที</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">รหัสผู้ตอบ</Label>
            <Input id="code" value={draft.code} onChange={(e) => setField("code", e.target.value)} placeholder="เช่น S01" autoComplete="off" />
            {touched && !code && <p className="text-sm text-destructive">กรุณากรอกรหัส</p>}
          </div>
          <Button className="w-full" onClick={() => (code ? router.push("/survey") : setTouched(true))}>เริ่มทำแบบประเมิน</Button>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: ตรวจด้วยตนเอง**

Run: `npm run dev` → `/` กรอกโค้ด → กด → ไป `/survey` (404 จนกว่าจะทำ Task 8); รีเฟรชแล้วโค้ดยังอยู่

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add survey draft hook and code-entry landing page"
```

---

### Task 8: Survey wizard

**Files:**
- Create: `src/components/survey/scale-field.tsx`, `src/components/survey/survey-wizard.tsx`, `src/app/survey/page.tsx`, `src/app/thank-you/page.tsx`

**Interfaces:**
- Consumes: `useSurveyDraft`, `LIKERT_SECTIONS`, `SUS_ITEMS`, `OPEN_QUESTIONS`, `ROLE_OPTIONS`, `AGE_OPTIONS`, `SCALE_LABELS`, `LIKERT_KEYS`, `SUS_KEYS`
- Produces: หน้า `/survey`, `/thank-you`

- [ ] **Step 1: `scale-field.tsx`**

Create `src/components/survey/scale-field.tsx`:
```tsx
"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const SCALE = [1, 2, 3, 4, 5] as const;

/**
 * DESIGN Likert scale field.
 * - แนวนอน ไล่ 1..5 ซ้าย -> ขวา
 * - label เฉพาะปลายทาง: น้อยที่สุด (ซ้าย) ... มากที่สุด (ขวา)
 * - แต่ละตัวเลือกเป็นวงกลม แตะง่าย เต็มความกว้างบนมือถือ; ที่เลือกใช้สี primary
 * - ข้อความคำถาม (`label`) แสดงเหนือสเกล
 */
export function ScaleField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="mb-4 text-base font-medium leading-relaxed text-foreground">
        {label}
      </p>

      <RadioGroup
        aria-label={label}
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        className="flex items-stretch gap-1.5 sm:gap-3"
      >
        {SCALE.map((n) => {
          const id = `${name}-${n}`;
          return (
            <Label
              key={n}
              htmlFor={id}
              className="group flex flex-1 cursor-pointer flex-col items-center gap-1.5 py-1"
            >
              <RadioGroupItem id={id} value={String(n)} className="peer sr-only" />
              <span className="flex aspect-square w-full max-w-11 items-center justify-center rounded-full border border-input bg-background text-sm font-semibold text-muted-foreground transition-colors group-hover:border-primary/60 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                {n}
              </span>
            </Label>
          );
        })}
      </RadioGroup>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>น้อยที่สุด</span>
        <span>มากที่สุด</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `survey-wizard.tsx`**

Create `src/components/survey/survey-wizard.tsx`:
```tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScaleField } from "./scale-field";
import { useSurveyDraft } from "@/lib/use-survey-draft";
import {
  LIKERT_SECTIONS, SUS_ITEMS, OPEN_QUESTIONS, ROLE_OPTIONS, AGE_OPTIONS, LIKERT_KEYS, SUS_KEYS,
} from "@/lib/questions";

export function SurveyWizard() {
  const router = useRouter();
  const { draft, loaded, setField, setLikert, setSus, setOpen, reset } = useSurveyDraft();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 0=ข้อมูลทั่วไป, 1..4=Likert, 5=ปลายเปิด, 6=SUS, 7=ทบทวน
  const totalSteps = 8;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const canNext = useMemo(() => {
    if (step === 0) return !!draft.role && !!draft.ageBand;
    if (step >= 1 && step <= 4) return LIKERT_SECTIONS[step - 1].items.every((i) => !!draft.likert[i.key]);
    if (step === 5) return true;
    if (step === 6) return SUS_ITEMS.every((i) => !!draft.sus[i.key]);
    return true;
  }, [step, draft]);

  if (!loaded) return null;
  if (!draft.code.trim()) {
    return (
      <div className="p-8 text-center">
        <p>ไม่พบรหัสผู้ตอบ</p>
        <Button className="mt-4" onClick={() => router.push("/")}>กลับไปกรอกรหัส</Button>
      </div>
    );
  }

  async function submit() {
    setSubmitting(true);
    const payload = {
      code: draft.code.trim(), role: draft.role, ageBand: draft.ageBand,
      field: draft.field || undefined, experience: draft.experience || undefined,
      likert: draft.likert, sus: draft.sus, open: draft.open,
    };
    try {
      const res = await fetch("/api/responses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      reset();
      router.push("/thank-you");
    } catch {
      toast.error("ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Progress value={progress} className="mb-6" />
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 0 && "ข้อมูลทั่วไป"}
            {step >= 1 && step <= 4 && LIKERT_SECTIONS[step - 1].title}
            {step === 5 && "คำถามปลายเปิด"}
            {step === 6 && "แบบวัดการใช้งานระบบ (SUS)"}
            {step === 7 && "ทบทวนและส่ง"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>บทบาท</Label>
                <Select value={draft.role} onValueChange={(v) => setField("role", v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกบทบาท" /></SelectTrigger>
                  <SelectContent>{ROLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ช่วงอายุ</Label>
                <Select value={draft.ageBand} onValueChange={(v) => setField("ageBand", v)}>
                  <SelectTrigger><SelectValue placeholder="เลือกช่วงอายุ" /></SelectTrigger>
                  <SelectContent>{AGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">สาขา/หน่วยงาน (ไม่บังคับ)</Label>
                <Input id="field" value={draft.field ?? ""} onChange={(e) => setField("field", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">ประสบการณ์ (ไม่บังคับ)</Label>
                <Input id="exp" value={draft.experience ?? ""} onChange={(e) => setField("experience", e.target.value)} />
              </div>
            </>
          )}

          {step >= 1 && step <= 4 && LIKERT_SECTIONS[step - 1].items.map((it) => (
            <ScaleField key={it.key} name={it.key} label={it.th} value={draft.likert[it.key]} onChange={(v) => setLikert(it.key, v)} />
          ))}

          {step === 5 && OPEN_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-2">
              <Label htmlFor={q.key}>{q.th}</Label>
              <Textarea id={q.key} value={draft.open[q.key] ?? ""} onChange={(e) => setOpen(q.key, e.target.value)} rows={3} />
            </div>
          ))}

          {step === 6 && SUS_ITEMS.map((it) => (
            <ScaleField key={it.key} name={it.key} label={it.th} value={draft.sus[it.key]} onChange={(v) => setSus(it.key, v)} />
          ))}

          {step === 7 && (
            <div className="space-y-2 text-sm">
              <p>โค้ด: <b>{draft.code}</b></p>
              <p>บทบาท: {ROLE_OPTIONS.find((r) => r.value === draft.role)?.label}</p>
              <p>ตอบ Likert {LIKERT_KEYS.filter((k) => draft.likert[k]).length}/18 · SUS {SUS_KEYS.filter((k) => draft.sus[k]).length}/10</p>
              <p className="text-muted-foreground">กดส่งเพื่อบันทึกคำตอบ (ส่งได้ครั้งเดียว)</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)}>ย้อนกลับ</Button>
        {step < totalSteps - 1 ? (
          <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>ถัดไป</Button>
        ) : (
          <Button disabled={submitting} onClick={submit}>{submitting ? "กำลังส่ง…" : "ส่งแบบประเมิน"}</Button>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: หน้า `/survey` และ `/thank-you`**

Create `src/app/survey/page.tsx`:
```tsx
import { SurveyWizard } from "@/components/survey/survey-wizard";
export default function SurveyPage() {
  return <SurveyWizard />;
}
```

Create `src/app/thank-you/page.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ThankYou() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Card className="text-center">
        <CardHeader><CardTitle className="text-2xl">ขอบคุณสำหรับการประเมิน 🎉</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">ระบบได้บันทึกคำตอบของท่านเรียบร้อยแล้ว</p>
          <Button asChild><Link href="/">กลับสู่หน้าแรก</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: ตรวจ end-to-end**

Run: `npm run dev` → `/` กรอกโค้ด → ทำครบทุกขั้น (ปุ่ม "ถัดไป" disabled จนตอบข้อปิดครบ) → ส่ง → `/thank-you` → `npx prisma studio` มี Response ใหม่
Run: `npm run build` → Expected: build ผ่าน

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add multi-step survey wizard with draft persistence and submit"
```

---

### Task 9: Admin auth (helper + `src/proxy.ts` + login/logout + login page)

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth.test.ts`, `src/proxy.ts`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/logout/route.ts`, `src/app/admin/login/page.tsx`
- Modify: `.env` (เพิ่ม `ADMIN_PASSWORD`, `COOKIE_SECRET`)

**Interfaces:**
- Consumes: env `ADMIN_PASSWORD`, `COOKIE_SECRET`
- Produces:
  - `makeSessionToken(secret): Promise<string>` (HMAC-SHA256 ผ่าน Web Crypto)
  - `verifySessionToken(token, secret): Promise<boolean>` (constant-time)
  - `SESSION_COOKIE = "tf_session"`
  - `POST /api/admin/login`, `POST /api/admin/logout`
  - **`src/proxy.ts`** ฟังก์ชัน `proxy` ป้องกัน `/admin/*` (ยกเว้น `/admin/login`) และ `/api/admin/*` (ยกเว้น login/logout) และ `GET /api/responses`

- [ ] **Step 1: เทสต์ auth ให้ fail**

Create `src/lib/auth.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { makeSessionToken, verifySessionToken } from "./auth";

describe("session token", () => {
  it("secret เดียวกัน verify ผ่าน", async () => {
    const t = await makeSessionToken("s3cret");
    expect(await verifySessionToken(t, "s3cret")).toBe(true);
  });
  it("secret ต่างกัน verify ไม่ผ่าน", async () => {
    const t = await makeSessionToken("s3cret");
    expect(await verifySessionToken(t, "other")).toBe(false);
  });
  it("token มั่ว ไม่ผ่าน", async () => {
    expect(await verifySessionToken("garbage", "s3cret")).toBe(false);
  });
});
```

- [ ] **Step 2: รันให้ fail** — Run: `npx vitest run src/lib/auth.test.ts` → Expected: FAIL

- [ ] **Step 3: `src/lib/auth.ts` (Web Crypto — nodejs runtime)**

```ts
export const SESSION_COOKIE = "tf_session";
const PAYLOAD = "admin-authenticated";
const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}
export async function makeSessionToken(secret: string): Promise<string> {
  return hmacHex(PAYLOAD, secret);
}
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!token) return false;
  const expected = await hmacHex(PAYLOAD, secret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
```

- [ ] **Step 4: รันให้ผ่าน** — Run: `npx vitest run src/lib/auth.test.ts` → Expected: PASS 3

- [ ] **Step 5: เพิ่ม `.env`**

```
ADMIN_PASSWORD="change-me-admin"
COOKIE_SECRET="change-me-long-random-secret"
```

- [ ] **Step 6: login/logout routes**

Create `src/app/api/admin/login/route.ts`:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { makeSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  const token = await makeSessionToken(process.env.COOKIE_SECRET!);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
```

Create `src/app/api/admin/logout/route.ts`:
```ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
```

- [ ] **Step 7: `src/proxy.ts` (Next 16 — แทน middleware)**

Create `src/proxy.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginRoute =
    pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  if (isLoginRoute) return NextResponse.next();

  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    (pathname === "/api/responses" && req.method === "GET");
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const ok = await verifySessionToken(token, process.env.COOKIE_SECRET ?? "");
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/responses"],
};
```
หมายเหตุ Next 16: ไฟล์ต้องชื่อ `src/proxy.ts` และฟังก์ชันชื่อ `proxy` (ไม่ใช่ `middleware`); runtime เป็น nodejs โดยอัตโนมัติ — ห้ามตั้ง `runtime: "edge"`

- [ ] **Step 8: หน้า login**

Create `src/app/admin/login/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    if (res.ok) router.push("/admin");
    else { setError("รหัสผ่านไม่ถูกต้อง"); setLoading(false); }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <Card>
        <CardHeader><CardTitle>เข้าสู่ระบบผู้ดูแล</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw">รหัสผ่าน</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" disabled={loading} onClick={submit}>เข้าสู่ระบบ</Button>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 9: ตรวจด้วยตนเอง**

Run: `npm run dev` → เปิด `/admin` (ยังไม่ล็อกอิน) → redirect ไป `/admin/login`; กรอกรหัสถูก (`ADMIN_PASSWORD`) → ไป `/admin` (404 จนกว่าจะทำ Task 10)
```bash
curl -s -i http://localhost:3000/api/responses   # ไม่มี cookie → 401
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add admin auth with Next 16 proxy, login/logout routes"
```

---

### Task 10: หน้าแอดมิน — สรุป + ตาราง + รายบุคคล

**Files:**
- Create: `src/lib/stats.ts`, `src/lib/stats.test.ts`, `src/app/admin/page.tsx`, `src/app/admin/responses/[id]/page.tsx`, `src/components/admin/logout-button.tsx`

**Interfaces:**
- Consumes: `prisma`, `LIKERT_SECTIONS`, `SUS_ITEMS`, `OPEN_QUESTIONS`, `ROLE_OPTIONS`
- Produces: `mean(nums): number`; หน้า `/admin` (การ์ดสรุป + ค่าเฉลี่ย Likert + ตาราง), `/admin/responses/[id]` (รายละเอียด)

- [ ] **Step 1: เทสต์ `mean` ให้ fail**

Create `src/lib/stats.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mean } from "./stats";

describe("mean", () => {
  it("เฉลี่ยปกติ", () => expect(mean([2, 4])).toBe(3));
  it("อาเรย์ว่าง → 0", () => expect(mean([])).toBe(0));
});
```

- [ ] **Step 2: รันให้ fail** — Run: `npx vitest run src/lib/stats.test.ts` → Expected: FAIL

- [ ] **Step 3: `src/lib/stats.ts`**

```ts
export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
```

- [ ] **Step 4: รันให้ผ่าน** — Run: `npx vitest run src/lib/stats.test.ts` → Expected: PASS

- [ ] **Step 5: หน้า `/admin`**

Create `src/app/admin/page.tsx`:
```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { mean } from "@/lib/stats";
import { LIKERT_SECTIONS, ROLE_OPTIONS } from "@/lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [responses, likertRows] = await Promise.all([
    prisma.response.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.answer.groupBy({ by: ["questionKey"], _avg: { value: true }, where: { value: { not: null } } }),
  ]);

  const total = responses.length;
  const susAvg = mean(responses.map((r) => r.susScore));
  const roleLabel = (v: string) => ROLE_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const avgByKey = new Map(likertRows.map((r) => [r.questionKey, r._avg.value ?? 0]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">แดชบอร์ดผู้ดูแล</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><a href="/api/admin/export">ดาวน์โหลด CSV</a></Button>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">จำนวนผู้ตอบ</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{total}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">SUS เฉลี่ย</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{susAvg.toFixed(1)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">แยกตามบทบาท</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {ROLE_OPTIONS.map((o) => (
              <div key={o.value} className="flex justify-between"><span>{o.label}</span><span>{responses.filter((r) => r.role === o.value).length}</span></div>
            ))}
          </CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>ค่าเฉลี่ย Likert รายข้อ</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {LIKERT_SECTIONS.map((s) => (
            <div key={s.key}>
              <p className="mb-2 font-medium">{s.title}</p>
              <div className="space-y-1 text-sm">
                {s.items.map((it) => (
                  <div key={it.key} className="flex justify-between border-b py-1">
                    <span className="truncate pr-4">{it.th}</span>
                    <span className="tabular-nums">{(avgByKey.get(it.key) ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>รายการคำตอบ</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โค้ด</TableHead><TableHead>บทบาท</TableHead><TableHead>SUS</TableHead><TableHead>เวลา</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.code}</TableCell>
                  <TableCell><Badge variant="secondary">{roleLabel(r.role)}</Badge></TableCell>
                  <TableCell className="tabular-nums">{r.susScore.toFixed(1)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleString("th-TH")}</TableCell>
                  <TableCell><Link className="text-primary underline" href={`/admin/responses/${r.id}`}>ดู</Link></TableCell>
                </TableRow>
              ))}
              {total === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">ยังไม่มีคำตอบ</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 6: ปุ่ม logout**

Create `src/components/admin/logout-button.tsx`:
```tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={async () => {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    }}>ออกจากระบบ</Button>
  );
}
```

- [ ] **Step 7: หน้ารายบุคคล (params เป็น Promise — Next 16)**

Create `src/app/admin/responses/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LIKERT_SECTIONS, SUS_ITEMS, OPEN_QUESTIONS, ROLE_OPTIONS } from "@/lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ResponseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.response.findUnique({ where: { id }, include: { answers: true } });
  if (!r) notFound();

  const val = new Map(r.answers.map((a) => [a.questionKey, a]));
  const roleLabel = ROLE_OPTIONS.find((o) => o.value === r.role)?.label ?? r.role;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Button asChild variant="outline" className="mb-4"><Link href="/admin">← กลับ</Link></Button>
      <Card className="mb-4">
        <CardHeader><CardTitle>คำตอบของ {r.code}</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>บทบาท: {roleLabel}</p>
          <p>ช่วงอายุ: {r.ageBand}</p>
          {r.field && <p>สาขา/หน่วยงาน: {r.field}</p>}
          {r.experience && <p>ประสบการณ์: {r.experience}</p>}
          <p>คะแนน SUS: <b>{r.susScore.toFixed(1)}</b></p>
        </CardContent>
      </Card>

      {LIKERT_SECTIONS.map((s) => (
        <Card key={s.key} className="mb-4">
          <CardHeader><CardTitle className="text-base">{s.title}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {s.items.map((it) => (
              <div key={it.key} className="flex justify-between border-b py-1">
                <span className="truncate pr-4">{it.th}</span>
                <span className="tabular-nums">{val.get(it.key)?.value ?? "-"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-base">SUS</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          {SUS_ITEMS.map((it) => (
            <div key={it.key} className="flex justify-between border-b py-1">
              <span className="truncate pr-4">{it.th}</span>
              <span className="tabular-nums">{val.get(it.key)?.value ?? "-"}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">คำตอบปลายเปิด</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {OPEN_QUESTIONS.map((q) => (
            <div key={q.key}>
              <p className="font-medium">{q.th}</p>
              <p className="text-muted-foreground">{val.get(q.key)?.text ?? "-"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 8: ตรวจด้วยตนเอง**

Run: `npm run dev` → ล็อกอิน → `/admin` เห็นสรุป + ค่าเฉลี่ย Likert + ตาราง → คลิก "ดู" → รายละเอียด → "ออกจากระบบ"
Run: `npm run build` → Expected: build ผ่าน

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add admin dashboard, per-response detail, stats helper"
```

---

### Task 11: Export CSV (`/api/admin/export`) — TDD ตัวสร้าง CSV

**Files:**
- Create: `src/lib/csv.ts`, `src/lib/csv.test.ts`, `src/app/api/admin/export/route.ts`

**Interfaces:**
- Consumes: `prisma`, `LIKERT_KEYS`, `SUS_KEYS`, `OPEN_KEYS`
- Produces: `toCsv(headers: string[], rows: (string|number)[][]): string`; route `GET /api/admin/export` → CSV (UTF-8 + BOM)

- [ ] **Step 1: เทสต์ `toCsv` ให้ fail**

Create `src/lib/csv.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("หัวตาราง + แถว", () => expect(toCsv(["a", "b"], [[1, "x"]])).toBe("a,b\r\n1,x"));
  it("escape comma/quote", () => {
    expect(toCsv(["a"], [["x,y"]])).toBe('a\r\n"x,y"');
    expect(toCsv(["a"], [['he said "hi"']])).toBe('a\r\n"he said ""hi"""');
  });
});
```

- [ ] **Step 2: รันให้ fail** — Run: `npx vitest run src/lib/csv.test.ts` → Expected: FAIL

- [ ] **Step 3: `src/lib/csv.ts`**

```ts
function cell(v: string | number): string {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(cell).join(",")];
  for (const r of rows) lines.push(r.map(cell).join(","));
  return lines.join("\r\n");
}
```

- [ ] **Step 4: รันให้ผ่าน** — Run: `npx vitest run src/lib/csv.test.ts` → Expected: PASS

- [ ] **Step 5: route**

Create `src/app/api/admin/export/route.ts`:
```ts
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { LIKERT_KEYS, SUS_KEYS, OPEN_KEYS } from "@/lib/questions";

export async function GET() {
  const responses = await prisma.response.findMany({ orderBy: { createdAt: "asc" }, include: { answers: true } });

  const answerCols = [...LIKERT_KEYS, ...SUS_KEYS, ...OPEN_KEYS];
  const headers = ["id", "code", "role", "ageBand", "field", "experience", "susScore", "createdAt", ...answerCols];

  const rows = responses.map((r) => {
    const map = new Map(r.answers.map((a) => [a.questionKey, a.value ?? a.text ?? ""]));
    return [
      r.id, r.code, r.role, r.ageBand, r.field ?? "", r.experience ?? "",
      r.susScore, r.createdAt.toISOString(),
      ...answerCols.map((k) => map.get(k) ?? ""),
    ];
  });

  const csv = "﻿" + toCsv(headers, rows); // BOM ให้ Excel อ่านไทยได้
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thesis-form-responses.csv"`,
    },
  });
}
```

- [ ] **Step 6: ตรวจด้วยตนเอง**

Run: `npm run dev` → ล็อกอิน → `/admin` กด "ดาวน์โหลด CSV" → เปิดใน Excel เห็นภาษาไทยถูกต้อง + 1 แถวต่อผู้ตอบ ครบทุกคอลัมน์

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add CSV export endpoint with UTF-8 BOM"
```

---

### Task 12: Vercel deploy config + README

**Files:**
- Modify: `advisor-form/package.json` (เพิ่ม `postinstall: prisma generate`)
- Create: `advisor-form/.env.example`, `advisor-form/README.md`

**Interfaces:**
- Produces: ตั้งค่าให้ deploy บน Vercel + Neon Postgres ได้ + คู่มือ

- [ ] **Step 1: `postinstall` ให้ Vercel generate Prisma client**

ใน `advisor-form/package.json` เพิ่มสคริปต์ (client ถูก git-ignore ที่ `src/generated/prisma` จึงต้อง generate ทุก build; Vercel รัน `postinstall` หลัง `npm install`):
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
(รวมกับสคริปต์เดิม `dev`/`build`/`start`/`lint`/`test`/`test:watch` — อย่าลบของเดิม)

- [ ] **Step 2: `.env.example`**

Create `advisor-form/.env.example`:
```
# Neon Postgres — pooled connection string สำหรับ runtime
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require"
ADMIN_PASSWORD="change-me-admin"
COOKIE_SECRET="change-me-long-random-secret"
```

- [ ] **Step 3: `README.md` (ส่วน deploy)**

````markdown
## Deploy (Vercel + Neon Postgres)

1. สร้าง Postgres บน NeonDB → คัดลอก **pooled** connection string
2. Vercel → Import Git repo (Root Directory = `advisor-form`), ตั้ง Environment Variables:
   `DATABASE_URL`, `ADMIN_PASSWORD`, `COOKIE_SECRET`
3. Build บน Vercel รัน `postinstall` (`prisma generate`) แล้ว `next build` อัตโนมัติ
4. สร้าง/อัปเดตตารางบน Neon (ครั้งแรกหรือเมื่อ schema เปลี่ยน) จากเครื่องที่ตั้ง `DATABASE_URL` แล้ว:
   ```bash
   npx prisma migrate deploy      # prod — หรือ `npx prisma migrate dev --name init` ตอน dev
   ```

- `src/generated/prisma` และ `.env*` ถูก git-ignore (client regenerate ทุก build)
- `proxy.ts` (Next 16 nodejs runtime) และหน้า admin `force-dynamic` ทำงานบน Vercel ได้
- ถ้า `migrate` ติดปัญหากับ pooled URL: ใช้ **unpooled** connection string ของ Neon เป็น `DATABASE_URL` เฉพาะตอนรัน migrate (หรือกำหนด `directUrl` ตามเอกสาร Prisma 7)
````

- [ ] **Step 4: ตรวจ build + test ครบ (ออฟไลน์ ไม่ต้องต่อ DB)**

Run: `npm run build` → Expected: build ผ่าน (Prisma client generated แล้ว; หน้า admin `force-dynamic` ไม่ต่อ DB ตอน build)
Run: `npm run test` → Expected: PASS ทุกไฟล์ (questions, sus, validation, responses, auth, stats, csv)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add Vercel deploy config (postinstall prisma generate), env example, README"
```

---

## Self-Review (ตรวจแผนเทียบ spec + Next 16)

**Spec coverage:**
- §1 สถาปัตยกรรม/โครงหน้า → Task 1,6,7,8,9,10,11 (paths `src/`) ✓
- §2 Data model → Task 2 ✓
- §3 คำถาม + SUS → Task 3,4 ✓
- §4 wizard + draft + validation + ส่งครั้งเดียว → Task 5,7,8 ✓
- §5 แอดมิน + สรุป + CSV → Task 9,10,11 ✓
- §6 design system (ม่วง/shadcn/ฟอนต์ไทย, Tailwind v4) → Task 1 + ทุก UI task ✓
- §7 testing → TDD Task 3,4,5,6,9,10,11 + manual E2E Task 8 ✓
- §8 deploy Vercel → Task 12 ✓

**Next 16 compliance:** middleware → `src/proxy.ts`/`proxy` (Task 9) · `params` เป็น Promise + await (Task 10) · route handler `req.json()` + `NextResponse` (Task 6,9) · Turbopack default / ไม่มี `next lint` (Task 1,12) · Tailwind v4 theme ใน globals.css (Task 1) ✓

**Placeholder scan:** ข้อความ `th` ใน `src/lib/questions.ts` เป็น placeholder โดยตั้งใจ (dependency ที่ documented) ไม่ใช่ TODO ในโค้ด logic; ทุก step มีโค้ด/คำสั่งจริง

**Type consistency:** `SurveyPayload` (Task 5) ใช้ตรงกันใน Task 6,8 · `scoreSus(Record)` (Task 4) เรียกใน Task 6 · `SESSION_COOKIE`/`makeSessionToken`/`verifySessionToken` (Task 9) ใช้ตรงกันใน route + proxy · question keys คงที่ใช้ร่วมทุก task ✓

**หมายเหตุ dependency:** ก่อน production เจ้าของงานต้องแทนข้อความ placeholder ใน `src/lib/questions.ts` ด้วยข้อความไทยจริงจาก PDF และยืนยันตัวเลือก demographics
