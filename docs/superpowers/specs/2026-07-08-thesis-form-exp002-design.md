# Design Spec — thesis-form (แบบประเมิน ThesisFlow / EXP002)

วันที่: 2026-07-08
สถานะ: อนุมัติดีไซน์แล้ว รอเขียนแผน implementation

## Context (ทำไมถึงสร้าง)

`thesis-form` แปลงเครื่องมือวิจัยกระดาษ **EXP002 rev.1** (ไฟล์ `2569-EXP002_rv1_instr.pdf`)
ให้เป็นเว็บฟอร์มเก็บข้อมูลออนไลน์ ใช้ประเมินระบบ **"ThesisFlow"** (แพลตฟอร์มจัดการวิทยานิพนธ์
ที่มี AI ช่วย ตามกระบวนการวิจัย 7 ขั้น P1–P7) โดยผู้ตอบ (นักศึกษา / อาจารย์ที่ปรึกษา / กรรมการ)
เข้าทำแบบประเมินผ่าน **โค้ดที่ระบบภายนอกออกให้** แล้วให้คะแนน ThesisFlow

ปัญหาที่แก้: แทนกระดาษด้วยฟอร์มออนไลน์ เก็บข้อมูลเข้าฐานข้อมูล คิดคะแนน SUS อัตโนมัติ
และให้เจ้าของงานดูสรุป + ดึงข้อมูลไปวิเคราะห์ได้

> หมายเหตุสำคัญ: ข้อความคำถามภาษาไทยฉบับจริงอยู่ใน PDF เท่านั้น (ฟอนต์ไม่มี Unicode mapping
> จึง extract ไม่ได้) — เจ้าของงานจะส่งข้อความไทยจริงมาแทนที่ placeholder ใน `src/lib/questions.ts`

## Tech stack

- **โปรเจกต์: `advisor-form/`** — Next.js **16** (App Router, `src/` dir) ที่ scaffold ไว้แล้ว
- fullstack ผ่าน **API route handlers เท่านั้น (ไม่ใช้ Server Actions)**
- Prisma + **PostgreSQL (NeonDB)**
- shadcn/ui + **Tailwind v4** (ธีมใน `globals.css` ผ่าน `@theme inline` — ไม่มี `tailwind.config.js`)
- react-hook-form + zod ฝั่ง client → POST เข้า API route
- Vitest สำหรับเทสต์ logic
- Deploy บน **Vercel**

> Next 16 breaking changes ที่ยึดในแผน: middleware → **`src/proxy.ts`** (ฟังก์ชัน `proxy`, runtime nodejs) ·
> `cookies()`/`headers()`/`params`/`searchParams` เป็น async ต้อง `await` · Turbopack เป็น default · `next lint` ถูกลบ

## Decisions (ข้อสรุปจาก brainstorming)

| หัวข้อ | ข้อสรุป |
|--------|---------|
| Access code | ช่องพิมพ์ธรรมดา (label) บันทึกกับคำตอบ — ไม่มีระบบสร้าง/ตรวจโค้ดล่วงหน้า |
| บทบาทผู้ตอบ | ฟอร์มเดียวใช้ร่วมทุกบทบาท (เลือกบทบาทในส่วนข้อมูลทั่วไป) |
| หลังบ้าน | มีหน้าแอดมิน (ล็อกอินรหัสผ่าน) + สรุป SUS/Likert + export CSV |
| ชุดคำถาม | นิยามคงที่ใน seed/config (`src/lib/questions.ts`) — ไม่มี CRUD คำถามใน DB |
| รูปแบบฟอร์ม | multi-step wizard + progress bar |
| กติกา | บังคับข้อปิด (Likert/SUS) ครบ · ปลายเปิดไม่บังคับ · draft ใน localStorage · ส่งครั้งเดียว |
| Data model | Normalized: `Response` (header) + `Answer` (rows) |

YAGNI (ตัดออกโดยตั้งใจ): ไม่มี user table, ไม่มี CRUD คำถาม, ไม่มี resume ผูก DB,
ไม่มีสคริปต์สัมภาษณ์แยกบทบาท (เก็บเฉพาะชุดประเมินเชิงปริมาณ + ปลายเปิด)

## 1) สถาปัตยกรรม + โครงหน้า

