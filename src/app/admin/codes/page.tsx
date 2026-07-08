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
