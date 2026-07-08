This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