```
src/app/
  page.tsx                     หน้าแรก: กรอกโค้ด + เริ่มทำแบบประเมิน
  survey/page.tsx              wizard หลายขั้น (client component)
  thank-you/page.tsx           หน้าขอบคุณหลังส่ง
  admin/
    login/page.tsx             ล็อกอินแอดมิน
    page.tsx                   dashboard: ตารางคำตอบ + สรุป SUS/Likert
    responses/[id]/page.tsx    ดูคำตอบรายบุคคล (params เป็น Promise — await)
  api/
    responses/route.ts         POST บันทึกคำตอบ 1 ชุด / GET (แอดมิน) รายการ
    admin/login/route.ts       POST ตรวจรหัส → ตั้ง cookie
    admin/logout/route.ts      POST ลบ cookie
    admin/export/route.ts      GET ดาวน์โหลด CSV
src/lib/
  prisma.ts                    PrismaClient singleton (กัน hot-reload dev)
  questions.ts                 นิยามคำถามทั้งชุด (config; source of truth)
  sus.ts                       ฟังก์ชันคิดคะแนน SUS
  validation.ts                zod schema (ใช้ร่วม client + api)
  auth.ts                      HMAC session token (ตรวจ cookie แอดมิน)
src/proxy.ts                   [Next 16] ป้องกัน /admin/** และ /api/admin/** (ยกเว้น login) + GET /api/responses
prisma/schema.prisma
```

**แอดมิน auth:** รหัสผ่านเดียวจาก env `ADMIN_PASSWORD` → `/api/admin/login` ตรวจแล้วเซ็ต
httpOnly cookie (HMAC ด้วย `COOKIE_SECRET`) → **`src/proxy.ts`** ป้องกันเส้นทางแอดมิน

## 2) Data model (Prisma)

```prisma
model Response {
  id          String   @id @default(cuid())
  code        String                 // โค้ดที่ผู้ตอบพิมพ์ (label)
  role        String                 // student | advisor | committee
  ageBand     String                 // <40 | 41-50 | 51-60 | >60
  field       String?
  experience  String?
  susScore    Float                  // 0–100 คำนวณตอนบันทึก
  createdAt   DateTime @default(now())
  answers     Answer[]
}

model Answer {
  id          String   @id @default(cuid())
  responseId  String
  response    Response @relation(fields: [responseId], references: [id], onDelete: Cascade)
  questionKey String                 // เช่น "sq_1", "sus_3", "open_1"
  value       Int?                   // Likert/SUS (1–5)
  text        String?                // ปลายเปิด
  @@index([responseId])
  @@index([questionKey])
}
```

- 1 การส่ง = 1 `Response` + หลาย `Answer`
- คิด `susScore` ครั้งเดียวตอนบันทึก เก็บในแถว
- เขียนทั้งชุดใน transaction เดียว (`prisma.$transaction`)
- demographics fields (`field`, `experience`, ฯลฯ) ปรับให้ตรง PDF เมื่อได้ข้อความจริง

## 3) นิยามคำถาม + การคิดคะแนน SUS

`src/lib/questions.ts` เก็บชุดคำถามคงที่ (placeholder ไทยก่อน คุณส่งข้อความจริงมาแทน):

```ts
export const LIKERT_SECTIONS = [
  { key: "sq", title: "คุณภาพระบบและการใช้งาน (System Quality & Usability)", items: [/* 5 ข้อ: sq_1..sq_5 */] },
  { key: "wf", title: "การทำงานและฟังก์ชัน (Workflow & Functionality)",       items: [/* 5 ข้อ: wf_1..wf_5 */] },
  { key: "pu", title: "การรับรู้ประโยชน์ (Perceived Usefulness)",             items: [/* 5 ข้อ: pu_1..pu_5 */] },
  { key: "ss", title: "บริการสนับสนุน (Support Service)",                      items: [/* 3 ข้อ: ss_1..ss_3 */] },
]
export const OPEN_QUESTIONS = [/* open_1..open_3 */]
export const SUS_ITEMS = [/* sus_1..sus_10: th + en, สลับบวก/ลบตามมาตรฐาน */]
```

**Likert:** 5 ระดับ (5 = มากที่สุด … 1 = น้อยที่สุด) รวม 18 ข้อ (5+5+5+3)

**SUS scoring (`lib/sus.ts`, สูตร Brooke):** ข้อคี่ = ค่า − 1 · ข้อคู่ = 5 − ค่า · รวม × 2.5 → 0–100
SUS ใช้ข้อความมาตรฐาน (ไทย + อังกฤษกำกับตาม PDF) — เป็น logic เดียวที่ต้องมี unit test แน่นอน

## 4) Flow ผู้ตอบ (wizard)

ขั้นตอน: **กรอกโค้ด → ข้อมูลทั่วไป → Likert 4 หมวด (ทีละหมวด) → ปลายเปิด → SUS → ทบทวน/ส่ง**

- Progress bar (shadcn `Progress`) + ปุ่มถัดไป/ย้อนกลับ
- Validation ต่อขั้นด้วย zod: ผ่านได้เมื่อข้อปิดในขั้นนั้นครบ · ปุ่ม "ถัดไป" disabled จนกว่าจะครบ
- กันหลุด: บันทึก draft ใน `localStorage` อัตโนมัติ, โหลดกลับเมื่อเปิดใหม่
- ส่งครั้งเดียว: ขั้นสุดท้าย POST `/api/responses` (payload เดียวทั้งชุด) → API ตรวจซ้ำด้วย zod
  (validation.ts เดียวกับ client) → คิด SUS → เขียน `Response`+`Answer` ใน transaction → ล้าง draft → ไป `/thank-you`
- Likert/SUS ใช้ `RadioGroup` 5 ระดับ พร้อมป้ายหัว-ท้ายสเกล

## 5) หน้าแอดมิน + สรุป + CSV

- Dashboard: การ์ดสรุป (จำนวนผู้ตอบ, SUS เฉลี่ย, แยกตามบทบาท) + `Table` รายการคำตอบ
  (โค้ด, บทบาท, SUS, เวลา) กดดูรายบุคคลได้
- สรุปสถิติ: SUS เฉลี่ย/การกระจาย + ค่าเฉลี่ย Likert รายข้อและรายหมวด (Prisma `groupBy`/`aggregate`)
- Export CSV (`/api/admin/export`): 1 แถวต่อผู้ตอบ กาง demographics + ทุกคำตอบ + susScore เป็นคอลัมน์
  encode UTF-8 **พร้อม BOM** ให้ Excel อ่านภาษาไทยถูกต้อง

## 6) Design system (DESIGN.md)

**Source of truth:** `advisor-form/docs/DESIGN.md` เป็นเอกสารอ้างอิงเดียวที่ถือเป็นทางการ (authoritative) สำหรับ **สี, typography, spacing, shape และ components** ทั้งหมดของ ThesisFlow Evaluation System หากส่วนนี้ขัดกับ DESIGN.md ให้ยึด DESIGN.md เสมอ ส่วนด้านล่างเป็นบทสรุปย่อเท่านั้น

### บุคลิกแบรนด์ (Brand personality)
วิชาการ / มืออาชีพ / สร้างความมั่นใจ (academic, professional, reassuring) ในสไตล์ **Corporate + Soft Minimalism** — เว้นพื้นที่ว่างอย่างเอื้อเฟื้อ (generous whitespace) ใช้ภาษาภาพที่นุ่มนวลและมนขอบ

### Palette
- **primary `#6b44b7`** (light violet) / `on-primary #ffffff`; primary-container `#855ed2`; surface-tint `#6e46ba`
- **พื้นหลัง grey-violet tinted `#f8f9fa`** (background-subtle `#fdfcff`) พร้อม **การ์ดสีขาวบริสุทธิ์ `#ffffff`**
- **accent pale-violet `#eaddff`** (primary-fixed) กับ on-primary-fixed `#25005a`, on-primary-fixed-variant `#552ba0`, inverse-primary `#d2bbff`
- neutral greys: surface-container ไล่ระดับ `#f3f4f5 → #e1e3e4`; text-main `#1d2939`, text-muted `#667085`; outline `#7b7484`, border-muted `#e4e7ec`
- secondary `#5d5e68` / secondary-container `#e2e1ed`; tertiary `#725c00`; **error `#ba1a1a`** / error-container `#ffdad6`

### Typography
ฟอนต์ **IBM Plex Sans Thai** (fallback Noto Sans Thai) ตาม modular scale: headline-lg 30/38 600 (mobile 24/32) · headline-md 24/32 600 · headline-sm 20/28 500 · body-lg 18/28 · body-md 16/24 · body-sm 14/20 · label-md 14/20 500 · label-sm 12/16 500 · ข้อความไทยต้องใช้ **line-height 1.5–1.6×** เพื่อไม่ให้ glyph ชนกัน

### Layout & spacing
Wizard จัดกึ่งกลาง **max-width 800px** (gutter 1.5rem); **section-gap 2.5rem**, **element-gap 1rem** บน baseline grid 4/8px; margin บนมือถือ **16px**; admin dashboard ใช้ 12-col fluid grid และตารางเต็มความกว้าง

### Shape
การ์ด/พาเนล **rounded-xl (1.5rem)**; องค์ประกอบ interactive (ปุ่ม, input) **rounded (.5rem)**; progress track และ badge เป็น **pill (full)** — scale: sm .25 · DEFAULT .5 · md .75 · lg 1 · xl 1.5rem

### Elevation
การ์ดอยู่ที่ Level 1 elevation ด้วย **soft diffused shadow (blur 15px, opacity ~5%, primary-tinted)**; ขอบ 1px `border-muted` ที่เปลี่ยนเป็น primary พร้อม **soft outer glow (2px) เมื่อ focus**

### Component rules (สรุป)
- **Multi-step wizard:** progress bar เด่นด้านบน แต่ละ step อยู่ในการ์ดขาวพร้อม fade-in transition
- **Buttons:** Primary = solid light violet + ตัวอักษรขาว (rounded .5rem); Secondary/Back = พื้น pale-violet `#eaddff` + ตัวอักษร dark-violet `#25005a` (หรือ ghost violet border)
- **Likert (radio groups):** desktop เรียง **วงกลม 5 วงแนวนอน** แสดง label เฉพาะปลายทาง — **น้อยที่สุด (Strongly Disagree) ซ้าย … มากที่สุด (Strongly Agree) ขวา** (ไล่ 1→5 ซ้ายไปขวา); mobile ขยายเต็มความกว้างให้แตะง่าย; ตัวเลือกที่เลือกใช้สี primary
- **Data tables (admin):** สะอาด **ไม่มีเส้นขอบแนวตั้ง**, zebra striping บนพื้น neutral, header เข้มขึ้นเล็กน้อย + label ตัวหนา, role badge เป็น pill
- **Input fields (access code / open questions):** ขอบเทาบางที่หนาขึ้นและเปลี่ยนเป็น primary violet เมื่อ focus, label อยู่เหนือ field เสมอ
- **Progress bars:** หนา 8–12px, track เป็น pill, ส่วนที่เติมเป็น solid/gradient primary, อาจ sticky พร้อม backdrop-blur

### shadcn components ที่ใช้
`form, input, radio-group, select, textarea, button, card, progress, table, sonner, label, badge, separator` · Responsive มือถือก่อน (mobile-first)

## 7) การทดสอบ

- Vitest: `sus.ts` (ข้อคี่=5/ข้อคู่=1 → 100 เต็ม · ข้อคี่=1/ข้อคู่=5 → 0 · ตอบ 3 หมด → 50 · ขอบเขต) และ zod validation
- Manual E2E: กรอกจนจบ 1 ชุด → เช็ค DB (Prisma Studio) → ล็อกอินแอดมิน → เห็นสรุป + โหลด CSV เปิดใน Excel อ่านไทยได้

## 8) Deploy บน Vercel

- โฮสต์บน **Vercel** (เชื่อม Git repo → auto-deploy) · ฐานข้อมูล **PostgreSQL บน NeonDB**
- **Prisma generate ตอน build:** เพิ่ม `"postinstall": "prisma generate"` ใน `package.json` เพื่อให้ Vercel สร้าง client (`src/generated/prisma`, git-ignored) ทุก build · build command = `next build` (Turbopack)
- **Env vars** (Vercel Project Settings → Environment Variables): `DATABASE_URL` (Neon **pooled** connection string), `ADMIN_PASSWORD`, `COOKIE_SECRET` — เจ้าของงานใส่เอง
- **Migration:** หลังตั้ง `DATABASE_URL` แล้วรัน `npx prisma migrate deploy` (จากเครื่อง/CI) เพื่อสร้างตารางบน Neon; ระหว่างพัฒนาใช้ `npx prisma migrate dev --name init`
  - Neon แนะนำ pooled URL สำหรับ runtime; ถ้า `migrate` ติดปัญหากับ pooled ให้เพิ่ม `DIRECT_URL` (unpooled) แล้วชี้ `directUrl` ให้ migration
- `proxy.ts` (Next 16, runtime nodejs) ทำงานบน Vercel ได้ · หน้า admin เป็น `force-dynamic` จึงไม่ต่อ DB ตอน build

## Success criteria

1. ผู้ตอบกรอกโค้ด + ทำแบบประเมินครบผ่าน wizard บนมือถือ/เดสก์ท็อป แล้วส่งได้
2. ข้อมูลถูกบันทึกเป็น `Response` + `Answer` พร้อม `susScore` ที่คำนวณถูกต้อง
3. แอดมินล็อกอินได้ เห็นสรุป SUS/Likert และโหลด CSV (Excel อ่านไทยได้)
4. บังคับข้อปิดครบก่อนส่ง · draft กันหลุดทำงาน
5. Deploy บน Vercel ได้ (build ผ่าน · `postinstall: prisma generate` · `migrate deploy` บน Neon)

## Dependencies / open items

- **ข้อความคำถามภาษาไทยจริง** ทุกข้อ (demographics options, Likert 18 ข้อ, ปลายเปิด 3 ข้อ)
  — เจ้าของงานส่งมาแทน placeholder ใน `src/lib/questions.ts`; SUS ใช้ฉบับมาตรฐานไปก่อนได้
- โครงสร้าง demographics ที่แน่นอน (fields + ตัวเลือก) ยืนยันกับ PDF เมื่อได้ข้อความจริง
- โปรเจกต์ยังไม่ scaffold — ขั้นแรกของ implementation คือ `create-next-app` + `shadcn init` + `prisma init`
